"use client";

/**
 * v2 App Shell — Layout wrapper with v2 Sidebar, Header, and mobile bottom tabs.
 *
 * Drop-in replacement for AppShell. Swap import path to activate v2 layout.
 */

import { useEffect, useRef } from "react";
import { V2Sidebar } from "./V2Sidebar";
import { V2Header, type V2HeaderProps } from "./V2Header";
import { V2BottomTabs } from "./V2BottomTabs";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { LandscapeLock } from "@/components/layout/LandscapeLock";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useChatStore } from "@/stores/chat-store";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan } from "@/lib/plan-limits";
import { AnimatePresence, motion } from "framer-motion";

export function V2Shell({
  title,
  children,
  monthRange,
  onMonthRangeChange,
  totalMonths,
}: {
  title?: string;
  children: React.ReactNode;
  monthRange?: [number, number] | null;
  onMonthRangeChange?: (range: [number, number] | null) => void;
  totalMonths?: number;
}) {
  const isMobile = useIsMobile();
  const aiOpen = useChatStore((s) => s.isOpen);
  const toggleAI = useChatStore((s) => s.togglePanel);
  const upgradeModal = useUpgradeStore();
  const { profile, loading: profileLoading } = useProfile();
  const shownExpiredRef = useRef(false);

  // Auto-show expired modal once per browser session
  useEffect(() => {
    if (profileLoading || !profile || shownExpiredRef.current) return;
    if (!isActivePlan(profile.plan)) {
      shownExpiredRef.current = true;
      const key = "rm_expired_shown";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        useUpgradeStore.getState().showExpiredModal();
      }
    }
  }, [profile, profileLoading]);

  return (
    <div
      className="flex min-h-[100dvh] bg-[#eef0f6] overflow-x-hidden max-w-[100vw] gap-0 md:gap-2 p-0 md:p-2"
      style={{
        paddingTop: isMobile ? "env(safe-area-inset-top)" : "8px",
        paddingLeft: isMobile ? "env(safe-area-inset-left)" : "8px",
        paddingRight: isMobile ? "env(safe-area-inset-right)" : "8px",
        paddingBottom: isMobile ? undefined : "8px",
      }}
    >
      <LandscapeLock />
      <V2Sidebar />

      <div className="flex-1 flex flex-col h-[100dvh] md:h-[calc(100dvh-1rem)] min-w-0 md:rounded-2xl md:overflow-hidden bg-[#f8f9fc]">
        <V2Header
          title={title}
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          totalMonths={totalMonths}
        />

        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* Main content */}
          <div
            className="flex-1 min-w-0 overflow-y-auto"
            style={{
              paddingBottom: isMobile
                ? "calc(3.5rem + env(safe-area-inset-bottom))"
                : undefined,
            }}
          >
            {children}
          </div>

          {/* Desktop AI panel — overlay so it doesn't squeeze dashboard */}
          {!isMobile && aiOpen && (
            <div className="absolute right-0 top-0 bottom-0 z-30">
              <AIChatPanel />
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom tabs */}
      {isMobile && <V2BottomTabs />}

      {/* Floating AI FAB — desktop only (mobile uses bottom tab) */}
      {!isMobile && !aiOpen && (
        <button
          onClick={toggleAI}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#2163E7] text-white shadow-lg shadow-[#2163E7]/30 hover:bg-[#1650b0] hover:shadow-xl hover:shadow-[#2163E7]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center"
          title="AI Assistant"
          aria-label="Open AI Assistant"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.09 8.26L21 9.27L16 13.14L16.18 20.02L12 17.77L7.82 20.02L8 13.14L3 9.27L9.91 8.26L12 2Z" />
          </svg>
        </button>
      )}

      {/* Mobile AI fullscreen overlay */}
      <AnimatePresence>
        {isMobile && aiOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <AIChatPanel fullscreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade modal */}
      <UpgradeModal
        open={upgradeModal.open}
        onClose={upgradeModal.closeUpgradeModal}
        mode={upgradeModal.mode}
        feature={upgradeModal.feature}
        currentPlan={upgradeModal.currentPlan}
        limitValue={upgradeModal.limitValue}
      />

      {/* Expired plan banner */}
      {!profileLoading && profile && !isActivePlan(profile.plan) && (
        <div
          className="fixed left-0 right-0 z-[60] bg-[#F59E0B] text-white text-center py-2 px-4"
          style={{ bottom: isMobile ? "calc(3.5rem + env(safe-area-inset-bottom))" : "0" }}
        >
          <p className="text-[12px] font-bold">
            Your plan has expired — your data is safe but editing is disabled.{" "}
            <button
              onClick={() => useUpgradeStore.getState().showExpiredModal()}
              className="underline hover:no-underline"
            >
              Resubscribe
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

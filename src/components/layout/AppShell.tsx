"use client";

import { useEffect, useRef } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { LandscapeLock } from "./LandscapeLock";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useChatStore } from "@/stores/chat-store";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan } from "@/lib/plan-limits";
import { AnimatePresence, motion } from "framer-motion";

export function AppShell({
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

  // Auto-show expired modal once per browser session (not on tab switch)
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
    <div className="flex min-h-[100dvh] bg-[#F8F8FC] overflow-x-hidden max-w-[100vw]" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}>
      <LandscapeLock />
      <AppSidebar />
      <div className="flex-1 flex flex-col h-[100dvh] min-w-0">
        <AppHeader
          title={title}
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          totalMonths={totalMonths}
        />
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
          {!isMobile && aiOpen && (
            <div className="h-full shrink-0">
              <AIChatPanel />
            </div>
          )}
        </div>
      </div>

      {/* Floating AI FAB — bottom right */}
      {!aiOpen && (
        <button
          onClick={toggleAI}
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#2163E7] text-white shadow-lg shadow-[#2163E7]/30 hover:bg-[#4A6DE0] hover:shadow-xl hover:shadow-[#2163E7]/40 transition-all flex items-center justify-center"
          title="AI Assistant"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Upgrade modal — triggered from anywhere via useUpgradeStore */}
      <UpgradeModal
        open={upgradeModal.open}
        onClose={upgradeModal.closeUpgradeModal}
        mode={upgradeModal.mode}
        feature={upgradeModal.feature}
        currentPlan={upgradeModal.currentPlan}
        limitValue={upgradeModal.limitValue}
      />

      {/* Expired/free plan read-only banner */}
      {!profileLoading && profile && !isActivePlan(profile.plan) && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#F59E0B] text-white text-center py-2 px-4">
          <p className="text-sm font-bold">
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

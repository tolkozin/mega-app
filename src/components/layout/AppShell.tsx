"use client";

import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { LandscapeLock } from "./LandscapeLock";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useChatStore } from "@/stores/chat-store";
import { useUpgradeStore } from "@/stores/upgrade-store";
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


  return (
    <div className="flex min-h-screen bg-[#F8F8FC]" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}>
      <LandscapeLock />
      <AppSidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0">
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
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#5E81F4] text-white shadow-lg shadow-[#5E81F4]/30 hover:bg-[#4A6DE0] hover:shadow-xl hover:shadow-[#5E81F4]/40 transition-all flex items-center justify-center"
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
        feature={upgradeModal.feature}
        currentPlan={upgradeModal.currentPlan}
        limitValue={upgradeModal.limitValue}
      />
    </div>
  );
}

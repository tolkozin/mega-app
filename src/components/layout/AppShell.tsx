"use client";

import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { LandscapeLock } from "./LandscapeLock";
import { useIsMobile, useIsDesktop } from "@/hooks/useMediaQuery";
import { useChatStore } from "@/stores/chat-store";
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
  const isDesktop = useIsDesktop();
  const aiOpen = useChatStore((s) => s.isOpen);

  return (
    <div className="flex min-h-screen bg-[#F8F8FC]" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}>
      <LandscapeLock />
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <AppHeader
          title={title}
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          totalMonths={totalMonths}
        />
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0">{children}</div>
          {!isMobile && aiOpen && <AIChatPanel />}
        </div>
      </div>
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
    </div>
  );
}

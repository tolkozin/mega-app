"use client";

import { useLayoutStore } from "@/stores/layout-store";
import { AnimatePresence, motion } from "framer-motion";

export function MobileConfigDrawer({ children }: { children: React.ReactNode }) {
  const open = useLayoutStore((s) => s.configDrawerOpen);
  const setOpen = useLayoutStore((s) => s.setConfigDrawerOpen);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <motion.aside
            className="fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-background shadow-xl overflow-y-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-sm font-semibold">Configuration</span>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-[#8181A5]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

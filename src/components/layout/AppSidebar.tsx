"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutStore } from "@/stores/layout-store";
import { useIsMobile, useIsDesktop } from "@/hooks/useMediaQuery";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="8" rx="1.5" />
        <rect x="11" y="2" width="7" height="5" rx="1.5" />
        <rect x="2" y="12" width="7" height="6" rx="1.5" />
        <rect x="11" y="9" width="7" height="9" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
      </svg>
    ),
  },
  {
    href: "/plans",
    label: "Plans",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.3L12 14.5 7.1 17l.9-5.3-4-3.9 5.5-.8z" transform="translate(-2,-1)" />
      </svg>
    ),
  },
  {
    href: "/invoices",
    label: "Invoices",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M12 2v4h4" />
        <path d="M7 10h6M7 13h4" />
      </svg>
    ),
  },
];

function SidebarContent({ expanded, onClose }: { expanded: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo + close button */}
      <div className="mb-6 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <img src="/logo.svg" alt="Revenue Map" className="w-9 h-9 shrink-0" />
          {expanded && <span className="text-white font-bold text-sm whitespace-nowrap">Revenue Map</span>}
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] active:bg-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={onClose}
              className={`h-[52px] md:h-10 rounded-lg flex items-center gap-3 px-2.5 transition-colors ${
                isActive
                  ? "bg-[#5E81F4] text-white"
                  : "text-[#8181A5] hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="shrink-0 w-5 flex items-center justify-center">{item.icon}</span>
              {expanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings */}
      <div className="px-3">
        <Link
          href="/settings"
          title="Settings"
          onClick={onClose}
          className="h-[52px] md:h-10 rounded-lg flex items-center gap-3 px-2.5 text-[#8181A5] hover:text-white hover:bg-white/10 transition-colors"
        >
          <span className="shrink-0 w-5 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.325 2.317a1 1 0 011.35 0l.588.534a1 1 0 00.849.253l.78-.153a1 1 0 011.156.675l.231.758a1 1 0 00.586.586l.758.231a1 1 0 01.675 1.156l-.153.78a1 1 0 00.253.849l.534.588a1 1 0 010 1.35l-.534.588a1 1 0 00-.253.849l.153.78a1 1 0 01-.675 1.156l-.758.231a1 1 0 00-.586.586l-.231.758a1 1 0 01-1.156.675l-.78-.153a1 1 0 00-.849.253l-.588.534a1 1 0 01-1.35 0l-.588-.534a1 1 0 00-.849-.253l-.78.153a1 1 0 01-1.156-.675l-.231-.758a1 1 0 00-.586-.586l-.758-.231a1 1 0 01-.675-1.156l.153-.78a1 1 0 00-.253-.849l-.534-.588a1 1 0 010-1.35l.534-.588a1 1 0 00.253-.849l-.153-.78a1 1 0 01.675-1.156l.758-.231a1 1 0 00.586-.586l.231-.758a1 1 0 011.156-.675l.78.153a1 1 0 00.849-.253l.588-.534z" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
          </span>
          {expanded && <span className="text-sm whitespace-nowrap">Settings</span>}
        </Link>
      </div>
    </>
  );
}

export function AppSidebar() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const expanded = useLayoutStore((s) => s.navSidebarExpanded);
  const hidden = useLayoutStore((s) => s.navSidebarHidden);
  const setHidden = useLayoutStore((s) => s.setNavSidebarHidden);
  const mobileOpen = useLayoutStore((s) => s.navSidebarMobileOpen);
  const setMobileOpen = useLayoutStore((s) => s.setNavSidebarMobileOpen);

  // Mobile: overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[39] bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 z-40 h-full w-[280px] bg-[#0F172A] border-r border-[#1E293B] flex flex-col items-stretch py-5"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ paddingTop: "max(20px, env(safe-area-inset-top))" }}
            >
              <SidebarContent expanded onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: hidden — show a small toggle tab on left edge
  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed top-1/2 -translate-y-1/2 left-0 z-30 w-5 h-12 bg-[#1C1D21] rounded-r-lg flex items-center justify-center text-[#8181A5] hover:text-white hover:w-6 transition-all"
        title="Show sidebar"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </button>
    );
  }

  // Desktop: collapsible (64px ↔ 200px)
  const width = isDesktop && expanded ? "w-[200px]" : "w-[64px]";

  return (
    <aside
      className={`${width} min-h-screen bg-[#1C1D21] flex flex-col items-stretch py-5 shrink-0 transition-[width] duration-300 hidden md:flex`}
    >
      <SidebarContent expanded={isDesktop && expanded} />

      {/* Hide sidebar button */}
      <div className="px-3 mt-2">
        <button
          onClick={() => setHidden(true)}
          className="w-full h-8 rounded-lg flex items-center justify-center text-[#8181A5] hover:text-white hover:bg-white/10 transition-colors"
          title="Hide sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

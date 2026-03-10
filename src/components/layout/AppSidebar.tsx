"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatStore } from "@/stores/chat-store";
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

function SidebarContent({ expanded }: { expanded: boolean }) {
  const pathname = usePathname();
  const toggleAI = useChatStore((s) => s.togglePanel);
  const aiOpen = useChatStore((s) => s.isOpen);

  return (
    <>
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-3">
        <img src="/logo.svg" alt="Revenue Map" className="w-9 h-9 shrink-0" />
        {expanded && <span className="text-white font-bold text-sm whitespace-nowrap">Revenue Map</span>}
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-2 flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`h-10 rounded-lg flex items-center gap-3 px-2.5 transition-colors ${
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

      {/* AI Assistant */}
      <div className="px-3">
        <button
          onClick={toggleAI}
          title="AI Assistant"
          className={`w-full h-10 rounded-lg flex items-center gap-3 px-2.5 transition-colors ${
            aiOpen
              ? "bg-[#5E81F4] text-white"
              : "text-[#8181A5] hover:text-white hover:bg-white/10"
          }`}
        >
          <span className="shrink-0 w-5 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.18 18.02L10 15.77L5.82 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" />
            </svg>
          </span>
          {expanded && <span className="text-sm whitespace-nowrap">AI Assistant</span>}
        </button>
      </div>

      {/* Bottom: settings */}
      <div className="px-3">
        <Link
          href="/settings"
          title="Settings"
          className="h-10 rounded-lg flex items-center gap-3 px-2.5 text-[#8181A5] hover:text-white hover:bg-white/10 transition-colors"
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
  const toggleExpand = useLayoutStore((s) => s.toggleNavSidebar);
  const mobileOpen = useLayoutStore((s) => s.navSidebarMobileOpen);
  const setMobileOpen = useLayoutStore((s) => s.setNavSidebarMobileOpen);

  // Mobile: overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[39] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 z-40 h-full w-[200px] bg-[#1C1D21] flex flex-col items-stretch py-5"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <SidebarContent expanded />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: collapsible (64px ↔ 200px)
  const width = isDesktop && expanded ? "w-[200px]" : "w-[64px]";

  return (
    <aside
      className={`${width} min-h-screen bg-[#1C1D21] flex flex-col items-stretch py-5 shrink-0 transition-[width] duration-300 hidden md:flex`}
    >
      <SidebarContent expanded={isDesktop && expanded} />

      {/* Expand/collapse toggle — desktop only */}
      {isDesktop && (
        <div className="px-3 mt-2">
          <button
            onClick={toggleExpand}
            className="w-full h-8 rounded-lg flex items-center justify-center text-[#8181A5] hover:text-white hover:bg-white/10 transition-colors"
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}

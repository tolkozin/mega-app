"use client";

/**
 * v2 Sidebar — Dark sidebar matching Figma Make design.
 *
 * Responsive behavior:
 *  - Desktop (≥1024): Collapsible (240px ↔ 72px), can be hidden
 *  - Tablet (768–1023): Overlay sidebar with backdrop
 *  - Mobile (<768): Hidden — replaced by bottom tab bar (see V2BottomTabs)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutStore } from "@/stores/layout-store";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { AnimatePresence, motion } from "framer-motion";
import { useChatStore } from "@/stores/chat-store";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

/* ─── Nav Items ─── */

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="6" height="7" rx="1.5" />
        <rect x="10" y="2" width="6" height="4.5" rx="1.5" />
        <rect x="2" y="11" width="6" height="5" rx="1.5" />
        <rect x="10" y="8.5" width="6" height="7.5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Projects",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 5a2 2 0 012-2h3.5l2 2H14a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
      </svg>
    ),
  },
  {
    href: "/plans",
    label: "Plans",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1.5l2.3 4.6 5.1.7-3.7 3.6.9 5.1L9 13.2l-4.6 2.3.9-5.1L1.6 6.8l5.1-.7z" />
      </svg>
    ),
  },
  {
    href: "/billing",
    label: "Billing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h7l3.5 3.5V15a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M11 2v3.5H14.5" />
        <path d="M6 9h6M6 12h4" />
      </svg>
    ),
  },
];

const BOTTOM_ITEMS = [
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
        <circle cx="11" cy="11" r="3" />
      </svg>
    ),
  },
];

/* ─── Sidebar Content ─── */

function SidebarContent({
  expanded,
  onClose,
  onOpenAI,
}: {
  expanded: boolean;
  onClose?: () => void;
  onOpenAI?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { profile } = useProfile();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname?.startsWith("/dashboard");
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full font-lato">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#2163E7] to-[#1650b0] flex items-center justify-center shadow-[0_4px_14px_rgba(33,99,231,0.45)] shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="8" width="2.5" height="6" rx="1" fill="white" fillOpacity="0.8" />
              <rect x="6.5" y="4.5" width="2.5" height="9.5" rx="1" fill="white" />
              <rect x="11.5" y="1.5" width="2.5" height="12.5" rx="1" fill="white" fillOpacity="0.6" />
            </svg>
          </div>
          {expanded && (
            <div className="min-w-0">
              <div className="text-[13.5px] font-extrabold text-white leading-tight tracking-[-0.01em]">
                Revenue Map
              </div>
              <div className="text-[10px] font-medium text-white/30 mt-px">Analytics</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav section */}
      <nav className="flex-1 px-3 pt-4 overflow-y-auto">
        {expanded && (
          <div className="text-[9.5px] font-bold text-white/25 tracking-[0.1em] uppercase px-3 pb-2.5">
            Main
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose} title={item.label}>
                <motion.div
                  whileHover={{ x: active ? 0 : 2 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center gap-2.5 rounded-[10px] transition-colors duration-200 ${
                    expanded ? "px-3 py-2.5" : "px-2.5 py-2.5 justify-center"
                  } ${
                    active
                      ? "bg-[#2163E7] text-white"
                      : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <span className={`shrink-0 ${active ? "text-white" : ""}`} style={{ strokeWidth: active ? 2 : 1.5 }}>
                    {item.icon}
                  </span>
                  {expanded && (
                    <span className={`text-[13px] flex-1 ${active ? "font-bold" : "font-medium"}`}>
                      {item.label}
                    </span>
                  )}
                  {expanded && active && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/50">
                      <path d="M4 2l4 4-4 4" />
                    </svg>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06] mx-3 my-4" />

        {/* AI Assistant */}
        <button
          onClick={() => { onOpenAI?.(); onClose?.(); }}
          className={`w-full flex items-center gap-2.5 rounded-[10px] text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors duration-200 ${
            expanded ? "px-3 py-2.5" : "px-2.5 py-2.5 justify-center"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M12 2L13.6 7.4L18 8.2L14.5 11.5L15.3 16L12 14.2L8.7 16L9.5 11.5L6 8.2L10.4 7.4Z" transform="translate(-3,-1)" />
          </svg>
          {expanded && (
            <>
              <span className="text-[13px] font-medium flex-1 text-left">AI Assistant</span>
              <span className="bg-[#2163E7]/35 text-[#7BA3F0] rounded-full px-[7px] py-px text-[9.5px] font-extrabold">
                NEW
              </span>
            </>
          )}
        </button>

        {/* Settings */}
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onClose} title={item.label}>
              <motion.div
                whileHover={{ x: active ? 0 : 2 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-2.5 rounded-[10px] transition-colors duration-200 mt-0.5 ${
                  expanded ? "px-3 py-2.5" : "px-2.5 py-2.5 justify-center"
                } ${
                  active
                    ? "bg-[#2163E7] text-white"
                    : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {expanded && (
                  <span className={`text-[13px] flex-1 ${active ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                )}
                {expanded && active && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/50">
                    <path d="M4 2l4 4-4 4" />
                  </svg>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User avatar — bottom */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7BA3F0] to-[#2163E7] flex items-center justify-center text-[12px] text-white font-extrabold shrink-0">
            {(user?.email?.[0] ?? "U").toUpperCase()}
          </div>
          {expanded && (
            <div className="min-w-0">
              <div className="text-[12.5px] text-white/80 font-bold leading-tight truncate">
                {user?.email?.split("@")[0] ?? "User"}
              </div>
              <div className="text-[10.5px] text-white/30 mt-px truncate">
                {profile?.plan ? `${profile.plan.charAt(0).toUpperCase()}${profile.plan.slice(1)} Plan` : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Export ─── */

export function V2Sidebar() {
  const isMobile = useIsMobile();
  const expanded = useLayoutStore((s) => s.navSidebarExpanded);
  const hidden = useLayoutStore((s) => s.navSidebarHidden);
  const setHidden = useLayoutStore((s) => s.setNavSidebarHidden);
  const mobileOpen = useLayoutStore((s) => s.navSidebarMobileOpen);
  const setMobileOpen = useLayoutStore((s) => s.setNavSidebarMobileOpen);
  const toggleAI = useChatStore((s) => s.togglePanel);

  /* Mobile: bottom tabs handle navigation — sidebar is overlay only */
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
              className="fixed top-0 left-0 z-40 h-full w-[280px] max-w-[85vw] bg-[#1a1a2e] flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ paddingTop: "max(20px, env(safe-area-inset-top))" }}
            >
              <SidebarContent expanded onClose={() => setMobileOpen(false)} onOpenAI={toggleAI} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  /* Desktop: hidden — small toggle tab */
  if (hidden) {
    return (
      <motion.button
        onClick={() => setHidden(false)}
        className="fixed top-1/2 -translate-y-1/2 left-0 z-30 w-5 h-12 bg-[#1a1a2e] rounded-r-lg flex items-center justify-center text-white/40 hover:text-white hover:w-6 transition-all"
        title="Show sidebar"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </motion.button>
    );
  }

  /* Desktop: collapsible (72px ↔ 240px) */
  const width = expanded ? 240 : 72;

  return (
    <motion.aside
      className="hidden md:flex flex-col shrink-0 bg-[#1a1a2e] min-h-screen sticky top-0"
      animate={{ width }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <SidebarContent expanded={expanded} onOpenAI={toggleAI} />

      {/* Collapse / Hide button */}
      <div className="px-3 pb-3 flex gap-1.5">
        <button
          onClick={() => useLayoutStore.getState().toggleNavSidebar()}
          className="flex-1 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <motion.svg
            width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            animate={{ rotate: expanded ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M10 3L5 8l5 5" />
          </motion.svg>
        </button>
        {expanded && (
          <button
            onClick={() => setHidden(true)}
            className="h-8 px-2 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            title="Hide sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        )}
      </div>
    </motion.aside>
  );
}

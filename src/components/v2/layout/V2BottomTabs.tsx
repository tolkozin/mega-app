"use client";

/**
 * v2 Mobile Bottom Tab Bar
 *
 * Replaces the hamburger-based mobile nav from v1.
 * Shows on screens < 768px. Anchored to the bottom with safe area insets.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatStore } from "@/stores/chat-store";

const TABS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7.5" height="9" rx="1.5" />
        <rect x="12.5" y="2" width="7.5" height="5.5" rx="1.5" />
        <rect x="2" y="13" width="7.5" height="7" rx="1.5" />
        <rect x="12.5" y="9.5" width="7.5" height="10.5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Projects",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    ),
  },
  {
    href: "#ai",
    label: "AI",
    isAI: true,
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L14.09 8.26L21 9.27L16 13.14L16.18 20.02L12 17.77L7.82 20.02L8 13.14L3 9.27L9.91 8.26L12 2Z" />
      </svg>
    ),
  },
  {
    href: "/billing",
    label: "Billing",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3h8.5L18 7.5V18a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 18V4.5A1.5 1.5 0 015 3z" />
        <path d="M13.5 3v4.5H18" />
        <path d="M7.5 11h7M7.5 14h5" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
      </svg>
    ),
  },
];

export function V2BottomTabs() {
  const pathname = usePathname();
  const toggleAI = useChatStore((s) => s.togglePanel);
  const aiOpen = useChatStore((s) => s.isOpen);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#eef0f6]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-14">
        {TABS.map((tab) => {
          const isAI = "isAI" in tab && tab.isAI;
          const active = isAI
            ? aiOpen
            : tab.href === "/dashboard"
              ? pathname?.startsWith("/dashboard")
              : pathname?.startsWith(tab.href);

          if (isAI) {
            return (
              <button
                key="ai"
                onClick={toggleAI}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
              >
                <div className={`w-10 h-10 -mt-5 rounded-full flex items-center justify-center shadow-lg ${
                  active
                    ? "bg-[#2163E7] text-white shadow-[#2163E7]/30"
                    : "bg-[#2163E7] text-white shadow-[#2163E7]/20"
                }`}>
                  {tab.icon(!!active)}
                </div>
                <span className={`text-[9px] font-bold mt-0.5 ${
                  active ? "text-[#2163E7]" : "text-[#9ca3af]"
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              <span className={active ? "text-[#2163E7]" : "text-[#c4c9d8]"}>
                {tab.icon(!!active)}
              </span>
              <span className={`text-[9px] font-bold ${
                active ? "text-[#2163E7]" : "text-[#9ca3af]"
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

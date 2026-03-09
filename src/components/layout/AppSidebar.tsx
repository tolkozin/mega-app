"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[64px] min-h-screen bg-[#1C1D21] flex flex-col items-center py-5 shrink-0">
      {/* Logo */}
      <Link href="/dashboard" className="mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#5E81F4] flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-[#5E81F4] text-white"
                  : "text-[#8181A5] hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings */}
      <Link
        href="/settings"
        title="Settings"
        className="w-10 h-10 rounded-lg flex items-center justify-center text-[#8181A5] hover:text-white hover:bg-white/10 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.325 2.317a1 1 0 011.35 0l.588.534a1 1 0 00.849.253l.78-.153a1 1 0 011.156.675l.231.758a1 1 0 00.586.586l.758.231a1 1 0 01.675 1.156l-.153.78a1 1 0 00.253.849l.534.588a1 1 0 010 1.35l-.534.588a1 1 0 00-.253.849l.153.78a1 1 0 01-.675 1.156l-.758.231a1 1 0 00-.586.586l-.231.758a1 1 0 01-1.156.675l-.78-.153a1 1 0 00-.849.253l-.588.534a1 1 0 01-1.35 0l-.588-.534a1 1 0 00-.849-.253l-.78.153a1 1 0 01-1.156-.675l-.231-.758a1 1 0 00-.586-.586l-.758-.231a1 1 0 01-.675-1.156l.153-.78a1 1 0 00-.253-.849l-.534-.588a1 1 0 010-1.35l.534-.588a1 1 0 00.253-.849l-.153-.78a1 1 0 01.675-1.156l.758-.231a1 1 0 00.586-.586l.231-.758a1 1 0 011.156-.675l.78.153a1 1 0 00.849-.253l.588-.534z" />
          <circle cx="10" cy="10" r="2.5" />
        </svg>
      </Link>
    </aside>
  );
}

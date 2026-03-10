"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLayoutStore } from "@/stores/layout-store";
import { useChatStore } from "@/stores/chat-store";

const categories = [
  { key: "subscription", label: "Subscription", href: "/dashboard/subscription" },
  { key: "ecommerce", label: "E-commerce", href: "/dashboard/ecommerce" },
  { key: "saas", label: "SaaS", href: "/dashboard/saas" },
] as const;

interface AppHeaderProps {
  title?: string;
  monthRange?: [number, number] | null;
  onMonthRangeChange?: (range: [number, number] | null) => void;
  totalMonths?: number;
}

function fmtLabel(m: number) {
  const yr = Math.ceil(m / 12);
  return `M${m} (Y${yr})`;
}

function DateRangeBar({ monthRange, onMonthRangeChange, totalMonths }: {
  monthRange?: [number, number] | null;
  onMonthRangeChange?: (range: [number, number] | null) => void;
  totalMonths?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!totalMonths || totalMonths <= 0 || !onMonthRangeChange) return null;

  const from = monthRange?.[0] ?? 1;
  const to = monthRange?.[1] ?? totalMonths;
  const isAll = !monthRange;
  const currentLabel = isAll ? `M1 — M${totalMonths}` : `${fmtLabel(from)} — ${fmtLabel(to)}`;

  const monthOptions = Array.from({ length: totalMonths }, (_, i) => i + 1);

  const handleFrom = (v: number) => {
    onMonthRangeChange([v, Math.max(v, to)]);
  };
  const handleTo = (v: number) => {
    onMonthRangeChange([Math.min(from, v), v]);
  };

  // Dual slider percentages
  const fromPct = ((from - 1) / Math.max(totalMonths - 1, 1)) * 100;
  const toPct = ((to - 1) / Math.max(totalMonths - 1, 1)) * 100;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white border border-[#ECECF2] rounded-lg h-8 px-3 hover:border-[#5E81F4] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#8181A5] shrink-0">
          <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-medium text-[#1C1D21] whitespace-nowrap">{currentLabel}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#8181A5]">
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#ECECF2] rounded-lg shadow-lg p-4 w-[320px]">
            <p className="text-[11px] font-semibold text-[#1C1D21] mb-3">Select Month Range</p>

            {/* Dropdowns */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <label className="text-[10px] text-[#8181A5] mb-1 block">From</label>
                <select
                  value={from}
                  onChange={(e) => handleFrom(Number(e.target.value))}
                  className="w-full h-8 px-2 text-xs rounded-md border border-[#ECECF2] bg-white text-[#1C1D21] focus:outline-none focus:border-[#5E81F4]"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>{fmtLabel(m)}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-[#8181A5] mt-4">—</span>
              <div className="flex-1">
                <label className="text-[10px] text-[#8181A5] mb-1 block">To</label>
                <select
                  value={to}
                  onChange={(e) => handleTo(Number(e.target.value))}
                  className="w-full h-8 px-2 text-xs rounded-md border border-[#ECECF2] bg-white text-[#1C1D21] focus:outline-none focus:border-[#5E81F4]"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>{fmtLabel(m)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dual range slider */}
            <div className="relative h-6 mb-3">
              {/* Track background */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full bg-[#ECECF2]" />
              {/* Active range */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#5E81F4]"
                style={{ left: `${fromPct}%`, right: `${100 - toPct}%` }}
              />
              {/* From thumb */}
              <input
                type="range"
                min={1}
                max={totalMonths}
                value={from}
                onChange={(e) => handleFrom(Number(e.target.value))}
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5E81F4] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#5E81F4] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                style={{ zIndex: from === to ? 2 : 1 }}
              />
              {/* To thumb */}
              <input
                type="range"
                min={1}
                max={totalMonths}
                value={to}
                onChange={(e) => handleTo(Number(e.target.value))}
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5E81F4] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#5E81F4] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                style={{ zIndex: 2 }}
              />
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-[9px] text-[#8181A5] mb-3">
              <span>M1</span>
              {totalMonths > 12 && <span>M{Math.round(totalMonths / 4)}</span>}
              {totalMonths > 12 && <span>M{Math.round(totalMonths / 2)}</span>}
              {totalMonths > 24 && <span>M{Math.round(totalMonths * 3 / 4)}</span>}
              <span>M{totalMonths}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-[#ECECF2] pt-3">
              <button
                onClick={() => { onMonthRangeChange(null); setOpen(false); }}
                className="text-[11px] text-[#8181A5] hover:text-[#5E81F4] transition-colors"
              >
                Reset to All
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-[11px] px-3 py-1.5 bg-[#5E81F4] text-white rounded-md hover:bg-[#4B6FE0]"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AppHeader({ title, monthRange, onMonthRangeChange, totalMonths }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const setNavMobileOpen = useLayoutStore((s) => s.setNavSidebarMobileOpen);
  const setConfigDrawerOpen = useLayoutStore((s) => s.setConfigDrawerOpen);
  const toggleAI = useChatStore((s) => s.togglePanel);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const isDashboard = pathname?.startsWith("/dashboard");
  const activeCategory = categories.find((c) => pathname?.startsWith(c.href))?.key;

  return (
    <header className="h-14 border-b border-[#ECECF2] bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={() => setNavMobileOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8181A5] hover:text-[#1C1D21] hover:bg-[#F0F0F5]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 4h14M2 9h14M2 14h14" />
            </svg>
          </button>
        )}

        {/* Config gear — mobile only, on dashboard pages */}
        {isMobile && isDashboard && (
          <button
            onClick={() => setConfigDrawerOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8181A5] hover:text-[#1C1D21] hover:bg-[#F0F0F5]"
            title="Configuration"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.66 1.85a.8.8 0 011.08 0l.47.43a.8.8 0 00.68.2l.62-.12a.8.8 0 01.93.54l.18.61a.8.8 0 00.47.47l.61.18a.8.8 0 01.54.93l-.12.62a.8.8 0 00.2.68l.43.47a.8.8 0 010 1.08l-.43.47a.8.8 0 00-.2.68l.12.62a.8.8 0 01-.54.93l-.61.18a.8.8 0 00-.47.47l-.18.61a.8.8 0 01-.93.54l-.62-.12a.8.8 0 00-.68.2l-.47.43a.8.8 0 01-1.08 0l-.47-.43a.8.8 0 00-.68-.2l-.62.12a.8.8 0 01-.93-.54l-.18-.61a.8.8 0 00-.47-.47l-.61-.18a.8.8 0 01-.54-.93l.12-.62a.8.8 0 00-.2-.68l-.43-.47a.8.8 0 010-1.08l.43-.47a.8.8 0 00.2-.68l-.12-.62a.8.8 0 01.54-.93l.61-.18a.8.8 0 00.47-.47l.18-.61a.8.8 0 01.93-.54l.62.12a.8.8 0 00.68-.2l.47-.43z" />
              <circle cx="8" cy="8" r="2" />
            </svg>
          </button>
        )}

        {title && <h1 className="text-base md:text-lg font-bold text-[#1C1D21] truncate">{title}</h1>}

        {isDashboard && (
          <div className="flex items-center bg-[#F4F6FF] rounded-lg p-0.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => router.push(cat.href)}
                className={`px-2.5 md:px-3 py-1.5 text-xs md:text-sm font-bold rounded-md transition-colors whitespace-nowrap ${
                  activeCategory === cat.key
                    ? "bg-[#5E81F4] text-white"
                    : "text-[#8181A5] hover:text-[#1C1D21]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {isDashboard && !isMobile && (
          <DateRangeBar
            monthRange={monthRange}
            onMonthRangeChange={onMonthRangeChange}
            totalMonths={totalMonths}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Date range on mobile */}
        {isDashboard && isMobile && (
          <DateRangeBar
            monthRange={monthRange}
            onMonthRangeChange={onMonthRangeChange}
            totalMonths={totalMonths}
          />
        )}

        {/* AI button — mobile only */}
        {isMobile && (
          <button
            onClick={toggleAI}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8181A5] hover:text-[#5E81F4] hover:bg-[#F0F0F5]"
            title="AI Assistant"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.18 18.02L10 15.77L5.82 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" />
            </svg>
          </button>
        )}

        {user && (
          <>
            <span className="text-sm text-[#8181A5] hidden md:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-[#8181A5] hover:text-[#1C1D21] transition-colors"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}

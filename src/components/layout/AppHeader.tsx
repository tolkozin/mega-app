"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLayoutStore } from "@/stores/layout-store";
import { useChatStore } from "@/stores/chat-store";
import { AnimatePresence, motion } from "framer-motion";

const categories = [
  { key: "subscription", label: "Subscription", href: "/dashboard/subscription" },
  { key: "ecommerce", label: "E-commerce", href: "/dashboard/ecommerce" },
  { key: "saas", label: "SaaS", href: "/dashboard/saas" },
] as const;

const planBadgeColors: Record<string, string> = {
  free: "bg-[#64748B]/20 text-[#94A3B8]",
  plus: "bg-[#3B82F6]/20 text-[#60A5FA]",
  pro: "bg-[#8B5CF6]/20 text-[#A78BFA]",
  enterprise: "bg-[#F59E0B]/20 text-[#FBBF24]",
};

function PlanBadge({ plan }: { plan?: string }) {
  if (!plan || plan === "free") return null;
  const label = plan.charAt(0).toUpperCase() + plan.slice(1);
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${planBadgeColors[plan] ?? planBadgeColors.free}`}>
      {label}
    </span>
  );
}

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

// ─── Desktop Date Range Popover ───────────────────────────────────────────────

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
        className="flex items-center gap-1.5 bg-white/10 border border-[#2A2B30] rounded-lg h-8 px-3 hover:border-[#5E81F4] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#94A3B8] shrink-0">
          <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-medium text-[#F8FAFC] whitespace-nowrap">{currentLabel}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#94A3B8]">
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

// ─── Mobile Overflow Bottom Sheet ─────────────────────────────────────────────

function OverflowSheet({
  open,
  onClose,
  activeCategory,
  onSignOut,
  email,
}: {
  open: boolean;
  onClose: () => void;
  activeCategory?: string;
  onSignOut: () => void;
  email?: string;
}) {
  const modelLabel = categories.find((c) => c.key === activeCategory)?.label ?? "Dashboard";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[71] bg-[#0F172A] rounded-t-[20px] border-t border-[#1E293B]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full bg-[#334155]" />
            </div>

            {/* Model type */}
            <div className="flex items-center gap-3 px-5 h-[52px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="7" height="8" rx="1.5" />
                <rect x="11" y="2" width="7" height="5" rx="1.5" />
                <rect x="2" y="12" width="7" height="6" rx="1.5" />
                <rect x="11" y="9" width="7" height="9" rx="1.5" />
              </svg>
              <div>
                <p className="text-[15px] text-[#F8FAFC]">{modelLabel} Model</p>
                {email && <p className="text-xs text-[#64748B]">{email}</p>}
              </div>
            </div>

            <div className="mx-5 border-t border-[#1E293B]" />

            {/* Sign Out */}
            <button
              onClick={() => { onSignOut(); onClose(); }}
              className="flex items-center gap-3 px-5 h-[52px] w-full text-left active:bg-white/5"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17H4a2 2 0 01-2-2V5a2 2 0 012-2h3" />
                <path d="M14 14l4-4-4-4" />
                <path d="M18 10H8" />
              </svg>
              <span className="text-[15px] text-[#F8FAFC]">Sign Out</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile Date Range Bottom Sheet ───────────────────────────────────────────

function DateRangeSheet({
  open,
  onClose,
  monthRange,
  onMonthRangeChange,
  totalMonths,
}: {
  open: boolean;
  onClose: () => void;
  monthRange?: [number, number] | null;
  onMonthRangeChange?: (range: [number, number] | null) => void;
  totalMonths?: number;
}) {
  if (!totalMonths || !onMonthRangeChange) return null;

  const from = monthRange?.[0] ?? 1;
  const to = monthRange?.[1] ?? totalMonths;
  const monthOptions = Array.from({ length: totalMonths }, (_, i) => i + 1);

  const handleFrom = (v: number) => onMonthRangeChange([v, Math.max(v, to)]);
  const handleTo = (v: number) => onMonthRangeChange([Math.min(from, v), v]);

  const quickRanges = [12, 24, 36, totalMonths].filter((v, i, arr) => arr.indexOf(v) === i && v <= totalMonths);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[71] bg-[#0F172A] rounded-t-[20px] border-t border-[#1E293B] px-5"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full bg-[#334155]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-[#F8FAFC]">Date Range</span>
              <button
                onClick={onClose}
                className="text-[13px] font-semibold text-[#3B82F6] px-3 py-1.5 rounded-lg active:bg-white/5"
              >
                Done
              </button>
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <label className="text-[11px] text-[#64748B] mb-1 block">From</label>
                <select
                  value={from}
                  onChange={(e) => handleFrom(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-[#334155] bg-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>{fmtLabel(m)}</option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-[#64748B] mt-5">—</span>
              <div className="flex-1">
                <label className="text-[11px] text-[#64748B] mb-1 block">To</label>
                <select
                  value={to}
                  onChange={(e) => handleTo(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-[#334155] bg-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>{fmtLabel(m)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick select */}
            <p className="text-[11px] text-[#64748B] mb-2">Quick select</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickRanges.map((end) => {
                const isActive = from === 1 && to === end;
                return (
                  <button
                    key={end}
                    onClick={() => onMonthRangeChange([1, end])}
                    className={`px-4 py-2 text-[13px] rounded-full border transition-colors ${
                      isActive
                        ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                        : "bg-[#1E293B] border-[#334155] text-[#CBD5E1] active:bg-[#334155]"
                    }`}
                  >
                    M1–M{end}
                  </button>
                );
              })}
              <button
                onClick={() => { onMonthRangeChange(null); onClose(); }}
                className="px-4 py-2 text-[13px] rounded-full border bg-[#1E293B] border-[#334155] text-[#CBD5E1] active:bg-[#334155]"
              >
                All
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile Header ────────────────────────────────────────────────────────────

function MobileHeader({ title, monthRange, onMonthRangeChange, totalMonths }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const setNavMobileOpen = useLayoutStore((s) => s.setNavSidebarMobileOpen);
  const setConfigDrawerOpen = useLayoutStore((s) => s.setConfigDrawerOpen);
  const toggleAI = useChatStore((s) => s.togglePanel);

  const [overflowOpen, setOverflowOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  const isDashboard = pathname?.startsWith("/dashboard");
  const activeCategory = categories.find((c) => pathname?.startsWith(c.href))?.key;
  const activeCategoryLabel = categories.find((c) => c.key === activeCategory)?.label;

  const from = monthRange?.[0] ?? 1;
  const to = monthRange?.[1] ?? totalMonths;
  const dateLabel = !monthRange && totalMonths ? `M1 — M${totalMonths}` : totalMonths ? `M${from} — M${to}` : null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <>
      {/* Row 1 — Primary navigation bar */}
      <header className="h-14 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          {/* Hamburger */}
          <button
            onClick={() => setNavMobileOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-[#94A3B8] active:bg-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
        </div>

        {/* Center — Logo */}
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <img src="/logo.svg" alt="Revenue Map" className="w-7 h-7" />
          <span className="text-sm font-bold text-white">Revenue Map</span>
        </button>

        {/* Right — AI + overflow */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleAI}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-[#94A3B8] active:bg-white/10"
            title="AI Assistant"
          >
            {/* MessageSquare icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h14a1 1 0 011 1v9a1 1 0 01-1 1H7l-4 3V4a1 1 0 011-1z" />
            </svg>
          </button>
          <button
            onClick={() => setOverflowOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-[#94A3B8] active:bg-white/10"
            title="More"
          >
            {/* MoreVertical icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="5" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="15" r="1.5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Row 2 — Context bar (dashboard pages only) */}
      {isDashboard && (
        <div className="h-11 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between px-4 gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Model type selector pill */}
            <button
              onClick={() => setConfigDrawerOpen(true)}
              className="flex items-center gap-1.5 bg-[#3B82F6] text-white rounded-full px-3 h-8 max-w-[160px]"
            >
              <span className="text-[13px] font-medium truncate">{activeCategoryLabel ?? title ?? "Dashboard"}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
                <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Category tabs (compact) */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => router.push(cat.href)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md whitespace-nowrap transition-colors ${
                    activeCategory === cat.key
                      ? "bg-[#1E293B] text-white"
                      : "text-[#64748B] active:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range pill */}
          {dateLabel && (
            <button
              onClick={() => setDateSheetOpen(true)}
              className="flex items-center gap-1.5 border border-[#334155] rounded-full px-3 h-8 shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="text-[#64748B] shrink-0">
                <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="text-[11px] text-[#CBD5E1] whitespace-nowrap">{dateLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom sheets */}
      <OverflowSheet
        open={overflowOpen}
        onClose={() => setOverflowOpen(false)}
        activeCategory={activeCategory}
        onSignOut={handleSignOut}
        email={user?.email ?? undefined}
      />
      <DateRangeSheet
        open={dateSheetOpen}
        onClose={() => setDateSheetOpen(false)}
        monthRange={monthRange}
        onMonthRangeChange={onMonthRangeChange}
        totalMonths={totalMonths}
      />
    </>
  );
}

// ─── Desktop Header ───────────────────────────────────────────────────────────

function DesktopHeader({ title, monthRange, onMonthRangeChange, totalMonths }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");
  const activeCategory = categories.find((c) => pathname?.startsWith(c.href))?.key;

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="h-14 border-b border-[#2A2B30] bg-[#1C1D21] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        {title && <h1 className="text-lg font-bold text-[#F8FAFC] truncate">{title}</h1>}

        {isDashboard && (
          <div className="flex items-center bg-white/10 rounded-lg p-0.5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => router.push(cat.href)}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${
                  activeCategory === cat.key
                    ? "bg-[#5E81F4] text-white"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {isDashboard && (
          <DateRangeBar
            monthRange={monthRange}
            onMonthRangeChange={onMonthRangeChange}
            totalMonths={totalMonths}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <PlanBadge plan={profile?.plan} />
            <span className="text-sm text-[#94A3B8]">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-[#94A3B8] hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function AppHeader(props: AppHeaderProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileHeader {...props} />;
  }

  return <DesktopHeader {...props} />;
}

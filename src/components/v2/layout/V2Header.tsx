"use client";

/**
 * v2 Header — Light theme header matching Figma Make design.
 *
 * Desktop: Light bar with page title, date range, plan badge, user info
 * Mobile: Compact bar with hamburger, logo, overflow menu
 */

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLayoutStore } from "@/stores/layout-store";
import { useChatStore } from "@/stores/chat-store";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Plan Badge ─── */

const planBadgeStyles: Record<string, string> = {
  free: "bg-[#f0f1f7] text-[#9ca3af]",
  plus: "bg-[#EBF0FD] text-[#2163E7]",
  pro: "bg-[#F3E8FF] text-[#8B5CF6]",
  enterprise: "bg-[#FEF3C7] text-[#D97706]",
};

function PlanBadge({ plan }: { plan?: string }) {
  if (!plan) return null;
  if (plan === "free" || plan === "expired") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
        No Plan
      </span>
    );
  }
  const label = plan.charAt(0).toUpperCase() + plan.slice(1);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${planBadgeStyles[plan] ?? planBadgeStyles.free}`}>
      {label}
    </span>
  );
}

/* ─── Types ─── */

export interface V2HeaderProps {
  title?: string;
  monthRange?: [number, number] | null;
  onMonthRangeChange?: (range: [number, number] | null) => void;
  totalMonths?: number;
}

function fmtLabel(m: number) {
  const yr = Math.ceil(m / 12);
  return `M${m} (Y${yr})`;
}

/* ─── Desktop Date Range Popover (exported for reuse) ─── */

export function V2DateRangeBar({
  monthRange,
  onMonthRangeChange,
  totalMonths,
}: {
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

  const handleFrom = (v: number) => onMonthRangeChange([v, Math.max(v, to)]);
  const handleTo = (v: number) => onMonthRangeChange([Math.min(from, v), v]);

  const fromPct = ((from - 1) / Math.max(totalMonths - 1, 1)) * 100;
  const toPct = ((to - 1) / Math.max(totalMonths - 1, 1)) * 100;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-[8px] h-8 px-3 bg-white border border-[#eef0f6] hover:border-[#2163E7] transition-colors shadow-v2-sm"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#9ca3af] shrink-0">
          <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-semibold text-[#1a1a2e] whitespace-nowrap">{currentLabel}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#c4c9d8]">
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-[#eef0f6] rounded-[12px] shadow-v2-lg p-4 w-[320px] max-w-[calc(100vw-2rem)]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-[12px] font-bold text-[#1a1a2e] mb-3">Select Month Range</p>

              {/* Dropdowns */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-[#9ca3af] mb-1 block">From</label>
                  <select
                    value={from}
                    onChange={(e) => handleFrom(Number(e.target.value))}
                    className="w-full h-8 px-2 text-xs rounded-[8px] border border-[#eef0f6] bg-white text-[#1a1a2e] focus:outline-none focus:border-[#2163E7]"
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>{fmtLabel(m)}</option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-[#c4c9d8] mt-4">—</span>
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-[#9ca3af] mb-1 block">To</label>
                  <select
                    value={to}
                    onChange={(e) => handleTo(Number(e.target.value))}
                    className="w-full h-8 px-2 text-xs rounded-[8px] border border-[#eef0f6] bg-white text-[#1a1a2e] focus:outline-none focus:border-[#2163E7]"
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>{fmtLabel(m)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dual range slider */}
              <div className="relative h-6 mb-3">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full bg-[#f0f1f7]" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#2163E7]"
                  style={{ left: `${fromPct}%`, right: `${100 - toPct}%` }}
                />
                <input
                  type="range" min={1} max={totalMonths} value={from}
                  onChange={(e) => handleFrom(Number(e.target.value))}
                  className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2163E7] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                  style={{ zIndex: from === to ? 2 : 1 }}
                />
                <input
                  type="range" min={1} max={totalMonths} value={to}
                  onChange={(e) => handleTo(Number(e.target.value))}
                  className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2163E7] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                  style={{ zIndex: 2 }}
                />
              </div>

              {/* Scale labels */}
              <div className="flex justify-between text-[9px] text-[#c4c9d8] mb-3">
                <span>M1</span>
                {totalMonths > 12 && <span>M{Math.round(totalMonths / 4)}</span>}
                {totalMonths > 12 && <span>M{Math.round(totalMonths / 2)}</span>}
                {totalMonths > 24 && <span>M{Math.round(totalMonths * 3 / 4)}</span>}
                <span>M{totalMonths}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[#f0f1f7] pt-3">
                <button
                  onClick={() => { onMonthRangeChange(null); setOpen(false); }}
                  className="text-[11px] text-[#9ca3af] hover:text-[#2163E7] transition-colors font-medium"
                >
                  Reset to All
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[11px] px-3 py-1.5 bg-[#2163E7] text-white rounded-[8px] hover:bg-[#1650b0] transition-colors font-bold"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile Date Range Bottom Sheet ─── */

function MobileDateRangeSheet({
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
            className="fixed bottom-0 left-0 right-0 z-[71] bg-white rounded-t-[20px] border-t border-[#eef0f6] px-5"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full bg-[#eef0f6]" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-bold text-[#1a1a2e]">Date Range</span>
              <button
                onClick={onClose}
                className="text-[13px] font-bold text-[#2163E7] px-3 py-1.5 rounded-lg active:bg-[#EBF0FD]"
              >
                Done
              </button>
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-[#9ca3af] mb-1 block">From</label>
                <select
                  value={from}
                  onChange={(e) => handleFrom(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm rounded-[8px] border border-[#eef0f6] bg-[#f8f9fc] text-[#1a1a2e] focus:outline-none focus:border-[#2163E7]"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>{fmtLabel(m)}</option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-[#c4c9d8] mt-5">—</span>
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-[#9ca3af] mb-1 block">To</label>
                <select
                  value={to}
                  onChange={(e) => handleTo(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm rounded-[8px] border border-[#eef0f6] bg-[#f8f9fc] text-[#1a1a2e] focus:outline-none focus:border-[#2163E7]"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>{fmtLabel(m)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick select */}
            <p className="text-[11px] font-semibold text-[#9ca3af] mb-2">Quick select</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickRanges.map((end) => {
                const isActive = from === 1 && to === end;
                return (
                  <button
                    key={end}
                    onClick={() => onMonthRangeChange([1, end])}
                    className={`px-4 py-2 text-[13px] rounded-full border transition-colors font-semibold ${
                      isActive
                        ? "bg-[#2163E7] border-[#2163E7] text-white"
                        : "bg-[#f8f9fc] border-[#eef0f6] text-[#6b7280] active:bg-[#eef0f6]"
                    }`}
                  >
                    M1–M{end}
                  </button>
                );
              })}
              <button
                onClick={() => { onMonthRangeChange(null); onClose(); }}
                className="px-4 py-2 text-[13px] rounded-full border bg-[#f8f9fc] border-[#eef0f6] text-[#6b7280] active:bg-[#eef0f6] font-semibold"
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

/* ─── Mobile Header ─── */

function MobileHeader({ title, monthRange, onMonthRangeChange, totalMonths }: V2HeaderProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  const setConfigDrawerOpen = useLayoutStore((s) => s.setConfigDrawerOpen);

  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  const isDashboard = pathname?.startsWith("/dashboard");

  const from = monthRange?.[0] ?? 1;
  const to = monthRange?.[1] ?? totalMonths;
  const dateLabel = !monthRange && totalMonths ? `M1 — M${totalMonths}` : totalMonths ? `M${from} — M${to}` : null;

  return (
    <>
      {/* Row 1 — Primary bar */}
      <header className="h-12 bg-white border-b border-[#eef0f6] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfigDrawerOpen(true)}
            className="h-7 px-2.5 flex items-center gap-1.5 bg-[#2163E7] text-white rounded-[6px] text-[11px] font-bold shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
            Config
          </button>
        </div>

        {/* Center — Logo */}
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <img src="/logo.svg" alt="Revenue Map" className="w-6 h-6 rounded-[5px] shrink-0" />
          <span className="text-[13px] font-extrabold text-[#1a1a2e]">Revenue Map</span>
        </button>

        {/* Right — Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7BA3F0] to-[#2163E7] flex items-center justify-center text-[10px] text-white font-extrabold">
          {(user?.email?.[0] ?? "U").toUpperCase()}
        </div>
      </header>

      {/* Row 2 — Context bar removed on mobile — Config button is in Row 1 */}
      {false && isDashboard && (
        <div className="h-10 bg-[#f8f9fc] border-b border-[#eef0f6] flex items-center justify-between px-4 gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setConfigDrawerOpen(true)}
              className="h-7 px-2.5 flex items-center gap-1.5 bg-[#2163E7] text-white rounded-[6px] text-[11px] font-bold shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
              Config
            </button>
          </div>

          {/* Date range pill */}
          {dateLabel && (
            <button
              onClick={() => setDateSheetOpen(true)}
              className="flex items-center gap-1.5 border border-[#eef0f6] bg-white rounded-full px-3 h-7 shrink-0 shadow-v2-sm"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="text-[#9ca3af] shrink-0">
                <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-semibold text-[#1a1a2e] whitespace-nowrap">{dateLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom sheet */}
      <MobileDateRangeSheet
        open={dateSheetOpen}
        onClose={() => setDateSheetOpen(false)}
        monthRange={monthRange}
        onMonthRangeChange={onMonthRangeChange}
        totalMonths={totalMonths}
      />
    </>
  );
}

/* ─── Desktop Header ─── */

function DesktopHeader({ title, monthRange, onMonthRangeChange, totalMonths }: V2HeaderProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="h-14 border-b border-[#eef0f6] bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        {title && <h1 className="text-[16px] font-extrabold text-[#1a1a2e] truncate">{title}</h1>}

        {/* Date range */}
        <V2DateRangeBar
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          totalMonths={totalMonths}
        />
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <PlanBadge plan={profile?.plan} />
            <span className="text-[12px] text-[#9ca3af] font-medium">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-[12px] text-[#c4c9d8] hover:text-[#1a1a2e] transition-colors font-medium"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}

/* ─── Main Export ─── */

export function V2Header(props: V2HeaderProps) {
  const isMobile = useIsMobile();
  return isMobile ? <MobileHeader {...props} /> : <DesktopHeader {...props} />;
}

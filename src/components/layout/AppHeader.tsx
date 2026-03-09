"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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

function DateRangeBar({ monthRange, onMonthRangeChange, totalMonths }: {
  monthRange?: [number, number] | null;
  onMonthRangeChange?: (range: [number, number] | null) => void;
  totalMonths?: number;
}) {
  if (!totalMonths || totalMonths <= 0 || !onMonthRangeChange) return null;

  const presets = [
    { label: "All", range: null as [number, number] | null },
    { label: "3M", range: [Math.max(1, totalMonths - 2), totalMonths] as [number, number] },
    { label: "6M", range: [Math.max(1, totalMonths - 5), totalMonths] as [number, number] },
    { label: "12M", range: [Math.max(1, totalMonths - 11), totalMonths] as [number, number] },
    { label: "Y1", range: [1, Math.min(12, totalMonths)] as [number, number] },
    { label: "Y2", range: [13, Math.min(24, totalMonths)] as [number, number] },
    { label: "Y3", range: [25, Math.min(36, totalMonths)] as [number, number] },
  ].filter((p) => {
    if (!p.range) return true;
    return p.range[0] <= totalMonths;
  });

  const isActive = (preset: typeof presets[number]) => {
    if (!preset.range && !monthRange) return true;
    if (!preset.range || !monthRange) return false;
    return monthRange[0] === preset.range[0] && monthRange[1] === preset.range[1];
  };

  const currentLabel = monthRange
    ? `M${monthRange[0]} — M${monthRange[1]}`
    : `M1 — M${totalMonths}`;

  return (
    <div className="flex items-center bg-white border border-[#ECECF2] rounded-lg h-8 overflow-hidden">
      <div className="flex items-center gap-1.5 px-2.5 border-r border-[#ECECF2] h-full">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#8181A5] shrink-0">
          <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-medium text-[#1C1D21] whitespace-nowrap">{currentLabel}</span>
      </div>
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onMonthRangeChange(preset.range)}
          className={`px-2.5 h-full text-[11px] font-medium transition-colors border-r border-[#ECECF2] last:border-r-0 ${
            isActive(preset)
              ? "bg-[#5E81F4] text-white"
              : "text-[#8181A5] hover:text-[#1C1D21] hover:bg-[#F4F6FF]"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

export function AppHeader({ title, monthRange, onMonthRangeChange, totalMonths }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const isDashboard = pathname?.startsWith("/dashboard");
  const activeCategory = categories.find((c) => pathname?.startsWith(c.href))?.key;

  return (
    <header className="h-14 border-b border-[#ECECF2] bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-lg font-bold text-[#1C1D21]">{title}</h1>}

        {isDashboard && (
          <div className="flex items-center bg-[#F4F6FF] rounded-lg p-0.5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => router.push(cat.href)}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${
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

        {isDashboard && (
          <DateRangeBar
            monthRange={monthRange}
            onMonthRangeChange={onMonthRangeChange}
            totalMonths={totalMonths}
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-[#8181A5]">{user.email}</span>
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

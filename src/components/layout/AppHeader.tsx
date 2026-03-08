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

  const monthOptions = totalMonths
    ? Array.from({ length: totalMonths }, (_, i) => i + 1)
    : [];

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

        {isDashboard && totalMonths && totalMonths > 0 && onMonthRangeChange && (
          <div className="flex items-center gap-2 ml-2">
            <select
              value={monthRange?.[0] ?? 1}
              onChange={(e) => {
                const from = Number(e.target.value);
                const to = monthRange?.[1] ?? totalMonths;
                onMonthRangeChange([from, Math.max(from, to)]);
              }}
              className="h-8 px-2 text-xs rounded-md border border-[#ECECF2] bg-white text-[#1C1D21] focus:outline-none focus:border-[#5E81F4]"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>M{m}</option>
              ))}
            </select>
            <span className="text-xs text-[#8181A5]">to</span>
            <select
              value={monthRange?.[1] ?? totalMonths}
              onChange={(e) => {
                const to = Number(e.target.value);
                const from = monthRange?.[0] ?? 1;
                onMonthRangeChange([Math.min(from, to), to]);
              }}
              className="h-8 px-2 text-xs rounded-md border border-[#ECECF2] bg-white text-[#1C1D21] focus:outline-none focus:border-[#5E81F4]"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>M{m}</option>
              ))}
            </select>
            {monthRange && (
              <button
                onClick={() => onMonthRangeChange(null)}
                className="text-xs text-[#8181A5] hover:text-[#5E81F4] transition-colors"
              >
                Reset
              </button>
            )}
          </div>
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

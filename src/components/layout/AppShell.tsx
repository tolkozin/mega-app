"use client";

import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function AppShell({
  title,
  children,
  monthRange,
  onMonthRangeChange,
  totalMonths,
}: {
  title?: string;
  children: React.ReactNode;
  monthRange?: [number, number] | null;
  onMonthRangeChange?: (range: [number, number] | null) => void;
  totalMonths?: number;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F8FC]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader
          title={title}
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          totalMonths={totalMonths}
        />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

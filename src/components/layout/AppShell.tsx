"use client";

import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function AppShell({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F8FC]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader title={title} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

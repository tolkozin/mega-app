"use client";

import { Navbar } from "./Navbar";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </>
  );
}

import { LandingNavbar } from "@/components/layout/LandingNavbar";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-foreground bg-[#f8f9fc]">
      <LandingNavbar />
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </div>
  );
}

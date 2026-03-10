"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export function LandingNavbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-200 bg-[#0F172A] ${
        scrolled
          ? "bg-[#0F172A]/95 border-[#334155]/50 shadow-lg shadow-black/20"
          : "border-[#1E293B]"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" />
          <span className="text-lg font-bold text-[#F8FAFC]">Revenue Map</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
          <Link href="/#models" className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
            Product
          </Link>
          {/* TODO: audience landing page */}
          <Link href="#" className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
            For Developers
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
            Blog
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-3 ml-auto md:ml-0 shrink-0">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                Dashboard
              </Link>
              <span className="text-sm text-[#94A3B8]">{user.email}</span>
              <button onClick={handleSignOut} className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="h-9 px-4 text-sm text-[#F8FAFC] font-bold hover:bg-white/10 rounded-lg transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="h-9 px-5 bg-[#3B82F6] text-white text-sm font-bold rounded-lg hover:bg-[#2563EB] transition-colors">
                  Get Started Free
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

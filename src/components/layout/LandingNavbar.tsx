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
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b transition-shadow duration-200 ${
        scrolled ? "border-[#ECECF2] shadow-sm" : "border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" />
          <span className="text-lg font-bold text-[#1C1D21]">Revenue Map</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
          <Link href="/#models" className="text-sm font-medium text-[#8181A5] hover:text-[#1C1D21] transition-colors">
            Product
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-[#8181A5] hover:text-[#1C1D21] transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm font-medium text-[#8181A5] hover:text-[#1C1D21] transition-colors">
            Blog
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-3 ml-auto md:ml-0 shrink-0">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-[#8181A5] hover:text-[#1C1D21] transition-colors">
                Dashboard
              </Link>
              <span className="text-sm text-[#8181A5]">{user.email}</span>
              <button onClick={handleSignOut} className="text-sm text-[#8181A5] hover:text-[#1C1D21] transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="h-9 px-4 text-sm text-[#1C1D21] font-bold hover:bg-[#F8F8FC] rounded-lg transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="h-9 px-5 bg-[#5E81F4] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors">
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

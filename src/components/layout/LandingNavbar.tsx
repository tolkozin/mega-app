"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { getAllModels } from "@/lib/model-registry";

const MODELS = getAllModels();

export function LandingNavbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-200 ${
        scrolled
          ? "bg-white/90 border-[#e5e7eb] shadow-sm"
          : "bg-[#f8f9fc]/80 border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" />
          <span className="text-lg font-bold text-[#1a1a2e]">Revenue Map</span>
        </Link>

        {/* Center nav links — desktop */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
          {/* Models dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setModelsOpen(!modelsOpen)}
              className="flex items-center gap-1 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
            >
              Models
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${modelsOpen ? "rotate-180" : ""}`} />
            </button>
            {modelsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-xl shadow-black/5">
                <div className="grid grid-cols-3 gap-1">
                  {MODELS.map((m) => (
                    <Link
                      key={m.key}
                      href={`/models/${m.key}`}
                      onClick={() => setModelsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#f8f9fc] transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: m.elementBg, color: m.elementText }}
                      >
                        <m.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-[#6b7280] group-hover:text-[#1a1a2e] transition-colors">
                        {m.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/pricing" className="text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
            Blog
          </Link>
          <Link href="/knowledge-base" className="text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
            Knowledge Base
          </Link>
        </div>

        {/* Right actions — desktop */}
        <div className="hidden md:flex items-center space-x-3 shrink-0">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
                Dashboard
              </Link>
              <span className="text-sm text-[#6b7280]">{user.email}</span>
              <button onClick={handleSignOut} className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="h-9 px-4 text-sm text-[#1a1a2e] font-medium hover:bg-black/5 rounded-lg transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/onboarding/survey">
                <button className="h-9 px-5 bg-[#2163e7] text-white text-sm font-bold rounded-lg hover:bg-[#1a53c7] transition-colors">
                  Get Started Free
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto p-2 text-[#6b7280] hover:text-[#1a1a2e]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e5e7eb] bg-white px-4 pb-6 pt-4 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6b7280] px-3 py-2">Models</p>
            <div className="grid grid-cols-2 gap-1">
              {MODELS.map((m) => (
                <Link
                  key={m.key}
                  href={`/models/${m.key}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f8f9fc] transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: m.elementBg, color: m.elementText }}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-[#1a1a2e]">{m.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-[#e5e7eb] pt-4 space-y-1">
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e]">Pricing</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e]">Blog</Link>
            <Link href="/knowledge-base" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e]">Knowledge Base</Link>
          </div>
          <div className="border-t border-[#e5e7eb] pt-4">
            {loading ? null : user ? (
              <div className="space-y-2">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-[#1a1a2e]">Dashboard</Link>
                <button onClick={handleSignOut} className="block px-3 py-2 text-sm text-[#6b7280]">Sign Out</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <button className="w-full h-10 text-sm font-medium text-[#1a1a2e] border border-[#e5e7eb] rounded-lg">Sign In</button>
                </Link>
                <Link href="/onboarding/survey" onClick={() => setMobileOpen(false)} className="flex-1">
                  <button className="w-full h-10 text-sm font-bold text-white bg-[#2163e7] rounded-lg">Get Started</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

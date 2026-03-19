"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import {
  Smartphone,
  ShoppingCart,
  Cloud,
  Store,
  UtensilsCrossed,
  Plane,
  Gamepad2,
  Landmark,
  HeartPulse,
  GraduationCap,
  Building2,
  Brain,
  ChevronDown,
} from "lucide-react";

const MODEL_LINKS = [
  { key: "subscription", label: "Mobile App", icon: Smartphone, color: "#5E81F4" },
  { key: "ecommerce", label: "E-Commerce", icon: ShoppingCart, color: "#F59E0B" },
  { key: "saas", label: "SaaS B2B", icon: Cloud, color: "#8B5CF6" },
  { key: "marketplace", label: "Marketplace", icon: Store, color: "#0EA5E9" },
  { key: "foodtech", label: "FoodTech", icon: UtensilsCrossed, color: "#EF4444" },
  { key: "traveltech", label: "TravelTech", icon: Plane, color: "#06B6D4" },
  { key: "gametech", label: "GameTech", icon: Gamepad2, color: "#A855F7" },
  { key: "fintech", label: "FinTech", icon: Landmark, color: "#10B981" },
  { key: "healthtech", label: "HealthTech", icon: HeartPulse, color: "#EC4899" },
  { key: "edtech", label: "EdTech", icon: GraduationCap, color: "#F97316" },
  { key: "proptech", label: "PropTech", icon: Building2, color: "#6366F1" },
  { key: "ai-ml", label: "AI / ML", icon: Brain, color: "#14B8A6" },
];

export function LandingNavbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
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
          {/* Models dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setModelsOpen(!modelsOpen)}
              className="flex items-center gap-1 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Models
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${modelsOpen ? "rotate-180" : ""}`} />
            </button>
            {modelsOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[480px] rounded-2xl border border-[#334155]/60 p-4 shadow-xl"
                style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(16px)" }}
              >
                <div className="grid grid-cols-2 gap-1">
                  {MODEL_LINKS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <Link
                        key={m.key}
                        href={`/models/${m.key}`}
                        onClick={() => setModelsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${m.color}15`, color: m.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[#CBD5E1] group-hover:text-white transition-colors">
                          {m.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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

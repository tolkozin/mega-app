"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, ChevronRight, Menu, X, ArrowRight } from "lucide-react";
import { getAllModels } from "@/lib/model-registry";
import { METRIC_CATEGORIES, CATEGORY_META } from "@/lib/knowledge-base";
import { IDEA_COLLECTIONS } from "@/lib/ideas";

const MODELS = getAllModels();
const TOP_MODELS = MODELS.slice(0, 6);

const KB_CATEGORIES = METRIC_CATEGORIES.map((key) => ({
  key,
  ...CATEGORY_META[key],
}));

/* Ideas collection summaries for compact dropdown */
const IDEAS_GROUPS = IDEA_COLLECTIONS.map((c) => ({
  type: c.type,
  label: c.label,
  description: c.description,
  count: c.lists.length,
  slug: c.slug,
  icon: c.type === "niche" ? "🏢" : c.type === "demographic" ? "👥" : c.type === "budget" ? "💰" : c.type === "category" ? "📱" : "⏱️",
}));

export function LandingNavbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [kbOpen, setKbOpen] = useState(false);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const modelsRef = useRef<HTMLDivElement>(null);
  const kbRef = useRef<HTMLDivElement>(null);
  const ideasRef = useRef<HTMLDivElement>(null);

  /* Mobile accordion state */
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const toggleMobileSection = (key: string) =>
    setMobileSection((prev) => (prev === key ? null : key));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modelsRef.current && !modelsRef.current.contains(e.target as Node)) {
        setModelsOpen(false);
      }
      if (kbRef.current && !kbRef.current.contains(e.target as Node)) {
        setKbOpen(false);
      }
      if (ideasRef.current && !ideasRef.current.contains(e.target as Node)) {
        setIdeasOpen(false);
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
    <>
    {/* Spacer for fixed navbar */}
    <div className="h-16" />
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-200 ${
        scrolled
          ? "bg-white/90 border-[#e5e7eb] shadow-sm"
          : "bg-[#f8f9fc]/80 border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" width={32} height={32} />
          <span className="text-lg font-bold text-[#1a1a2e]">Revenue Map</span>
        </Link>

        {/* Center nav links — desktop */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
          {/* Models dropdown */}
          <div ref={modelsRef} className="relative">
            <button
              onClick={() => { setModelsOpen(!modelsOpen); setKbOpen(false); setIdeasOpen(false); }}
              className="flex items-center gap-1 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
            >
              Models
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${modelsOpen ? "rotate-180" : ""}`} />
            </button>
            {modelsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[420px] rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-xl shadow-black/5">
                <div className="grid grid-cols-2 gap-1">
                  {TOP_MODELS.map((m) => (
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
                <div className="border-t border-[#e5e7eb] mt-3 pt-3">
                  <Link
                    href="/models"
                    onClick={() => setModelsOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f8f9fc] transition-colors group"
                  >
                    <span className="text-sm font-semibold text-[#2163e7]">Explore all models</span>
                    <ArrowRight className="w-4 h-4 text-[#2163e7] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
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

          {/* Knowledge Base dropdown */}
          <div ref={kbRef} className="relative">
            <button
              onClick={() => { setKbOpen(!kbOpen); setModelsOpen(false); setIdeasOpen(false); }}
              className="flex items-center gap-1 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
            >
              Knowledge Base
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${kbOpen ? "rotate-180" : ""}`} />
            </button>
            {kbOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[380px] rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-xl shadow-black/5">
                <div className="space-y-1">
                  {KB_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.key}
                      href={`/knowledge-base?category=${cat.key}`}
                      onClick={() => setKbOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f8f9fc] transition-colors group"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: cat.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#6b7280] group-hover:text-[#1a1a2e] transition-colors">{cat.label}</p>
                        <p className="text-[11px] text-[#9ca3af] truncate">{cat.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[#e5e7eb] mt-3 pt-3">
                  <Link
                    href="/knowledge-base"
                    onClick={() => setKbOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f8f9fc] transition-colors group"
                  >
                    <span className="text-sm font-semibold text-[#2163e7]">Browse all metrics</span>
                    <ArrowRight className="w-4 h-4 text-[#2163e7] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Ideas dropdown — compact collection groups */}
          <div ref={ideasRef} className="relative">
            <button
              onClick={() => { setIdeasOpen(!ideasOpen); setModelsOpen(false); setKbOpen(false); }}
              className="flex items-center gap-1 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
            >
              Ideas
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${ideasOpen ? "rotate-180" : ""}`} />
            </button>
            {ideasOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[340px] rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-xl shadow-black/5">
                <div className="space-y-1">
                  {IDEAS_GROUPS.map((g) => (
                    <Link
                      key={g.type}
                      href={`/ideas?filter=${g.type}`}
                      onClick={() => setIdeasOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f8f9fc] transition-colors group"
                    >
                      <span className="text-xl shrink-0">{g.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1a1a2e] group-hover:text-[#2163e7] transition-colors">{g.label}</p>
                        <p className="text-[11px] text-[#9ca3af]">{g.count} curated lists</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#d1d5db] group-hover:text-[#2163e7] transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[#e5e7eb] mt-3 pt-3">
                  <Link
                    href="/ideas"
                    onClick={() => setIdeasOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f8f9fc] transition-colors group"
                  >
                    <span className="text-sm font-semibold text-[#2163e7]">Browse all idea lists</span>
                    <ArrowRight className="w-4 h-4 text-[#2163e7] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
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

      {/* ─── Mobile menu ─── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e5e7eb] bg-white px-4 pb-6 pt-2 space-y-1 max-h-[80vh] overflow-y-auto">

          {/* Models accordion */}
          <MobileAccordion
            label="Models"
            isOpen={mobileSection === "models"}
            onToggle={() => toggleMobileSection("models")}
          >
            <div className="grid grid-cols-2 gap-1 pl-2">
              {TOP_MODELS.map((m) => (
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
            <Link href="/models" onClick={() => setMobileOpen(false)} className="flex items-center gap-1 px-3 py-2 ml-2 text-sm font-semibold text-[#2163e7]">
              Explore all models <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </MobileAccordion>

          {/* Knowledge Base accordion */}
          <MobileAccordion
            label="Knowledge Base"
            isOpen={mobileSection === "kb"}
            onToggle={() => toggleMobileSection("kb")}
          >
            <div className="pl-2 space-y-0.5">
              {KB_CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.key}
                  href={`/knowledge-base?category=${cat.key}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f8f9fc] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-sm text-[#1a1a2e]">{cat.label}</span>
                </Link>
              ))}
            </div>
            <Link href="/knowledge-base" onClick={() => setMobileOpen(false)} className="flex items-center gap-1 px-3 py-2 ml-2 text-sm font-semibold text-[#2163e7]">
              Browse all metrics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </MobileAccordion>

          {/* Ideas accordion */}
          <MobileAccordion
            label="Business Ideas"
            isOpen={mobileSection === "ideas"}
            onToggle={() => toggleMobileSection("ideas")}
          >
            <div className="pl-2 space-y-0.5">
              {IDEAS_GROUPS.map((g) => (
                <Link
                  key={g.type}
                  href={`/ideas?filter=${g.type}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#f8f9fc] transition-colors"
                >
                  <span className="text-base">{g.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e]">{g.label}</p>
                    <p className="text-[11px] text-[#9ca3af]">{g.count} lists</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/ideas" onClick={() => setMobileOpen(false)} className="flex items-center gap-1 px-3 py-2 ml-2 text-sm font-semibold text-[#2163e7]">
              Browse all idea lists <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </MobileAccordion>

          {/* Simple links */}
          <div className="border-t border-[#e5e7eb] pt-2 mt-2 space-y-0.5">
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e]">Pricing</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e]">Blog</Link>
          </div>

          {/* Auth */}
          <div className="border-t border-[#e5e7eb] pt-3 mt-2">
            {loading ? null : user ? (
              <div className="space-y-1">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#1a1a2e]">Dashboard</Link>
                <button onClick={handleSignOut} className="block px-3 py-2.5 text-sm text-[#6b7280]">Sign Out</button>
              </div>
            ) : (
              <div className="flex gap-3 px-1">
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
    </>
  );
}

/* ─── Mobile Accordion Section ─── */

function MobileAccordion({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#f0f0f5]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-[#1a1a2e]"
      >
        {label}
        <ChevronDown className={`w-4 h-4 text-[#9ca3af] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="pb-3 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

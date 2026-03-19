"use client";

import Link from "next/link";
import Image from "next/image";
import { ComponentType, ReactNode, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  ArrowRight,
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
  RefreshCw,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  BarChart3,
  Target,
} from "lucide-react";
import { HeroBackground } from "./HeroBackground";
import { AISection } from "./AISection";
import { SectionDivider } from "./SectionDivider";
import { AnimatedCounter } from "./AnimatedCounter";
import type { BlogPost } from "@/types/blog";

/* ─── Icon map ─── */

const MODEL_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  subscription: Smartphone,
  ecommerce: ShoppingCart,
  saas: Cloud,
  marketplace: Store,
  foodtech: UtensilsCrossed,
  traveltech: Plane,
  gametech: Gamepad2,
  fintech: Landmark,
  healthtech: HeartPulse,
  edtech: GraduationCap,
  proptech: Building2,
  "ai-ml": Brain,
};

/* ─── Types ─── */

interface ModelCard {
  title: string;
  color: string;
  iconKey: string;
  headline: string;
  description: string;
  question: string;
}

interface Plan {
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualTotal?: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
  href: string;
}

interface FooterLinks {
  [category: string]: { label: string; href: string }[];
}

interface HomepageClientProps {
  modelCards: ModelCard[];
  plans: Plan[];
  footerLinks: FooterLinks;
  featuredPosts: BlogPost[];
}

/* ─── Animation helpers ─── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Animated Search Bar with send button ─── */

const SEARCH_QUESTIONS = [
  "Can my startup idea actually work?",
  "How much money do I need to launch?",
  "When will my business become profitable?",
  "Is my pricing strategy right?",
  "What if I grow slower than expected?",
  "Am I spending too much on marketing?",
  "Should I raise funding or bootstrap?",
  "Will my idea survive the first year?",
];

function AnimatedSearchBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const question = SEARCH_QUESTIONS[currentIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayed.length < question.length) {
      timeout = setTimeout(
        () => setDisplayed(question.slice(0, displayed.length + 1)),
        40 + Math.random() * 60
      );
    } else if (!isDeleting && displayed.length === question.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 20);
    } else {
      setIsDeleting(false);
      setCurrentIndex((i) => (i + 1) % SEARCH_QUESTIONS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentIndex]);

  return (
    <div className="relative max-w-2xl mx-auto mt-10">
      <Link href="/onboarding/survey" className="block">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl pl-6 pr-3 py-3 flex items-center gap-3 shadow-[0_0_40px_rgba(59,130,246,0.08)] hover:border-white/20 transition-colors group">
          <Search className="w-5 h-5 text-white/40 shrink-0" />
          <span className="text-white/70 text-lg font-light flex-1 truncate">
            {displayed}
            <span className="animate-pulse">|</span>
          </span>
          <button className="shrink-0 w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white group-hover:bg-[#2563EB] transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </Link>
    </div>
  );
}

/* ─── Client Marquee ─── */

const CLIENTS = [
  "TechCrunch Featured",
  "Y Combinator Founders",
  "500 Startups Alumni",
  "Indie Hackers Community",
  "Product Hunt #1",
  "Startup School Grads",
  "AngelList Partners",
  "Seedcamp Portfolio",
  "Launch House Members",
  "Founder Café Network",
];

function ClientMarquee() {
  return (
    <div className="relative overflow-hidden py-4">
      <div className="flex gap-12 animate-marquee">
        {[...CLIENTS, ...CLIENTS].map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="text-sm font-medium text-[#64748B] whitespace-nowrap flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]/40" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Visual widgets for feature showcase ─── */

function MonteCarloVisual() {
  return (
    <div className="relative h-48 rounded-xl overflow-hidden" style={{ background: "rgba(30,41,59,0.6)" }}>
      <div className="absolute inset-0 flex items-end px-6 pb-6 gap-1">
        {Array.from({ length: 30 }).map((_, i) => {
          const h = 20 + Math.random() * 70;
          return (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${h}%`,
                background: `linear-gradient(to top, rgba(59,130,246,0.3), rgba(59,130,246,${0.1 + Math.random() * 0.5}))`,
              }}
            />
          );
        })}
      </div>
      <div className="absolute top-4 left-6 text-xs text-[#94A3B8]">1,000 simulations</div>
      <div className="absolute top-4 right-6 text-xs font-bold text-[#10B981]">78% hit target</div>
    </div>
  );
}

function ScenarioVisual() {
  const scenarios = [
    { label: "Pessimistic", color: "#EF4444", points: "60,190 150,185 240,182 330,178 420,175 510,170" },
    { label: "Base", color: "#3B82F6", points: "60,190 150,172 240,155 330,135 420,118 510,100" },
    { label: "Optimistic", color: "#10B981", points: "60,190 150,165 240,135 330,100 420,72 510,45" },
  ];
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: "rgba(30,41,59,0.6)" }}>
      <svg viewBox="0 0 540 210" className="w-full h-auto">
        <rect width="540" height="210" fill="transparent" rx="12" />
        {scenarios.map((s, i) => (
          <g key={s.label}>
            <circle cx={40 + i * 120} cy="14" r="4" fill={s.color} />
            <text x={50 + i * 120} y="18" fill="#94A3B8" fontSize="11" fontFamily="inherit">{s.label}</text>
          </g>
        ))}
        <line x1="40" y1="100" x2="520" y2="100" stroke="#1E293B" strokeWidth="1" />
        <line x1="40" y1="140" x2="520" y2="140" stroke="#1E293B" strokeWidth="1" />
        <line x1="40" y1="180" x2="520" y2="180" stroke="#1E293B" strokeWidth="1" />
        {scenarios.map((s) => {
          const pts = s.points.split(" ").map((p) => p.split(",").map(Number));
          return (
            <g key={s.label}>
              <polyline points={s.points} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map(([cx, cy], j) => (
                <circle key={j} cx={cx} cy={cy} r="3.5" fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ReportVisual() {
  return (
    <div className="relative h-48 rounded-xl overflow-hidden p-6 flex items-center justify-center" style={{ background: "rgba(30,41,59,0.6)" }}>
      <div className="w-32 rounded-lg border border-[#334155] p-3" style={{ background: "rgba(15,23,42,0.9)" }}>
        <div className="h-2 w-16 rounded bg-[#3B82F6]/40 mb-2" />
        <div className="h-1.5 w-full rounded bg-[#334155] mb-1.5" />
        <div className="h-1.5 w-3/4 rounded bg-[#334155] mb-3" />
        <div className="h-8 w-full rounded bg-[#3B82F6]/20 mb-2" />
        <div className="h-1.5 w-full rounded bg-[#334155] mb-1" />
        <div className="h-1.5 w-2/3 rounded bg-[#334155]" />
      </div>
      <div className="absolute bottom-4 right-6 text-xs text-[#94A3B8]">One-click PDF</div>
    </div>
  );
}

function AIAssistantVisual() {
  return (
    <div className="relative h-48 rounded-xl overflow-hidden p-5" style={{ background: "rgba(30,41,59,0.6)" }}>
      <div className="space-y-2.5">
        <div className="flex justify-end">
          <div className="rounded-xl rounded-br-sm px-3 py-2 text-xs text-[#F8FAFC] max-w-[70%]" style={{ background: "rgba(59,130,246,0.3)" }}>
            Is my churn rate healthy?
          </div>
        </div>
        <div className="flex">
          <div className="rounded-xl rounded-bl-sm px-3 py-2 text-xs text-[#CBD5E1] max-w-[80%]" style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(51,65,85,0.5)" }}>
            Your monthly churn is below the industry median. At this rate, your unit economics are sustainable.
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-xl rounded-br-sm px-3 py-2 text-xs text-[#F8FAFC] max-w-[70%]" style={{ background: "rgba(59,130,246,0.3)" }}>
            How can I improve it?
          </div>
        </div>
      </div>
    </div>
  );
}

const featureVisuals: Record<string, () => ReactNode> = {
  "monte-carlo": () => <MonteCarloVisual />,
  scenarios: () => <ScenarioVisual />,
  reports: () => <ReportVisual />,
  "ai-assistant": () => <AIAssistantVisual />,
};

/* ─── Why Subscribe cards ─── */

const WHY_SUBSCRIBE_CARDS = [
  {
    icon: RefreshCw,
    title: "Track Reality vs. Plan",
    description: "Come back monthly to update actuals. See how your real numbers compare to projections.",
  },
  {
    icon: AlertTriangle,
    title: "Catch Problems Early",
    description: "AI alerts you when metrics drift from benchmarks. Fix issues before they become expensive.",
  },
  {
    icon: FileText,
    title: "Stay Investor-Ready",
    description: "Your financial model is always current. Generate an updated investor report anytime.",
  },
];

/* ─── How It Works + Features combined data ─── */

const HOW_IT_WORKS_FEATURES = [
  {
    step: "01",
    title: "Describe your idea",
    description: "Pick your business type, answer a few questions about your market, pricing, and goals. Our AI pre-fills realistic benchmarks for your industry.",
    visual: "ai-assistant",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Get instant financial projections",
    description: "See revenue, costs, and profitability across 3 growth phases. Run Monte Carlo simulations to stress-test your assumptions with 1,000+ scenarios.",
    visual: "monte-carlo",
    icon: BarChart3,
  },
  {
    step: "03",
    title: "Compare scenarios, find your path",
    description: "What if growth is slower? What if costs are higher? Compare pessimistic, base, and optimistic outcomes side by side.",
    visual: "scenarios",
    icon: Target,
  },
  {
    step: "04",
    title: "Generate investor-ready reports",
    description: "Professional financial projections, unit economics, and scenario analysis packaged into a PDF. Ready in 60 seconds. Your go-to document for tracking business health as you grow.",
    visual: "reports",
    icon: FileText,
  },
];

/* ─── Horizontal scroll models ─── */

function ModelsCarousel({ cards, prefersReduced }: { cards: ModelCard[]; prefersReduced: boolean | null }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#1E293B]/90 border border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#3B82F6]/50 transition-all shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#1E293B]/90 border border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#3B82F6]/50 transition-all shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Gradient fades */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0F172A] to-transparent z-[5] pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0F172A] to-transparent z-[5] pointer-events-none" />
      )}

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cards.map((card) => {
          const IconComponent = MODEL_ICON_MAP[card.iconKey];
          return (
            <Link
              key={card.title}
              href={`/models/${card.iconKey}`}
              className="snap-start shrink-0 w-[280px] group"
            >
              <motion.div
                whileHover={prefersReduced ? {} : { y: -4 }}
                className="rounded-2xl border border-[#334155]/60 p-6 transition-all hover:border-opacity-100 h-full"
                style={{
                  background: "rgba(30,41,59,0.4)",
                  borderColor: `${card.color}30`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${card.color}60`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${card.color}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${card.color}30`;
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-bold mb-1">{card.title}</h3>
                <p className="text-sm text-[#94A3B8] mb-4 leading-relaxed line-clamp-2">{card.headline}</p>
                <p className="text-xs italic text-[#CBD5E1]/70">
                  &ldquo;{card.question}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#3B82F6] group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Pricing Toggle with Cards ─── */

function PricingToggle({ plans }: { plans: Plan[] }) {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <div className="inline-flex items-center gap-3 mb-12">
        <div className="relative flex items-center rounded-full border border-[#334155] p-1" style={{ background: "rgba(30,41,59,0.6)" }}>
          <button
            onClick={() => setAnnual(false)}
            className="relative z-10 px-5 py-2 text-sm font-bold rounded-full transition-colors"
            style={{ color: !annual ? "#F8FAFC" : "#94A3B8" }}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className="relative z-10 px-5 py-2 text-sm font-bold rounded-full transition-colors"
            style={{ color: annual ? "#F8FAFC" : "#94A3B8" }}
          >
            Annually
          </button>
          <motion.div
            layout
            className="absolute top-1 bottom-1 rounded-full bg-[#3B82F6]"
            style={{
              width: "calc(50% - 4px)",
              left: annual ? "calc(50% + 2px)" : "4px",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
        {annual && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs font-bold text-[#14A660] bg-[#14A660]/10 px-2.5 py-1 rounded-full"
          >
            Save 20%
          </motion.span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 transition-all text-left ${
              plan.highlighted
                ? "border-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                : "border-[#334155]/60"
            }`}
            style={{
              background: plan.highlighted ? "rgba(30,41,59,0.6)" : "rgba(30,41,59,0.4)",
            }}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 right-4 rounded-full bg-[#3B82F6] px-3 py-1 text-xs font-bold text-white">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <p className="text-sm text-[#94A3B8] mb-5">{plan.tagline}</p>
            <div className="flex items-baseline gap-2 mb-1">
              {annual && plan.monthlyPrice > 0 && (
                <span className="text-2xl font-bold text-[#64748B] line-through">${plan.monthlyPrice}</span>
              )}
              <span className="text-4xl font-black">
                {plan.monthlyPrice === -1 ? "Custom" : `$${annual ? plan.annualPrice : plan.monthlyPrice}`}
              </span>
              {plan.monthlyPrice > 0 && <span className="text-[#94A3B8] text-sm">/mo</span>}
            </div>
            {annual && plan.annualTotal && (
              <p className="text-xs text-[#64748B] mb-1">
                Billed ${plan.annualTotal}/yr
              </p>
            )}
            {plan.monthlyPrice > 0 && (
              <p className="text-xs text-[#F59E0B] font-bold mb-5">3-day free trial</p>
            )}
            {plan.monthlyPrice === -1 && <div className="mb-5" />}

            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#CBD5E1]">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href={plan.href}>
              <button
                className={`w-full h-11 rounded-xl text-sm font-bold transition-all ${
                  plan.highlighted
                    ? "bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/25"
                    : "border border-[#334155] text-[#F8FAFC] hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5"
                }`}
              >
                {plan.cta}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Main Component ─── */

export function HomepageClient({
  modelCards,
  plans,
  footerLinks,
  featuredPosts,
}: HomepageClientProps) {
  const prefersReduced = useReducedMotion();
  const motionProps = (delay = 0) =>
    prefersReduced
      ? {}
      : {
          initial: "hidden" as const,
          whileInView: "visible" as const,
          viewport: { once: true, margin: "-80px" },
          variants: fadeUp,
          transition: { duration: 0.5, delay },
        };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] overflow-x-hidden">
      {/* ════════════ HERO ════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <HeroBackground />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <motion.div
            {...motionProps(0)}
            className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 px-4 py-1.5 text-xs font-medium text-[#94A3B8]"
            style={{ background: "rgba(59,130,246,0.08)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Trusted by 500+ founders
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...motionProps(0.1)}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight"
          >
            Have a great startup idea?
            <br />
            <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
              Let&apos;s prove it.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            {...motionProps(0.2)}
            className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed"
          >
            Replace months of guesswork with an instant financial model built on real market data.
          </motion.p>

          {/* CTA — single button */}
          <motion.div
            {...motionProps(0.3)}
            className="flex items-center justify-center"
          >
            <Link href="/onboarding/survey">
              <button className="h-12 px-8 bg-[#3B82F6] text-white text-sm font-bold rounded-xl hover:bg-[#2563EB] transition-all hover:shadow-lg hover:shadow-[#3B82F6]/25 hover:-translate-y-0.5">
                Validate My Idea — Free
              </button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p {...motionProps(0.4)} className="text-xs text-[#64748B]">
            No credit card to start &middot; Setup in 2 minutes
          </motion.p>
        </div>

        {/* Animated search bar */}
        <motion.div
          {...motionProps(0.5)}
          className="relative z-10 w-full max-w-5xl mx-auto"
        >
          <AnimatedSearchBar />
        </motion.div>

        {/* Client marquee */}
        <motion.div
          {...motionProps(0.7)}
          className="relative z-10 w-full max-w-4xl mx-auto mt-8"
        >
          <ClientMarquee />
        </motion.div>
      </section>

      <SectionDivider />

      {/* ════════════ BUSINESS MODELS (horizontal scroll) ════════════ */}
      <section id="models" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
              Business Models
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Choose Your Model. Get Real Answers.
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto">
              12 purpose-built models. Pick yours and get a financial projection in minutes.
            </p>
          </motion.div>

          <motion.div {...motionProps(0.1)}>
            <ModelsCarousel cards={modelCards} prefersReduced={prefersReduced} />
          </motion.div>

          {/* CTA after models */}
          <motion.div {...motionProps(0.2)} className="text-center mt-10">
            <Link href="/onboarding/survey">
              <button className="h-12 px-8 bg-[#3B82F6] text-white text-sm font-bold rounded-xl hover:bg-[#2563EB] transition-all hover:shadow-lg hover:shadow-[#3B82F6]/25 hover:-translate-y-0.5">
                Start Building Your Model — Free
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ HOW IT WORKS + FEATURES (merged) ════════════ */}
      <section id="features" className="py-24 px-4" style={{ background: "rgba(30,41,59,0.2)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              From Idea to Investor-Ready in 4 Steps
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto">
              More than a spreadsheet. Less than hiring a CFO. Your financial model becomes your go-to document for tracking business health as you grow.
            </p>
          </motion.div>

          <div className="space-y-8">
            {HOW_IT_WORKS_FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  {...motionProps(i * 0.05)}
                  className="grid md:grid-cols-2 gap-8 items-center rounded-2xl border border-[#334155]/40 p-8 md:p-10 hover:border-[#3B82F6]/30 transition-colors"
                  style={{ background: "rgba(15,23,42,0.5)" }}
                >
                  <div className={i % 2 === 1 ? "md:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#3B82F6]/10 text-[#3B82F6]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#3B82F6] uppercase tracking-widest">Step {item.step}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-[#94A3B8] leading-relaxed">{item.description}</p>
                  </div>
                  <div className={i % 2 === 1 ? "md:order-1" : ""}>
                    {featureVisuals[item.visual]?.()}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ AI CO-PILOT ════════════ */}
      <AISection />

      <SectionDivider />

      {/* ════════════ STATS BAR ════════════ */}
      <section className="py-16 px-4" style={{ background: "rgba(30,41,59,0.3)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { end: 500, suffix: "+", label: "Founders" },
              { end: 1200, suffix: "+", label: "Models Built" },
              { end: 2, suffix: "M+", prefix: "$", label: "Revenue Modeled" },
              { end: 98, suffix: "%", label: "Would Recommend" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="text-3xl md:text-4xl font-black text-[#F8FAFC]">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="text-sm text-[#94A3B8] mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ WHY SUBSCRIBE ════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
              Why Subscribe
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Your idea evolves. So should your model.
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto">
              Revenue Map isn&apos;t a one-time report. It&apos;s a living financial model that becomes your core document for tracking business health as your startup grows.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {WHY_SUBSCRIBE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-[#334155]/60 p-8 hover:border-[#3B82F6]/30 transition-colors"
                  style={{ background: "rgba(30,41,59,0.4)" }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#3B82F6]/10 text-[#3B82F6]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{card.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ PRICING ════════════ */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Pricing That Grows With You
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto mb-8">
              No credit card to start. Cancel anytime.
            </p>

            <PricingToggle plans={plans} />
          </motion.div>

          <motion.div {...motionProps(0.3)} className="text-center mt-10">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            >
              See full pricing and feature comparison
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ BLOG ════════════ */}
      {featuredPosts.length > 0 && (
        <section className="py-24 px-4" style={{ background: "rgba(30,41,59,0.2)" }}>
          <div className="max-w-6xl mx-auto">
            <motion.div {...motionProps()} className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
                Blog
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Latest from the Blog
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-6"
            >
              {featuredPosts.map((post) => (
                <motion.div key={post.slug} variants={fadeUp} transition={{ duration: 0.5 }}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="rounded-2xl border border-[#334155]/40 overflow-hidden hover:border-[#3B82F6]/30 transition-all">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.imageAlt}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-5" style={{ background: "rgba(30,41,59,0.6)" }}>
                        <span className="text-xs font-medium text-[#3B82F6] mb-2 block">
                          {post.category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                        </span>
                        <h3 className="font-bold text-[#F8FAFC] mb-2 line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-[#94A3B8] line-clamp-2">{post.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...motionProps(0.2)} className="text-center mt-10">
              <Link href="/blog">
                <button className="h-10 px-6 text-sm font-bold text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] rounded-xl hover:border-[#3B82F6]/50 transition-all">
                  View All Articles
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="relative py-32 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h2 {...motionProps()} className="text-3xl md:text-5xl font-black mb-5">
            Ready to Know Your Numbers?
          </motion.h2>
          <motion.p {...motionProps(0.1)} className="text-lg text-[#94A3B8] mb-8 max-w-xl mx-auto">
            Join 500+ founders who replaced gut feeling with real financial clarity.
          </motion.p>
          <motion.div {...motionProps(0.2)}>
            <Link href="/onboarding/survey">
              <button className="h-14 px-10 bg-[#3B82F6] text-white text-base font-bold rounded-xl hover:bg-[#2563EB] transition-all hover:shadow-xl hover:shadow-[#3B82F6]/30 hover:-translate-y-0.5 animate-pulse-shadow">
                Validate My Idea — Free
              </button>
            </Link>
          </motion.div>
          <motion.p {...motionProps(0.3)} className="text-xs text-[#64748B] mt-5">
            No credit card to start &middot; Setup in 2 minutes
          </motion.p>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="border-t border-[#334155]/40 py-16 px-4" style={{ background: "rgba(15,23,42,0.8)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <img src="/logo.svg" alt="Revenue Map" className="w-7 h-7" />
                <span className="text-sm font-bold text-[#F8FAFC]">Revenue Map</span>
              </Link>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Validate your startup idea with real financial projections. Not spreadsheet busywork.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-4">
                  {category}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#64748B] hover:text-[#F8FAFC] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[#334155]/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#64748B]">
              &copy; {new Date().getFullYear()} Revenue Map. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  localStorage.removeItem("cookie-consent");
                  window.location.reload();
                }}
                className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

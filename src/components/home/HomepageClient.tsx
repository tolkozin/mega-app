"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  FileText,
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
import { getAllModels, type ModelDefinition } from "@/lib/model-registry";

/* ─── Types ─── */

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
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Animated Search Bar ─── */

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
        <div className="bg-white border border-[#e5e7eb] rounded-2xl pl-6 pr-3 py-3 flex items-center gap-3 shadow-lg shadow-black/5 hover:border-[#2163e7]/30 transition-colors group">
          <Search className="w-5 h-5 text-[#6b7280] shrink-0" />
          <span className="text-[#6b7280] text-lg font-light flex-1 truncate">
            {displayed}
            <span className="animate-pulse text-[#2163e7]">|</span>
          </span>
          <button className="shrink-0 w-10 h-10 rounded-xl bg-[#2163e7] flex items-center justify-center text-white group-hover:bg-[#1a53c7] transition-colors">
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
            className="text-sm font-medium text-[#6b7280] whitespace-nowrap flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2163e7]/40" />
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
    <div className="relative h-48 rounded-xl overflow-hidden bg-[#f8f9fc] border border-[#e5e7eb]">
      <div className="absolute inset-0 flex items-end px-6 pb-6 gap-1">
        {Array.from({ length: 30 }).map((_, i) => {
          const h = 20 + Math.random() * 70;
          return (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${h}%`,
                background: `linear-gradient(to top, rgba(33,99,231,0.2), rgba(33,99,231,${0.05 + Math.random() * 0.3}))`,
              }}
            />
          );
        })}
      </div>
      <div className="absolute top-4 left-6 text-xs text-[#6b7280]">1,000 simulations</div>
      <div className="absolute top-4 right-6 text-xs font-bold text-[#10B981]">78% hit target</div>
    </div>
  );
}

function ScenarioVisual() {
  const scenarios = [
    { label: "Pessimistic", color: "#EF4444", points: "60,190 150,185 240,182 330,178 420,175 510,170" },
    { label: "Base", color: "#2163e7", points: "60,190 150,172 240,155 330,135 420,118 510,100" },
    { label: "Optimistic", color: "#10B981", points: "60,190 150,165 240,135 330,100 420,72 510,45" },
  ];
  return (
    <div className="relative rounded-xl overflow-hidden bg-[#f8f9fc] border border-[#e5e7eb]">
      <svg viewBox="0 0 540 210" className="w-full h-auto">
        <rect width="540" height="210" fill="transparent" rx="12" />
        {scenarios.map((s, i) => (
          <g key={s.label}>
            <circle cx={40 + i * 120} cy="14" r="4" fill={s.color} />
            <text x={50 + i * 120} y="18" fill="#6b7280" fontSize="11" fontFamily="inherit">{s.label}</text>
          </g>
        ))}
        <line x1="40" y1="100" x2="520" y2="100" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="40" y1="140" x2="520" y2="140" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="40" y1="180" x2="520" y2="180" stroke="#e5e7eb" strokeWidth="1" />
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
    <div className="relative h-48 rounded-xl overflow-hidden p-6 flex items-center justify-center bg-[#f8f9fc] border border-[#e5e7eb]">
      <div className="w-32 rounded-lg border border-[#e5e7eb] bg-white p-3 shadow-sm">
        <div className="h-2 w-16 rounded bg-[#2163e7]/30 mb-2" />
        <div className="h-1.5 w-full rounded bg-[#e5e7eb] mb-1.5" />
        <div className="h-1.5 w-3/4 rounded bg-[#e5e7eb] mb-3" />
        <div className="h-8 w-full rounded bg-[#2163e7]/10 mb-2" />
        <div className="h-1.5 w-full rounded bg-[#e5e7eb] mb-1" />
        <div className="h-1.5 w-2/3 rounded bg-[#e5e7eb]" />
      </div>
      <div className="absolute bottom-4 right-6 text-xs text-[#6b7280]">One-click PDF</div>
    </div>
  );
}

function AIAssistantVisual() {
  return (
    <div className="relative h-48 rounded-xl overflow-hidden p-5 bg-[#f8f9fc] border border-[#e5e7eb]">
      <div className="space-y-2.5">
        <div className="flex justify-end">
          <div className="rounded-xl rounded-br-sm px-3 py-2 text-xs text-white max-w-[70%] bg-[#2163e7]">
            Is my churn rate healthy?
          </div>
        </div>
        <div className="flex">
          <div className="rounded-xl rounded-bl-sm px-3 py-2 text-xs text-[#1a1a2e] max-w-[80%] bg-white border border-[#e5e7eb] shadow-sm">
            Your monthly churn is below the industry median. At this rate, your unit economics are sustainable.
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-xl rounded-br-sm px-3 py-2 text-xs text-white max-w-[70%] bg-[#2163e7]">
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

/* ─── How It Works ─── */

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
    description: "Professional financial projections, unit economics, and scenario analysis packaged into a PDF. Ready in 60 seconds.",
    visual: "reports",
    icon: FileText,
  },
];

/* ─── Periodic Table Element Card ─── */

function ElementCard({ model }: { model: ModelDefinition }) {
  const Icon = model.icon;
  return (
    <Link href={`/models/${model.key}`} className="group block">
      <div className="element-card border border-[#e5e7eb] bg-white shadow-sm hover:shadow-md transition-all">
        {/* Element number */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-medium text-[#6b7280]">{model.elementNumber}</span>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: model.elementBg, color: model.elementText }}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        {/* Symbol */}
        <div
          className="text-2xl font-extrabold font-heading mb-0.5"
          style={{ color: model.elementText }}
        >
          {model.elementSymbol}
        </div>
        {/* Name */}
        <div className="text-xs font-medium text-[#1a1a2e] mb-2">{model.label}</div>
        {/* Question */}
        <p className="text-[11px] text-[#6b7280] leading-snug line-clamp-2">{model.headline}</p>
        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: model.elementText }}
        />
      </div>
    </Link>
  );
}

/* ─── Pricing Toggle with Cards ─── */

function PricingToggle({ plans }: { plans: Plan[] }) {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <div className="inline-flex items-center gap-3 mb-12">
        <div className="relative flex items-center rounded-full border border-[#e5e7eb] p-1 bg-white">
          <button
            onClick={() => setAnnual(false)}
            className="relative z-10 px-5 py-2 text-sm font-bold rounded-full transition-colors"
            style={{ color: !annual ? "#fff" : "#6b7280" }}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className="relative z-10 px-5 py-2 text-sm font-bold rounded-full transition-colors"
            style={{ color: annual ? "#fff" : "#6b7280" }}
          >
            Annually
          </button>
          <motion.div
            layout
            className="absolute top-1 bottom-1 rounded-full bg-[#2163e7]"
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
            className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full"
          >
            Save 20%
          </motion.span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 transition-all text-left bg-white ${
              plan.highlighted
                ? "border-[#2163e7] shadow-lg shadow-[#2163e7]/10"
                : "border-[#e5e7eb] shadow-sm"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 right-4 rounded-full bg-[#2163e7] px-3 py-1 text-xs font-bold text-white">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold text-[#1a1a2e] mb-1">{plan.name}</h3>
            <p className="text-sm text-[#6b7280] mb-5">{plan.tagline}</p>
            <div className="flex items-baseline gap-2 mb-1">
              {annual && plan.monthlyPrice > 0 && (
                <span className="text-2xl font-bold text-[#6b7280]/50 line-through">${plan.monthlyPrice}</span>
              )}
              <span className="text-4xl font-black text-[#1a1a2e]">
                {plan.monthlyPrice === -1 ? "Custom" : `$${annual ? plan.annualPrice : plan.monthlyPrice}`}
              </span>
              {plan.monthlyPrice > 0 && <span className="text-[#6b7280] text-sm">/mo</span>}
            </div>
            {annual && plan.annualTotal && (
              <p className="text-xs text-[#6b7280] mb-1">
                Billed ${plan.annualTotal}/yr
              </p>
            )}
            {plan.monthlyPrice > 0 && (
              <p className="text-xs text-[#F59E0B] font-bold mb-5">3-day free trial</p>
            )}
            {plan.monthlyPrice === -1 && <div className="mb-5" />}

            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#1a1a2e]">
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
                    ? "bg-[#2163e7] text-white hover:bg-[#1a53c7] hover:shadow-lg hover:shadow-[#2163e7]/20"
                    : "border border-[#e5e7eb] text-[#1a1a2e] hover:border-[#2163e7]/50 hover:bg-[#2163e7]/5"
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
  plans,
  footerLinks,
  featuredPosts,
}: HomepageClientProps) {
  const models = getAllModels();
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
    <div className="min-h-screen bg-[#f8f9fc] text-[#1a1a2e] overflow-x-hidden">
      {/* ════════════ HERO ════════════ */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-24 pb-16 pt-bg-pattern">
        <HeroBackground />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <motion.div
            {...motionProps(0)}
            className="inline-flex items-center gap-2 rounded-full border border-[#2163e7]/20 px-4 py-1.5 text-xs font-medium text-[#6b7280] bg-white shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Trusted by 500+ founders
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...motionProps(0.1)}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading leading-[1.08] tracking-tight text-[#1a1a2e]"
          >
            Have a great startup idea?
            <br />
            <span className="text-[#2163e7]">
              Let&apos;s prove it.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            {...motionProps(0.2)}
            className="text-lg md:text-xl text-[#6b7280] max-w-2xl mx-auto leading-relaxed"
          >
            Replace months of guesswork with an instant financial model built on real market data.
          </motion.p>

          {/* CTA */}
          <motion.div
            {...motionProps(0.3)}
            className="flex items-center justify-center"
          >
            <Link href="/onboarding/survey">
              <button className="h-12 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-xl hover:bg-[#1a53c7] transition-all hover:shadow-lg hover:shadow-[#2163e7]/20 hover:-translate-y-0.5">
                Validate My Idea — Free
              </button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p {...motionProps(0.4)} className="text-xs text-[#6b7280]">
            Start free &middot; Setup in 2 minutes
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

      {/* ════════════ PERIODIC TABLE — BUSINESS MODELS ════════════ */}
      <section id="models" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2163e7] mb-3 block">
              Business Models
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e] mb-4">
              The Periodic Table of Startups
            </h2>
            <p className="text-[#6b7280] max-w-2xl mx-auto">
              12 purpose-built financial models. Pick your element and get real projections in minutes.
            </p>
          </motion.div>

          {/* Element grid — 4 cols on desktop, 3 on tablet, 2 on mobile */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {models.map((model) => (
              <motion.div key={model.key} variants={fadeUp} transition={{ duration: 0.4 }}>
                <ElementCard model={model} />
              </motion.div>
            ))}
          </motion.div>

          {/* CTA after models */}
          <motion.div {...motionProps(0.2)} className="text-center mt-12">
            <Link href="/onboarding/survey">
              <button className="h-12 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-xl hover:bg-[#1a53c7] transition-all hover:shadow-lg hover:shadow-[#2163e7]/20 hover:-translate-y-0.5">
                Start Building Your Model — Free
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2163e7] mb-3 block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e] mb-4">
              From Idea to Investor-Ready in 4 Steps
            </h2>
            <p className="text-[#6b7280] max-w-2xl mx-auto">
              More than a spreadsheet. Less than hiring a CFO. Your financial model becomes your go-to document for tracking business health.
            </p>
          </motion.div>

          <div className="space-y-8">
            {HOW_IT_WORKS_FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  {...motionProps(i * 0.05)}
                  className="grid md:grid-cols-2 gap-8 items-center rounded-2xl border border-[#e5e7eb] p-8 md:p-10 hover:border-[#2163e7]/30 transition-colors bg-[#f8f9fc]"
                >
                  <div className={i % 2 === 1 ? "md:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#2163e7]/10 text-[#2163e7]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#2163e7] uppercase tracking-widest">Step {item.step}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#1a1a2e] mb-3">{item.title}</h3>
                    <p className="text-[#6b7280] leading-relaxed">{item.description}</p>
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
      <section className="py-16 px-4 bg-[#f8f9fc]">
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
                <div className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e]">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="text-sm text-[#6b7280] mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ WHY SUBSCRIBE ════════════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2163e7] mb-3 block">
              Why Subscribe
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e] mb-4">
              Your idea evolves. So should your model.
            </h2>
            <p className="text-[#6b7280] max-w-2xl mx-auto">
              Revenue Map isn&apos;t a one-time report. It&apos;s a living financial model that grows with your startup.
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
                  className="rounded-2xl border border-[#e5e7eb] p-8 hover:border-[#2163e7]/30 transition-colors bg-[#f8f9fc]"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#2163e7]/10 text-[#2163e7]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">{card.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{card.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ PRICING ════════════ */}
      <section id="pricing" className="py-24 px-4 bg-[#f8f9fc]">
        <div className="max-w-5xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2163e7] mb-3 block">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e] mb-4">
              Predictable pricing, designed to scale
            </h2>
            <p className="text-[#6b7280] max-w-xl mx-auto mb-8">
              3-day free trial. Cancel anytime.
            </p>

            <PricingToggle plans={plans} />
          </motion.div>

          <motion.div {...motionProps(0.3)} className="text-center mt-10">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#2163e7] hover:text-[#1a53c7] transition-colors"
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
        <section className="py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div {...motionProps()} className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2163e7] mb-3 block">
                Blog
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1a1a2e] mb-4">
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
                    <div className="rounded-2xl border border-[#e5e7eb] overflow-hidden hover:border-[#2163e7]/30 transition-all bg-white shadow-sm hover:shadow-md">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.imageAlt}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-5">
                        <span className="text-xs font-medium text-[#2163e7] mb-2 block">
                          {post.category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                        </span>
                        <h3 className="font-bold text-[#1a1a2e] mb-2 line-clamp-2 group-hover:text-[#2163e7] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-[#6b7280] line-clamp-2">{post.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...motionProps(0.2)} className="text-center mt-10">
              <Link href="/blog">
                <button className="h-10 px-6 text-sm font-bold text-[#6b7280] hover:text-[#1a1a2e] border border-[#e5e7eb] rounded-xl hover:border-[#2163e7]/50 transition-all">
                  View All Articles
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="relative py-32 px-4 text-center overflow-hidden pt-bg-pattern">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(33,99,231,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h2 {...motionProps()} className="text-3xl md:text-5xl font-extrabold font-heading text-[#1a1a2e] mb-5">
            Ready to Know Your Numbers?
          </motion.h2>
          <motion.p {...motionProps(0.1)} className="text-lg text-[#6b7280] mb-8 max-w-xl mx-auto">
            Join 500+ founders who replaced gut feeling with real financial clarity.
          </motion.p>
          <motion.div {...motionProps(0.2)}>
            <Link href="/onboarding/survey">
              <button className="h-14 px-10 bg-[#2163e7] text-white text-base font-bold rounded-xl hover:bg-[#1a53c7] transition-all hover:shadow-xl hover:shadow-[#2163e7]/20 hover:-translate-y-0.5 animate-pulse-shadow">
                Validate My Idea — Free
              </button>
            </Link>
          </motion.div>
          <motion.p {...motionProps(0.3)} className="text-xs text-[#6b7280] mt-5">
            Start free &middot; Setup in 2 minutes
          </motion.p>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="border-t border-[#e5e7eb] py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <img src="/logo.svg" alt="Revenue Map" className="w-7 h-7" />
                <span className="text-sm font-bold text-[#1a1a2e]">Revenue Map</span>
              </Link>
              <p className="text-xs text-[#6b7280] leading-relaxed">
                Validate your startup idea with real financial projections. Not spreadsheet busywork.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1a2e] mb-4">
                  {category}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[#e5e7eb] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#6b7280]">
              &copy; {new Date().getFullYear()} Revenue Map. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  localStorage.removeItem("cookie-consent");
                  window.location.reload();
                }}
                className="text-xs text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
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

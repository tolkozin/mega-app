"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroBackground } from "./HeroBackground";
import { DashboardPreview } from "./DashboardPreview";
import { AISection } from "./AISection";
import { RatingWidget } from "./RatingWidget";
import { SectionDivider } from "./SectionDivider";
import { AnimatedCounter } from "./AnimatedCounter";
import type { BlogPost } from "@/types/blog";

/* ─── Types ─── */

interface ModelCard {
  title: string;
  color: string;
  icon: ReactNode;
  headline: string;
  description: string;
  question: string;
}

interface FeatureItem {
  title: string;
  description: string;
  visual: string;
}

interface Step {
  num: string;
  title: string;
  description: string;
  icon: ReactNode;
}

interface Plan {
  name: string;
  tagline: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  whyUpgrade?: string;
}

interface FooterLinks {
  [category: string]: { label: string; href: string }[];
}

interface HomepageClientProps {
  modelCards: ModelCard[];
  featureShowcase: FeatureItem[];
  steps: Step[];
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

        {/* Legend */}
        {scenarios.map((s, i) => (
          <g key={s.label}>
            <circle cx={40 + i * 120} cy="14" r="4" fill={s.color} />
            <text x={50 + i * 120} y="18" fill="#94A3B8" fontSize="11" fontFamily="inherit">{s.label}</text>
          </g>
        ))}

        {/* Grid lines */}
        <line x1="40" y1="100" x2="520" y2="100" stroke="#1E293B" strokeWidth="1" />
        <line x1="40" y1="140" x2="520" y2="140" stroke="#1E293B" strokeWidth="1" />
        <line x1="40" y1="180" x2="520" y2="180" stroke="#1E293B" strokeWidth="1" />

        {/* Lines + dots */}
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
            Your 3.2% monthly churn is below the SaaS median of 5.4%. At this rate, your LTV:CAC of 4.2x is sustainable.
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

/* ─── Main Component ─── */

export function HomepageClient({
  modelCards,
  featureShowcase,
  steps,
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
            Skip the Guesswork.
            <br />
            <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
              Own Your Growth.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            {...motionProps(0.2)}
            className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed"
          >
            For founders who want real answers — not spreadsheet chaos.
            Build projections, run simulations, and get investor-ready
            reports in minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...motionProps(0.3)}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/auth/register">
              <button className="h-12 px-8 bg-[#3B82F6] text-white text-sm font-bold rounded-xl hover:bg-[#2563EB] transition-all hover:shadow-lg hover:shadow-[#3B82F6]/25 hover:-translate-y-0.5">
                Start Free — No Card Needed
              </button>
            </Link>
            <Link href="/#features">
              <button className="h-12 px-8 text-sm font-bold text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] rounded-xl hover:border-[#3B82F6]/50 transition-all">
                See How It Works
              </button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p {...motionProps(0.4)} className="text-xs text-[#64748B]">
            Free plan available &middot; No credit card required &middot; Setup in 2 minutes
          </motion.p>
        </div>

        {/* Floating dashboard preview */}
        <motion.div
          {...motionProps(0.5)}
          className="relative z-10 w-full max-w-5xl mx-auto mt-10"
        >
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl border border-[#334155]/60 overflow-hidden shadow-2xl shadow-black/40"
            style={{ background: "rgba(30,41,59,0.5)", backdropFilter: "blur(20px)" }}
          >
            <DashboardPreview />
          </motion.div>
        </motion.div>

        {/* Rating widget */}
        <motion.div
          {...motionProps(0.7)}
          className="relative z-10 mt-8"
        >
          <RatingWidget />
        </motion.div>
      </section>

      <SectionDivider />

      {/* ════════════ BUSINESS MODELS ════════════ */}
      <section id="models" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
              Business Models
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Choose Your Model. Get Real Answers.
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto">
              Each model is purpose-built with the metrics that matter for your business type.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {modelCards.map((card, i) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                whileHover={prefersReduced ? {} : { y: -4 }}
                className="group rounded-2xl border border-[#334155]/60 p-8 transition-all hover:border-opacity-100 cursor-pointer"
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
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm font-medium text-[#CBD5E1] mb-3">{card.headline}</p>
                <p className="text-sm text-[#94A3B8] mb-5 leading-relaxed">{card.description}</p>
                <div
                  className="text-xs font-medium px-3 py-2 rounded-lg inline-block"
                  style={{ background: `${card.color}10`, color: card.color }}
                >
                  &ldquo;{card.question}&rdquo;
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="py-24 px-4" style={{ background: "rgba(30,41,59,0.2)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Brings more than a Spreadsheet. Costs less than a CFO.
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto">
              Professional-grade financial tools designed for speed and efficiency.
            </p>
          </motion.div>

          <div className="space-y-8">
            {featureShowcase.map((feature, i) => (
              <motion.div
                key={feature.title}
                {...motionProps(i * 0.05)}
                className="grid md:grid-cols-2 gap-8 items-center rounded-2xl border border-[#334155]/40 p-8 md:p-10 hover:border-[#3B82F6]/30 transition-colors"
                style={{ background: "rgba(15,23,42,0.5)" }}
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed">{feature.description}</p>
                </div>
                <div className={i % 2 === 1 ? "md:order-1" : ""}>
                  {featureVisuals[feature.visual]?.()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ AI CO-PILOT ════════════ */}
      <AISection />

      <SectionDivider />

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              From Zero to Investor-Ready in 3 Steps
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="space-y-6"
          >
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex gap-6 items-start rounded-2xl border border-[#334155]/40 p-6 md:p-8 hover:border-[#3B82F6]/30 transition-colors"
                style={{ background: "rgba(30,41,59,0.3)" }}
              >
                <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-[#3B82F6]/10 text-[#3B82F6]">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-xs font-bold text-[#3B82F6]">{step.num}</span>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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
                  <AnimatedCounter
                    end={stat.end}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                </div>
                <div className="text-sm text-[#94A3B8] mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════ PRICING ════════════ */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...motionProps()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] mb-3 block">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              Start free. Upgrade when you need more power.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 items-start"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className={`relative rounded-2xl border p-8 transition-all ${
                  plan.highlighted
                    ? "border-[#3B82F6]/60 shadow-lg shadow-[#3B82F6]/10"
                    : "border-[#334155]/60"
                }`}
                style={{
                  background: plan.highlighted
                    ? "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))"
                    : "rgba(30,41,59,0.4)",
                }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#3B82F6] px-4 py-1 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-[#94A3B8] mb-5">{plan.tagline}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{plan.price}</span>
                  {plan.period && <span className="text-[#94A3B8] text-sm">{plan.period}</span>}
                </div>
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
                <Link href={plan.name === "Enterprise" ? "#" : "/auth/register"}>
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
                {plan.whyUpgrade && (
                  <p className="text-xs text-[#64748B] mt-4 text-center italic">{plan.whyUpgrade}</p>
                )}
              </motion.div>
            ))}
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
                          {post.category
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
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
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h2
            {...motionProps()}
            className="text-3xl md:text-5xl font-black mb-5"
          >
            Ready to Know Your Numbers?
          </motion.h2>
          <motion.p
            {...motionProps(0.1)}
            className="text-lg text-[#94A3B8] mb-8 max-w-xl mx-auto"
          >
            Join 500+ founders who replaced gut feeling with real financial clarity.
          </motion.p>
          <motion.div {...motionProps(0.2)}>
            <Link href="/auth/register">
              <button className="h-14 px-10 bg-[#3B82F6] text-white text-base font-bold rounded-xl hover:bg-[#2563EB] transition-all hover:shadow-xl hover:shadow-[#3B82F6]/30 hover:-translate-y-0.5 animate-pulse-shadow">
                Start Free — Build Your First Model
              </button>
            </Link>
          </motion.div>
          <motion.p {...motionProps(0.3)} className="text-xs text-[#64748B] mt-5">
            No credit card &middot; Free plan &middot; 2-minute setup
          </motion.p>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="border-t border-[#334155]/40 py-16 px-4" style={{ background: "rgba(15,23,42,0.8)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <img src="/logo.svg" alt="Revenue Map" className="w-7 h-7" />
                <span className="text-sm font-bold text-[#F8FAFC]">Revenue Map</span>
              </Link>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Financial modeling for founders who need real answers, not spreadsheet busywork.
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

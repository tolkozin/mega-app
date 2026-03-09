import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { SoftwareApplicationJsonLd } from "@/components/blog/StructuredData";

/* ─── Data ─── */

const modelCards = [
  {
    title: "Subscription",
    color: "#5E81F4",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    features: ["MRR & ARR tracking", "Churn cohort analysis", "Trial conversion funnels", "67+ configurable parameters"],
  },
  {
    title: "E-commerce",
    color: "#F4845E",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    features: ["AOV & COGS modeling", "CPC & ad spend tracking", "Repeat purchase curves", "Full unit economics"],
  },
  {
    title: "SaaS B2B",
    color: "#7B61FF",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    features: ["ARR & NRR metrics", "Quick Ratio & Rule of 40", "Seat-based pricing models", "Magic Number analysis"],
  },
];

const featureShowcase = [
  {
    title: "Monte Carlo Simulation",
    description: "Run 1,000+ simulations to stress-test your model. Understand confidence intervals, risk profiles, and the probability of hitting your targets.",
    visual: "monte-carlo",
  },
  {
    title: "Scenario Analysis",
    description: "Compare base, optimistic, and pessimistic outcomes side by side. Adjust sensitivity parameters and see the impact in real time.",
    visual: "scenarios",
  },
  {
    title: "Investor Reports",
    description: "Generate beautiful PDF reports ready for investors. One-click export with all your charts, metrics, and projections.",
    visual: "reports",
  },
];

const steps = [
  {
    num: "01",
    title: "Create a Project",
    description: "Choose your business model type — subscription, e-commerce, or SaaS B2B.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Configure Parameters",
    description: "Set growth phases, pricing tiers, churn rates, and 67+ other variables.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Get Insights",
    description: "Interactive charts, scenario comparisons, and investor-ready PDF reports.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["1 project", "3 scenarios per project", "All charts & reports", "CSV export"],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    features: ["Unlimited projects", "Unlimited scenarios", "Monte Carlo simulation", "Public dashboards", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "Team workspace", "Custom branding", "API access", "Dedicated support"],
  },
];

const footerLinks = {
  Product: [
    { label: "Subscription Modeling", href: "/#models" },
    { label: "E-commerce Modeling", href: "/#models" },
    { label: "SaaS B2B Modeling", href: "/#models" },
    { label: "Monte Carlo", href: "/#features" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Pricing", href: "/pricing" },
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const logoCompanies = ["Acme Corp", "Vertex AI", "NovaTech", "Luminary", "Stratton", "Pinnacle"];

/* ─── Inline visual components ─── */

function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-4xl mt-16 rounded-xl border border-[#ECECF2] bg-white shadow-2xl shadow-[#5E81F4]/10 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ECECF2] bg-[#FAFAFE]">
        <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
        <div className="w-3 h-3 rounded-full bg-[#FFD93D]" />
        <div className="w-3 h-3 rounded-full bg-[#6BCB77]" />
        <div className="ml-4 h-4 w-48 rounded bg-[#ECECF2]" />
      </div>
      <div className="flex">
        {/* Mini sidebar */}
        <div className="hidden md:flex flex-col w-14 bg-[#1C1D21] py-4 items-center gap-4">
          <div className="w-7 h-7 rounded-lg bg-[#5E81F4] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">R</span>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-6 h-6 rounded bg-white/10" />
          ))}
        </div>
        {/* Content area */}
        <div className="flex-1 p-4 md:p-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "MRR", value: "$48.2K", change: "+12.3%", up: true },
              { label: "Customers", value: "1,247", change: "+8.1%", up: true },
              { label: "Churn", value: "3.2%", change: "-0.5%", up: true },
              { label: "LTV", value: "$2,840", change: "+15.7%", up: true },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-[#ECECF2] p-3">
                <div className="text-[10px] text-[#8181A5] mb-1">{kpi.label}</div>
                <div className="text-base md:text-lg font-bold text-[#1C1D21]">{kpi.value}</div>
                <div className="text-[10px] text-green-500 font-medium">{kpi.change}</div>
              </div>
            ))}
          </div>
          {/* Chart placeholder */}
          <div className="rounded-lg border border-[#ECECF2] p-4">
            <div className="text-xs text-[#8181A5] mb-3">Revenue Over Time</div>
            <div className="flex items-end gap-1.5 h-24">
              {[35, 42, 38, 50, 45, 55, 48, 62, 58, 70, 65, 78].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all"
                  style={{
                    height: `${h}%`,
                    background: i >= 10 ? "#5E81F4" : i >= 8 ? "#7B9AF7" : "#BCC9F9",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonteCarloVisual() {
  return (
    <div className="rounded-xl border border-[#ECECF2] bg-white p-5 shadow-sm">
      <div className="text-xs text-[#8181A5] mb-3">Revenue Distribution (1,000 runs)</div>
      <div className="flex items-end gap-0.5 h-32">
        {[8, 12, 18, 28, 45, 65, 85, 100, 90, 72, 55, 38, 25, 15, 10].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${h}%`,
              background: i >= 5 && i <= 9 ? "#5E81F4" : "#E8EDFD",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-[#8181A5]">
        <span>P10: $1.2M</span>
        <span className="font-medium text-[#5E81F4]">Median: $2.4M</span>
        <span>P90: $3.8M</span>
      </div>
    </div>
  );
}

function ScenarioVisual() {
  return (
    <div className="rounded-xl border border-[#ECECF2] bg-white p-5 shadow-sm">
      <div className="text-xs text-[#8181A5] mb-3">Scenario Comparison</div>
      <div className="space-y-3">
        {[
          { label: "Optimistic", value: "$4.2M", width: "90%", color: "#6BCB77" },
          { label: "Base", value: "$2.8M", width: "65%", color: "#5E81F4" },
          { label: "Pessimistic", value: "$1.4M", width: "35%", color: "#F4845E" },
        ].map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#1C1D21] font-medium">{s.label}</span>
              <span className="text-[#8181A5]">{s.value}</span>
            </div>
            <div className="h-3 rounded-full bg-[#F8F8FC]">
              <div className="h-full rounded-full" style={{ width: s.width, background: s.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportVisual() {
  return (
    <div className="rounded-xl border border-[#ECECF2] bg-white p-5 shadow-sm">
      <div className="text-xs text-[#8181A5] mb-3">Investor Report Preview</div>
      <div className="space-y-2.5">
        <div className="h-3 w-3/4 rounded bg-[#1C1D21]" />
        <div className="h-2 w-full rounded bg-[#ECECF2]" />
        <div className="h-2 w-5/6 rounded bg-[#ECECF2]" />
        <div className="h-16 rounded bg-[#E8EDFD] mt-3 flex items-center justify-center">
          <div className="flex items-end gap-1 h-8">
            {[40, 55, 45, 65, 60, 80].map((h, i) => (
              <div key={i} className="w-3 rounded-t bg-[#5E81F4]" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="h-2 w-full rounded bg-[#ECECF2]" />
        <div className="h-2 w-2/3 rounded bg-[#ECECF2]" />
        <div className="flex gap-2 mt-2">
          <div className="h-6 flex-1 rounded bg-[#5E81F4] flex items-center justify-center">
            <span className="text-[9px] text-white font-medium">Download PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const visuals: Record<string, React.ReactNode> = {
  "monte-carlo": <MonteCarloVisual />,
  scenarios: <ScenarioVisual />,
  reports: <ReportVisual />,
};

/* ─── Page ─── */

export default function LandingPage() {
  const featuredPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <SoftwareApplicationJsonLd />
      <LandingNavbar />

      {/* ── Section 1: Hero ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #FFFFFF 100%)" }}>
        <div className="container mx-auto px-4 pt-20 md:pt-28 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#1C1D21] mb-6 leading-tight">
            Financial Modeling That
            <br />
            <span className="text-[#5E81F4]">Drives Decisions</span>
          </h1>
          <p className="text-base md:text-lg text-[#8181A5] max-w-2xl mx-auto mb-8 leading-relaxed">
            Build investor-ready models for subscription, e-commerce, and SaaS. Monte Carlo simulations,
            scenario analysis, and real-time dashboards — no spreadsheets needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <button className="h-12 px-8 bg-[#5E81F4] text-white font-bold text-sm rounded-lg hover:bg-[#4B6FE0] transition-colors shadow-lg shadow-[#5E81F4]/25">
                Get Started Free
              </button>
            </Link>
            <Link href="/#features">
              <button className="h-12 px-8 border border-[#ECECF2] text-[#1C1D21] font-bold text-sm rounded-lg hover:bg-[#F8F8FC] transition-colors">
                See Live Demo
              </button>
            </Link>
          </div>
        </div>
        <DashboardPreview />
        <div className="h-16" />
      </section>

      {/* ── Section 2: Logo Bar ── */}
      <section className="py-12 border-y border-[#ECECF2]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-[#8181A5] mb-8">
            Trusted by founders and finance teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logoCompanies.map((name) => (
              <span key={name} className="text-lg font-bold text-[#CDCDE0] tracking-wider select-none">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Three Model Types ── */}
      <section id="models" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">
              One Platform, Three Business Models
            </h2>
            <p className="text-[#8181A5] max-w-xl mx-auto">
              Whether you&apos;re building a subscription app, running an e-commerce store, or scaling a B2B SaaS — we&apos;ve got you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {modelCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-[#ECECF2] p-6 hover:shadow-lg transition-shadow"
                style={{ borderTopWidth: "3px", borderTopColor: card.color }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1C1D21] mb-3">{card.title}</h3>
                <ul className="space-y-2 mb-5">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-center text-sm text-[#8181A5]">
                      <svg className="w-4 h-4 mr-2 shrink-0" style={{ color: card.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="text-sm font-bold transition-colors hover:opacity-80" style={{ color: card.color }}>
                  Explore →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Feature Showcase ── */}
      <section id="features" className="py-20 md:py-28 bg-[#F8F8FC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">
              Powerful Tools, Zero Complexity
            </h2>
            <p className="text-[#8181A5] max-w-xl mx-auto">
              Enterprise-grade financial modeling made simple.
            </p>
          </div>
          <div className="space-y-20">
            {featureShowcase.map((feature, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <div
                  key={feature.title}
                  className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10 max-w-5xl mx-auto`}
                >
                  <div className="flex-1 w-full">{visuals[feature.visual]}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#1C1D21] mb-3">{feature.title}</h3>
                    <p className="text-[#8181A5] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5: Metrics Bar ── */}
      <section className="py-16 bg-[#1C1D21]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "67+", label: "Parameters" },
              { value: "3", label: "Business Models" },
              { value: "1,000+", label: "Simulations" },
              { value: "1-Click", label: "PDF Reports" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-[#8181A5]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: How It Works ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-[#8181A5] max-w-xl mx-auto">
              Three simple steps to your first financial model.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F0F3FE] flex items-center justify-center mx-auto mb-4 text-[#5E81F4]">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-[#5E81F4] mb-2">STEP {step.num}</div>
                <h3 className="text-lg font-bold text-[#1C1D21] mb-2">{step.title}</h3>
                <p className="text-sm text-[#8181A5]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Pricing ── */}
      <section id="pricing" className="py-20 md:py-28 bg-[#F8F8FC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#8181A5] max-w-xl mx-auto">
              Start free and upgrade when you need more power.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl border p-6 relative ${
                  plan.highlighted
                    ? "border-[#5E81F4] shadow-xl shadow-[#5E81F4]/10"
                    : "border-[#ECECF2]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5E81F4] text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#1C1D21] mb-1">{plan.name}</h3>
                <div className="mb-5">
                  <span className="text-4xl font-black text-[#1C1D21]">{plan.price}</span>
                  <span className="text-[#8181A5] text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center text-sm text-[#8181A5]">
                      <svg className="w-4 h-4 mr-2 text-[#5E81F4] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block">
                  <button
                    className={`w-full h-11 text-sm font-bold rounded-lg transition-colors ${
                      plan.highlighted
                        ? "bg-[#5E81F4] text-white hover:bg-[#4B6FE0]"
                        : "border border-[#ECECF2] text-[#1C1D21] hover:bg-[#F8F8FC]"
                    }`}
                  >
                    {plan.name === "Enterprise" ? "Contact Us" : "Get Started"}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8: Blog ── */}
      {featuredPosts.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-[#1C1D21]">From the Blog</h2>
              <Link href="/blog">
                <button className="h-9 px-4 border border-[#ECECF2] text-[#1C1D21] text-sm font-bold rounded-lg hover:bg-[#F8F8FC] transition-colors">
                  View All Articles
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 9: CTA Banner ── */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #5E81F4 0%, #4B6FE0 50%, #7B61FF 100%)" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Financial Model?
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Join hundreds of founders using Revenue Map to make better financial decisions.
          </p>
          <Link href="/auth/register">
            <button className="h-12 px-8 bg-white text-[#5E81F4] font-bold text-sm rounded-lg hover:bg-white/90 transition-colors shadow-lg">
              Get Started Free
            </button>
          </Link>
        </div>
      </section>

      {/* ── Section 10: Footer ── */}
      <footer className="bg-[#1C1D21] pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#5E81F4] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-lg font-bold text-white">Revenue Map</span>
              </div>
              <p className="text-sm text-[#8181A5]">
                Financial modeling for modern businesses.
              </p>
            </div>
            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-bold text-white mb-4">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-[#8181A5] hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-[#8181A5]">
              &copy; {new Date().getFullYear()} Revenue Map. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

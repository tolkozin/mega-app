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
    headline: "Find your break-even. Predict churn before it kills growth.",
    description: "Model your MRR, ARR, trial conversions, and cohort retention with 67+ parameters across 3 growth phases.",
    question: "Will my subscription business be profitable?",
    /* ORIGINAL features: ["MRR & ARR tracking", "Churn cohort analysis", "Trial conversion funnels", "67+ configurable parameters"] */
  },
  {
    title: "E-commerce",
    color: "#F4845E",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    headline: "Know your true unit economics — not just revenue.",
    description: "Model AOV, CAC, COGS, ad spend, and repeat purchases. See if each customer actually makes you money.",
    question: "Am I spending too much to acquire customers?",
    /* ORIGINAL features: ["AOV & COGS modeling", "CPC & ad spend tracking", "Repeat purchase curves", "Full unit economics"] */
  },
  {
    title: "SaaS B2B",
    color: "#7B61FF",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    headline: "Metrics that investors actually look at.",
    description: "ARR, NRR, Quick Ratio, Rule of 40, Magic Number — all calculated, benchmarked, and investor-ready.",
    question: "Am I growing efficiently enough?",
    /* ORIGINAL features: ["ARR & NRR metrics", "Quick Ratio & Rule of 40", "Seat-based pricing models", "Magic Number analysis"] */
  },
];

const featureShowcase = [
  {
    title: "Monte Carlo Simulation",
    /* ORIGINAL: "Run 1,000+ simulations to stress-test your model. Understand confidence intervals, risk profiles, and the probability of hitting your targets." */
    description: "\"What are the odds I hit my revenue target?\" Run 1,000+ simulations to stress-test your assumptions. See confidence intervals and the probability of breakeven.",
    visual: "monte-carlo",
  },
  {
    title: "Scenario Analysis",
    /* ORIGINAL: "Compare base, optimistic, and pessimistic outcomes side by side. Adjust sensitivity parameters and see the impact in real time." */
    description: "\"What if growth slows down?\" Compare base, optimistic, and pessimistic outcomes side by side. Adjust any parameter and see the impact instantly.",
    visual: "scenarios",
  },
  {
    title: "Investor Report — One Button",
    /* ORIGINAL: "Generate beautiful PDF reports ready for investors. One-click export with all your charts, metrics, and projections." */
    description: "Your unit economics, projections, and scenario analysis — packaged into a professional PDF. Ready to send in 60 seconds. No consultant. No Excel. No formatting.",
    visual: "reports",
  },
  {
    title: "AI Financial Assistant",
    description: "Your numbers + real benchmarks = honest advice. Ask anything about your model. It knows your data AND the industry benchmarks — so it tells you if your churn is high, your CAC is unsustainable, or your runway is shorter than you think.",
    visual: "ai-assistant",
  },
];

const steps = [
  {
    num: "01",
    title: "Choose your business model",
    /* ORIGINAL: "Choose your business model type — subscription, e-commerce, or SaaS B2B." */
    description: "Subscription, e-commerce, or SaaS B2B. Start from scratch or upload your existing data.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Configure your assumptions",
    /* ORIGINAL: "Set growth phases, pricing tiers, churn rates, and 67+ other variables." */
    description: "Set pricing, growth targets, churn estimates, and costs. AI pre-fills benchmarks based on your industry — so you never start from zero.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Get your financial picture",
    /* ORIGINAL: "Interactive charts, scenario comparisons, and investor-ready PDF reports." */
    description: "Instant dashboards, scenario comparisons, benchmark analysis, and a one-click investor report. Come back monthly to track reality vs. your plan.",
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
    tagline: "Perfect for validating your first idea.",
    price: "$0",
    period: "forever",
    features: ["1 project", "3 scenarios per project", "All charts & reports", "CSV export", "AI assistant (basic)"],
    cta: "Start Free — No Card Needed",
  },
  {
    name: "Pro",
    tagline: "For founders who are serious about their numbers.",
    price: "$29",
    period: "/mo",
    features: [
      "Unlimited projects & scenarios",
      "Monte Carlo simulation (1,000+ runs)",
      "AI assistant with full benchmark data",
      "Public shareable dashboards",
      "One-click investor PDF reports",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start Pro",
    whyUpgrade: "Most founders upgrade after their first investor meeting asks for more detail.",
  },
  {
    name: "Enterprise",
    tagline: "For teams that need it all.",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "Team workspace", "Custom branding", "API access", "Dedicated support"],
    cta: "Contact Us",
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
          <img src="/logo.svg" alt="Revenue Map" className="w-7 h-7" />
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

function AIAssistantVisual() {
  return (
    <div className="rounded-xl border border-[#ECECF2] bg-white p-5 shadow-sm">
      <div className="text-xs text-[#8181A5] mb-3">AI Assistant</div>
      <div className="space-y-2">
        <div className="flex justify-end">
          <div className="bg-[#5E81F4] text-white text-[11px] px-3 py-1.5 rounded-lg max-w-[75%]">Is my churn rate too high?</div>
        </div>
        <div className="flex justify-start">
          <div className="bg-[#F0F0F5] text-[#1C1D21] text-[11px] px-3 py-1.5 rounded-lg max-w-[85%]">
            Your churn of 8% is above the SaaS benchmark of ~5%. Reducing by 2pp would add ~$12K MRR by month 12.
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-[#5E81F4] text-white text-[11px] px-3 py-1.5 rounded-lg max-w-[75%]">Set my ad budget to $5K</div>
        </div>
        <div className="flex justify-start">
          <div className="bg-[#F0F4FF] border border-[#5E81F4]/20 text-[11px] px-3 py-1.5 rounded-lg">
            <span className="text-[#5E81F4] font-medium">Config update:</span>
            <span className="text-[#3A3A4A]"> Ad Budget → $5,000 (all phases)</span>
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
  "ai-assistant": <AIAssistantVisual />,
};

/* ─── Page ─── */

export default function LandingPage() {
  const featuredPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <SoftwareApplicationJsonLd />
      <LandingNavbar />

      {/* ── Section 1: Hero ── */}
      {/* ORIGINAL headline: "Financial Modeling That Drives Decisions" */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #FFFFFF 100%)" }}>
        <div className="container mx-auto px-4 pt-20 md:pt-28 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#1C1D21] mb-6 leading-tight">
            Know If Your Idea
            <br />
            <span className="text-[#5E81F4]">Will Make Money.</span>
          </h1>
          <p className="text-base md:text-lg text-[#8181A5] max-w-2xl mx-auto mb-4 leading-relaxed">
            Before you build. Before you pitch. Before you spend.
          </p>
          <p className="text-sm md:text-base text-[#8181A5] max-w-2xl mx-auto mb-8 leading-relaxed">
            Upload your data or start from scratch. Revenue Map models your
            SaaS, subscription, or e-commerce business — then tells you
            exactly where you stand against real industry benchmarks.
            <br className="hidden md:block" />
            No spreadsheets. No finance degree. No consultants.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/auth/register">
              <button className="h-12 px-8 bg-[#5E81F4] text-white font-bold text-sm rounded-lg hover:bg-[#4B6FE0] transition-colors shadow-lg shadow-[#5E81F4]/25">
                Start Free — No Credit Card
              </button>
            </Link>
            <Link href="#how-it-works">
              <button className="h-12 px-8 border border-[#ECECF2] text-[#1C1D21] font-bold text-sm rounded-lg hover:bg-[#F8F8FC] transition-colors">
                See How It Works
              </button>
            </Link>
          </div>
          {/* TODO: update with real data */}
          <p className="text-xs text-[#8181A5] mt-4">Joined by 500+ founders modeling their next big idea</p>
        </div>
        <DashboardPreview />
        <div className="h-16" />
      </section>

      {/* ── Section 2: Social Proof Bar ── */}
      {/* ORIGINAL: logo company names bar — replaced with stat pills */}
      <section className="py-6 bg-[#1C1D21]">
        <div className="container mx-auto px-4">
          {/* TODO: update with real data */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#8181A5]">
            <span className="font-medium text-white/90">500+ Founders</span>
            <span className="text-white/20">|</span>
            <span className="font-medium text-white/90">2,400+ Models Built</span>
            <span className="text-white/20">|</span>
            <span className="font-medium text-white/90">1-Click Investor Reports</span>
            <span className="text-white/20">|</span>
            <span className="font-medium text-white/90">Real Benchmarks from 10,000+ Companies</span>
          </div>
        </div>
      </section>

      {/* ── Section 3: Pain Section ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">
              Most founders fly blind. Don&apos;t be one of them.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                emoji: "🎯",
                title: "\"I think my idea will work\"",
                text: "Thinking isn't knowing. Most ideas fail not because of bad execution — but because the economics were broken from day one.",
              },
              {
                emoji: "📊",
                title: "\"I'll figure out the numbers later\"",
                text: "Later is usually when an investor asks. Or when you've already spent $50K building something that can't make money.",
              },
              {
                emoji: "🤷",
                title: "\"I don't know how to model a business\"",
                text: "You don't need to. Revenue Map does it for you — and compares your numbers to thousands of real companies.",
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl border border-[#ECECF2] p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{card.emoji}</div>
                <h3 className="text-base font-bold text-[#1C1D21] mb-2">{card.title}</h3>
                <p className="text-sm text-[#8181A5] leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Three Model Types ── */}
      {/* ORIGINAL section title: "One Platform, Three Business Models" with feature bullet lists */}
      <section id="models" className="py-20 md:py-28 bg-[#F8F8FC]">
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
                <h3 className="text-lg font-bold text-[#1C1D21] mb-2">{card.title}</h3>
                <p className="text-sm font-medium text-[#1C1D21] mb-2">{card.headline}</p>
                <p className="text-sm text-[#8181A5] mb-4 leading-relaxed">{card.description}</p>
                <p className="text-sm font-bold italic mb-4" style={{ color: card.color }}>
                  → {card.question}
                </p>
                <Link href="/auth/register" className="text-sm font-bold transition-colors hover:opacity-80" style={{ color: card.color }}>
                  Start Modeling →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Feature Showcase ── */}
      {/* ORIGINAL headline: "Powerful Tools, Zero Complexity" */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">
              Everything you need to go from idea to investor meeting.
            </h2>
            <p className="text-[#8181A5] max-w-xl mx-auto">
              No finance background required. Revenue Map handles the modeling — you focus on the business.
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

      {/* ── Section 5b: Metrics Bar ── */}
      {/* ORIGINAL: 67+ Parameters / 3 Business Models / 1,000+ Simulations / 1-Click PDF Reports */}
      <section className="py-16 bg-[#1C1D21]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "67+", label: "Model Parameters" },
              { value: "3", label: "Business Models" },
              { value: "Real", label: "Industry Benchmarks" },
              { value: "1-Click", label: "Investor PDF" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-[#8181A5]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Who It's For ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">
              Built for builders, not accountants.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                emoji: "🛠",
                title: "Building a pet project?",
                text: "Find out if your side project can become a real business before you spend the next 6 months building it.",
                cta: "Validate the economics first",
              },
              {
                emoji: "🚀",
                title: "Preparing for investors?",
                text: "Show up with real numbers. Unit economics, P&L, cashflow, and a one-page investor report — built in one evening.",
                cta: "Look like you know your numbers",
              },
              {
                emoji: "⚡",
                title: "Evaluating multiple ideas?",
                text: "Compare 3 business models in 30 minutes. Kill the bad ones fast. Double down on what actually works.",
                cta: "Decide with data, not gut",
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl border border-[#ECECF2] p-6 hover:shadow-lg transition-shadow text-center">
                <div className="text-4xl mb-4">{card.emoji}</div>
                <h3 className="text-lg font-bold text-[#1C1D21] mb-2">{card.title}</h3>
                <p className="text-sm text-[#8181A5] leading-relaxed mb-4">{card.text}</p>
                <span className="text-sm font-bold text-[#5E81F4]">→ {card.cta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: How It Works ── */}
      {/* ORIGINAL headline: "Get Started in Minutes" */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#F8F8FC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">
              From idea to financial clarity in 15 minutes.
            </h2>
            <p className="text-[#8181A5] max-w-xl mx-auto">
              Three simple steps. No finance background required.
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
          <div className="text-center mt-12">
            <Link href="/auth/register">
              <button className="h-12 px-8 bg-[#5E81F4] text-white font-bold text-sm rounded-lg hover:bg-[#4B6FE0] transition-colors shadow-lg shadow-[#5E81F4]/25">
                Try It Free — Takes 15 Minutes
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 8: Testimonials ── */}
      {/* TODO: replace with real testimonials */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">
              Founders who stopped guessing.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* TODO: replace with real testimonials */}
            {[
              {
                quote: "I spent 3 hours in Revenue Map instead of 3 weeks in Excel. My investor called it the clearest model she'd seen from a pre-seed founder.",
                name: "Alex M.",
                role: "SaaS Founder, Pre-Seed",
              },
              {
                quote: "As a developer, I had no idea if my app's pricing would ever be profitable. Revenue Map showed me my break-even in 10 minutes — and I pivoted before launch.",
                name: "Dmitri K.",
                role: "Indie Developer",
              },
              {
                quote: "I evaluate 4-5 ideas a month. Revenue Map cut my analysis time in half and gave me a framework I actually trust.",
                name: "Sarah L.",
                role: "Serial Entrepreneur",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-[#ECECF2] p-6">
                <div className="text-[#5E81F4] mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                </div>
                <p className="text-sm text-[#3A3A4A] leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="text-sm font-bold text-[#1C1D21]">{t.name}</div>
                  <div className="text-xs text-[#8181A5]">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 9: Pricing ── */}
      {/* ORIGINAL headline: "Simple, Transparent Pricing" / "Start free and upgrade when you need more power." */}
      <section id="pricing" className="py-20 md:py-28 bg-[#F8F8FC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1D21] mb-4">Start free. Upgrade when it clicks.</h2>
            <p className="text-[#8181A5] max-w-xl mx-auto">
              The Free plan gives you everything to validate your first idea. Pro unlocks unlimited modeling when you&apos;re ready to go deeper.
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
                <h3 className="text-lg font-bold text-[#1C1D21] mb-0.5">{plan.name}</h3>
                <p className="text-xs text-[#8181A5] mb-3">{plan.tagline}</p>
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
                {plan.whyUpgrade && (
                  <p className="text-[11px] text-[#8181A5] italic mb-4">{plan.whyUpgrade}</p>
                )}
                <Link href={plan.name === "Enterprise" ? "#" : "/auth/register"} className="block">
                  <button
                    className={`w-full h-11 text-sm font-bold rounded-lg transition-colors ${
                      plan.highlighted
                        ? "bg-[#5E81F4] text-white hover:bg-[#4B6FE0]"
                        : "border border-[#ECECF2] text-[#1C1D21] hover:bg-[#F8F8FC]"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 10: Blog ── */}
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

      {/* ── Section 11: Final CTA Banner ── */}
      {/* ORIGINAL: "Ready to Build Your Financial Model?" */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #5E81F4 0%, #4B6FE0 50%, #7B61FF 100%)" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Your next big idea deserves a real financial model.
          </h2>
          <p className="text-lg text-white/90 mb-1">Not a guess. Not a hope. A model.</p>
          {/* TODO: update with real data */}
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Join 500+ founders who stopped guessing and started knowing.
            <br />
            Takes 15 minutes. Free forever to start.
          </p>
          <Link href="/auth/register">
            <button className="h-12 px-8 bg-white text-[#5E81F4] font-bold text-sm rounded-lg hover:bg-white/90 transition-colors shadow-lg">
              Build Your Model Free
            </button>
          </Link>
          <p className="text-xs text-white/60 mt-4">No credit card · No spreadsheets · No finance degree required</p>
        </div>
      </section>

      {/* ── Section 12: Footer ── */}
      <footer className="bg-[#1C1D21] pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" />
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

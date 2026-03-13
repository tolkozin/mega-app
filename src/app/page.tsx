import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { SoftwareApplicationJsonLd } from "@/components/blog/StructuredData";
import { HomepageClient } from "@/components/home/HomepageClient";

/* ─── Data ─── */

const modelCards = [
  {
    title: "Subscription",
    color: "#3B82F6",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    headline: "Find your break-even. Predict churn before it kills growth.",
    description: "Model your MRR, ARR, trial conversions, and cohort retention with 67+ parameters across 3 growth phases.",
    question: "Will my subscription business be profitable?",
  },
  {
    title: "E-commerce",
    color: "#F59E0B",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    headline: "Know your true unit economics — not just revenue.",
    description: "Model AOV, CAC, COGS, ad spend, and repeat purchases. See if each customer actually makes you money.",
    question: "Am I spending too much to acquire customers?",
  },
  {
    title: "SaaS B2B",
    color: "#8B5CF6",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    headline: "Metrics that investors actually look at.",
    description: "ARR, NRR, Quick Ratio, Rule of 40, Magic Number — all calculated, benchmarked, and investor-ready.",
    question: "Am I growing efficiently enough?",
  },
];

const featureShowcase = [
  {
    title: "AI Financial Assistant",
    description: "Your numbers + real benchmarks = honest advice. Ask anything about your model. It knows your data AND the industry benchmarks — so it tells you if your churn is high, your CAC is unsustainable, or your runway is shorter than you think.",
    visual: "ai-assistant",
  },
  {
    title: "Monte Carlo Simulation",
    description: "\"What are the odds I hit my revenue target?\" Run 1,000+ simulations to stress-test your assumptions. See confidence intervals and the probability of breakeven.",
    visual: "monte-carlo",
  },
  {
    title: "Scenario Analysis",
    description: "\"What if growth slows down?\" Compare base, optimistic, and pessimistic outcomes side by side. Adjust any parameter and see the impact instantly.",
    visual: "scenarios",
  },
  {
    title: "Investor Report — One Button",
    description: "Your unit economics, projections, and scenario analysis — packaged into a professional PDF. Ready to send in 60 seconds. No consultant. No Excel. No formatting.",
    visual: "reports",
  },
];

const steps = [
  {
    num: "01",
    title: "Choose your business model",
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
    tagline: "Explore Revenue Map at your own pace.",
    price: "$0",
    period: "/forever",
    features: ["1 project, 1 scenario", "10 AI messages per month", "View Investor Report"],
    cta: "Get started free",
    href: "/auth",
  },
  {
    name: "Plus",
    tagline: "For founders actively building their model.",
    price: "$18",
    period: "/mo",
    features: ["3 projects, 9 scenarios", "Share with up to 3 people", "30 AI messages per project", "Scenario comparison"],
    highlighted: true,
    cta: "Start with Plus",
    href: "/auth?plan=plus",
  },
  {
    name: "Pro",
    tagline: "For serious founders who need no limits.",
    price: "$29",
    period: "/mo",
    features: ["Unlimited projects & scenarios", "Unlimited AI messages", "Share with up to 10 people", "Scenario comparison"],
    cta: "Start with Pro",
    href: "/auth?plan=pro",
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
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

/* ─── Page (server component — data fetching) ─── */

export default function LandingPage() {
  const featuredPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <SoftwareApplicationJsonLd />
      <LandingNavbar />
      <HomepageClient
        modelCards={modelCards}
        featureShowcase={featureShowcase}
        steps={steps}
        plans={plans}
        footerLinks={footerLinks}
        featuredPosts={featuredPosts}
      />
    </>
  );
}

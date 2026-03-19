import { getAllPosts } from "@/lib/blog";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { SoftwareApplicationJsonLd } from "@/components/blog/StructuredData";
import { HomepageClient } from "@/components/home/HomepageClient";
import { getAllModels } from "@/lib/model-registry";

/* ─── Data ─── */

const modelCards = getAllModels().map((m) => ({
  title: m.label,
  color: m.color,
  iconKey: m.key,
  headline: m.headline,
  description: m.description,
  question: m.question,
}));

const featureShowcase = [
  {
    title: "AI Idea Validator",
    description: "Describe your idea and get instant financial projections. Our AI knows your industry benchmarks — so it tells you honestly if your numbers work or if you need to rethink your approach.",
    visual: "ai-assistant",
  },
  {
    title: "Monte Carlo Simulation",
    description: "What are the odds your idea works? Run 1,000+ scenarios to stress-test your assumptions and see the probability of success.",
    visual: "monte-carlo",
  },
  {
    title: "Scenario Analysis",
    description: "What if your growth is slower? What if costs are higher? Compare outcomes side by side and find your minimum viable plan.",
    visual: "scenarios",
  },
  {
    title: "Investor-Ready Report",
    description: "Professional financial projections, unit economics, and scenario analysis — packaged into a PDF. Ready in 60 seconds. No spreadsheets needed.",
    visual: "reports",
  },
];

const steps = [
  {
    num: "01",
    title: "Describe your idea",
    description: "Pick your business type — from mobile apps to AI/ML. Answer a few questions about your market, pricing, and goals.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Get AI-powered projections",
    description: "Our AI builds your financial model using real industry benchmarks. See revenue, costs, and profitability from day one.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Validate and iterate",
    description: "Get your verdict: viable or not? Adjust assumptions, compare scenarios, and come back monthly to track reality against your plan.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const plans = [
  {
    name: "Plus",
    tagline: "For founders validating their first idea.",
    monthlyPrice: 18,
    annualPrice: 14.4,
    annualTotal: 172.8,
    features: ["3 projects, 9 scenarios", "Share with up to 3 people", "30 AI messages per project", "3-day free trial"],
    cta: "Start free trial",
    href: "/auth?plan=plus",
  },
  {
    name: "Pro",
    tagline: "For serious founders testing multiple ideas.",
    monthlyPrice: 29,
    annualPrice: 23.2,
    annualTotal: 278.4,
    features: ["Unlimited projects & scenarios", "Unlimited AI messages", "Share with up to 10 people", "3-day free trial"],
    highlighted: true,
    cta: "Start free trial",
    href: "/auth?plan=pro",
  },
  {
    name: "Enterprise",
    tagline: "For teams with custom needs.",
    monthlyPrice: -1,
    annualPrice: -1,
    features: ["Everything in Pro", "Unlimited sharing", "Priority support", "Custom onboarding"],
    cta: "Contact us",
    href: "mailto:hello@revenuemap.app",
  },
];

const footerLinks = {
  Product: [
    { label: "All Business Models", href: "/#models" },
    { label: "AI Validator", href: "/#features" },
    { label: "Monte Carlo", href: "/#features" },
    { label: "Investor Reports", href: "/#features" },
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

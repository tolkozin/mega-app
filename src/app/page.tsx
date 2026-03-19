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

/* Steps and features are now embedded directly in HomepageClient */

const plans = [
  {
    name: "Plus",
    tagline: "For founders validating their first idea.",
    monthlyPrice: 29,
    annualPrice: 23,
    annualTotal: 276,
    features: ["3 projects, 9 scenarios", "Share with up to 3 people", "30 AI messages per project", "3-day free trial"],
    cta: "Start free trial",
    href: "/auth?plan=plus",
  },
  {
    name: "Pro",
    tagline: "For serious founders testing multiple ideas.",
    monthlyPrice: 49,
    annualPrice: 39,
    annualTotal: 468,
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
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
  ],
  Models: [
    { label: "Mobile App", href: "/models/subscription" },
    { label: "E-Commerce", href: "/models/ecommerce" },
    { label: "SaaS B2B", href: "/models/saas" },
    { label: "Marketplace", href: "/models/marketplace" },
    { label: "FinTech", href: "/models/fintech" },
    { label: "AI / ML", href: "/models/ai-ml" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
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
        plans={plans}
        footerLinks={footerLinks}
        featuredPosts={featuredPosts}
      />
    </>
  );
}

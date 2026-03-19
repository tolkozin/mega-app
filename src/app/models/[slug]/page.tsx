import type { Metadata } from "next";
import Link from "next/link";
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
  CheckCircle2,
  Sparkles,
  BarChart3,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import {
  getAllModels,
  getModelDef,
  isValidProductType,
} from "@/lib/model-registry";
import type { BaseEngine, ProductType } from "@/lib/model-registry";
import { notFound } from "next/navigation";

/* ─── Icon map (server-safe, no dynamic component rendering) ─── */

const ICON_MAP: Record<ProductType, typeof Smartphone> = {
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

/* ─── Features per base engine ─── */

const ENGINE_FEATURES: Record<BaseEngine, string[]> = {
  subscription: [
    "MRR/ARR tracking",
    "Trial conversion modeling",
    "Churn & retention analysis",
    "Cohort behavior",
    "Ad spend & CPI optimization",
    "Break-even timeline",
    "Monte Carlo simulation",
    "Investor-ready report",
  ],
  ecommerce: [
    "Revenue & AOV tracking",
    "CAC & ROAS analysis",
    "Repeat purchase modeling",
    "COGS & margin calculation",
    "Ad spend optimization",
    "Inventory cost modeling",
    "Monte Carlo simulation",
    "Investor-ready report",
  ],
  saas: [
    "ARR/MRR tracking",
    "NRR & churn modeling",
    "Seat-based pricing analysis",
    "LTV/CAC optimization",
    "Sales cycle modeling",
    "Rule of 40 & Quick Ratio",
    "Monte Carlo simulation",
    "Investor-ready report",
  ],
};

/* ─── FAQ per model slug ─── */

interface FaqItem {
  question: string;
  answer: string;
}

const MODEL_FAQS: Record<ProductType, FaqItem[]> = {
  subscription: [
    {
      question: "How do I create a financial model for a mobile app?",
      answer:
        "Start by mapping your subscription tiers, expected trial-to-paid conversion rates, and monthly churn. Revenue Map automates this process — you describe your app, and it generates a full 36-month projection with MRR, ARR, and cohort analysis.",
    },
    {
      question: "What metrics should I track for a subscription app?",
      answer:
        "Focus on MRR, churn rate, trial conversion rate, LTV, CAC, and LTV/CAC ratio. Revenue Map calculates all of these automatically and benchmarks them against industry standards.",
    },
    {
      question:
        "How do I calculate customer lifetime value for mobile apps?",
      answer:
        "LTV equals average revenue per user divided by churn rate. For subscription apps, factor in trial conversion and plan upgrades. Revenue Map models LTV across cohorts so you see how it evolves over time.",
    },
    {
      question: "How much does it cost to build a profitable mobile app?",
      answer:
        "Profitability depends on your CPI (cost per install), conversion rates, and churn — not just development cost. Revenue Map helps you find the break-even point by modeling all these variables together.",
    },
    {
      question:
        "What is a good churn rate for mobile subscription apps?",
      answer:
        "Monthly churn below 5% is considered good for consumer subscription apps; below 3% is excellent. Revenue Map lets you simulate different churn scenarios and see their impact on long-term revenue.",
    },
  ],
  ecommerce: [
    {
      question:
        "How do I build a financial model for an e-commerce business?",
      answer:
        "Map your traffic sources, conversion rate, AOV, COGS, and repeat purchase behavior. Revenue Map builds a complete unit-economics model from these inputs, showing true per-order profitability.",
    },
    {
      question: "What is a good CAC for an online store?",
      answer:
        "A healthy CAC should be no more than one-third of customer LTV. The ideal number varies by niche — Revenue Map calculates your specific CAC/LTV ratio and flags when acquisition costs are unsustainable.",
    },
    {
      question: "How do I calculate ROAS for my e-commerce ads?",
      answer:
        "ROAS is revenue generated divided by ad spend. A ROAS above 3x is generally healthy for e-commerce. Revenue Map models ROAS across channels and projects how scaling ad spend affects profitability.",
    },
    {
      question:
        "How do I forecast revenue for an online store?",
      answer:
        "Multiply expected traffic by conversion rate and AOV, then layer in repeat purchase rates and seasonal trends. Revenue Map automates this with Monte Carlo simulation for realistic confidence intervals.",
    },
    {
      question:
        "What margins should an e-commerce business target?",
      answer:
        "Gross margins of 40-60% are typical for e-commerce, but net margins after CAC and fulfillment often drop to 10-20%. Revenue Map breaks down every cost layer so you see your true margin, not just the headline number.",
    },
  ],
  saas: [
    {
      question: "How do I create a SaaS financial model?",
      answer:
        "Start with your pricing tiers, expected seat count, sales cycle length, and churn rate. Revenue Map generates ARR projections, calculates NRR, Quick Ratio, and Rule of 40 — the metrics investors actually evaluate.",
    },
    {
      question: "What is net revenue retention and why does it matter?",
      answer:
        "NRR measures revenue from existing customers including expansions and churn. NRR above 110% means you grow even without new customers. Revenue Map tracks NRR monthly and benchmarks it against top SaaS companies.",
    },
    {
      question: "How do I calculate the Rule of 40 for my SaaS?",
      answer:
        "Add your revenue growth rate and profit margin — if the sum exceeds 40%, you are in healthy territory. Revenue Map calculates this automatically and shows how different growth/profitability tradeoffs affect your score.",
    },
    {
      question: "What is a good LTV/CAC ratio for B2B SaaS?",
      answer:
        "A LTV/CAC ratio of 3:1 or higher is the standard benchmark for efficient SaaS growth. Revenue Map models this ratio over time, accounting for expansion revenue and multi-year contracts.",
    },
    {
      question: "How long should the payback period be for SaaS?",
      answer:
        "Most investors want to see CAC payback under 18 months; under 12 months is excellent. Revenue Map simulates payback periods across different pricing and churn scenarios so you can optimize before fundraising.",
    },
  ],
  marketplace: [
    {
      question: "How do I model revenue for a marketplace startup?",
      answer:
        "Focus on GMV (gross merchandise value), your take rate, and the supply/demand balance. Revenue Map models both sides of your marketplace and shows when network effects start compounding.",
    },
    {
      question: "What is a good take rate for a marketplace?",
      answer:
        "Take rates range from 5% for commoditized goods to 30%+ for high-value services. Revenue Map helps you test different take rates against seller economics to find the sustainable sweet spot.",
    },
    {
      question: "How do marketplaces reach liquidity?",
      answer:
        "Liquidity means enough supply and demand that transactions happen reliably. Revenue Map models your path to liquidity by simulating supply growth, demand activation, and repeat transaction rates.",
    },
    {
      question:
        "How do I calculate unit economics for a two-sided marketplace?",
      answer:
        "Track CAC for both buyers and sellers, transaction frequency, and contribution margin per transaction. Revenue Map breaks down unit economics for each side so you see which one needs optimization.",
    },
    {
      question:
        "What metrics do investors look for in marketplace startups?",
      answer:
        "GMV growth, take rate, cohort retention, and CAC payback on both sides. Revenue Map generates an investor-ready dashboard with all these metrics calculated and benchmarked.",
    },
  ],
  foodtech: [
    {
      question:
        "How do I build a financial model for a food delivery startup?",
      answer:
        "Model order volume, average order value, delivery costs, kitchen utilization, and customer frequency. Revenue Map calculates per-order profitability and shows your path to positive unit economics.",
    },
    {
      question:
        "What are healthy unit economics for food delivery?",
      answer:
        "Aim for a contribution margin of 15-25% per order after delivery and food costs. Revenue Map models every cost component — COGS, packaging, delivery, and platform fees — so nothing is hidden.",
    },
    {
      question: "How do I reduce customer acquisition cost for a food app?",
      answer:
        "Focus on repeat order rates and organic referrals. Revenue Map models how improving order frequency from 2x to 3x per month dramatically reduces effective CAC over the customer lifetime.",
    },
    {
      question:
        "Is a cloud kitchen more profitable than a traditional restaurant?",
      answer:
        "Cloud kitchens have lower fixed costs but higher delivery expenses. Revenue Map lets you compare both models side by side, factoring in utilization rates, delivery radius, and order mix.",
    },
    {
      question:
        "How do I forecast revenue for a food-tech platform?",
      answer:
        "Multiply active customers by order frequency and AOV, then subtract COGS and fulfillment costs. Revenue Map adds Monte Carlo simulation to account for seasonal variation and growth uncertainty.",
    },
  ],
  traveltech: [
    {
      question:
        "How do I create a financial model for a travel platform?",
      answer:
        "Map booking volumes, commission rates, seasonal demand curves, and marketing spend per channel. Revenue Map builds a 36-month projection that accounts for travel seasonality automatically.",
    },
    {
      question:
        "What commission rate should a travel booking platform charge?",
      answer:
        "Commission rates typically range from 10-20% for hotels and 3-8% for flights. Revenue Map models how different commission structures affect both your revenue and supplier retention.",
    },
    {
      question: "How do I handle seasonality in a travel business model?",
      answer:
        "Travel revenue can swing 40-60% between peak and off-peak. Revenue Map models seasonal demand curves and helps you plan cash reserves and marketing spend to stay profitable year-round.",
    },
    {
      question:
        "What metrics matter most for travel-tech startups?",
      answer:
        "Track gross booking value, commission revenue, CAC, repeat booking rate, and cancellation rate. Revenue Map calculates all of these and shows how they compound across seasons.",
    },
    {
      question:
        "How do I calculate LTV for travel platform customers?",
      answer:
        "Travel LTV depends on booking frequency, average trip value, and retention over years — not months. Revenue Map models multi-year cohort behavior so you capture the full picture of customer value.",
    },
  ],
  gametech: [
    {
      question:
        "How do I build a financial model for a mobile game?",
      answer:
        "Start with DAU/MAU projections, monetization mix (IAP, subscriptions, ads), and retention curves. Revenue Map generates ARPDAU projections and break-even analysis tailored to gaming economics.",
    },
    {
      question: "What is a good Day-1 and Day-30 retention for mobile games?",
      answer:
        "Day-1 retention of 40%+ and Day-30 of 10%+ are strong benchmarks. Revenue Map models retention curves and shows how small improvements in early retention cascade into much higher LTV.",
    },
    {
      question: "How do I calculate ARPDAU for my game?",
      answer:
        "ARPDAU is total daily revenue divided by daily active users. Revenue Map breaks this down by monetization source — IAP, subscriptions, and ads — so you can optimize each revenue stream.",
    },
    {
      question:
        "How much should I spend on user acquisition for a mobile game?",
      answer:
        "UA spend should be recoverable within 90-180 days of a player's LTV. Revenue Map simulates different UA budgets and shows the ROI timeline so you avoid burning cash on unprofitable installs.",
    },
    {
      question:
        "What monetization model works best for mobile games?",
      answer:
        "Hybrid models (IAP + ads + optional subscription) often outperform single-source monetization. Revenue Map lets you model all three simultaneously and find the optimal mix for your game genre.",
    },
  ],
  fintech: [
    {
      question:
        "How do I create a financial model for a fintech startup?",
      answer:
        "Model transaction volumes, interchange or fee revenue, compliance costs, and user growth. Revenue Map builds projections that include regulatory overhead — a cost most generic tools ignore.",
    },
    {
      question:
        "What metrics do investors look for in fintech companies?",
      answer:
        "Transaction volume growth, revenue per user, compliance cost ratio, and net revenue retention. Revenue Map generates all of these with SaaS-grade benchmarking adapted for financial services.",
    },
    {
      question: "How do I model interchange revenue for a payments startup?",
      answer:
        "Interchange depends on transaction volume, average ticket size, and card network rates. Revenue Map models these variables together and projects how revenue scales with transaction growth.",
    },
    {
      question: "How much does regulatory compliance cost a fintech startup?",
      answer:
        "Compliance can consume 10-20% of revenue in early stages. Revenue Map lets you model compliance as a scaling cost, showing when economies of scale make it manageable.",
    },
    {
      question:
        "Can a fintech product scale profitably with high compliance costs?",
      answer:
        "Yes, if transaction volume grows faster than compliance overhead. Revenue Map simulates this tradeoff and identifies the volume threshold where your fintech becomes sustainably profitable.",
    },
  ],
  healthtech: [
    {
      question:
        "How do I build a financial model for a healthtech startup?",
      answer:
        "Map patient acquisition costs, provider contract values, regulatory expenses, and engagement metrics. Revenue Map combines SaaS metrics with healthcare-specific cost structures for accurate projections.",
    },
    {
      question:
        "What is a good patient acquisition cost for digital health?",
      answer:
        "Patient acquisition costs vary widely — $50-$200 for consumer apps, $500+ for enterprise contracts. Revenue Map models both B2C and B2B2C channels so you can optimize your go-to-market mix.",
    },
    {
      question:
        "How do I model recurring revenue for a telemedicine platform?",
      answer:
        "Combine subscription revenue, per-visit fees, and enterprise contracts. Revenue Map tracks each revenue stream separately and models how patient engagement drives long-term retention.",
    },
    {
      question:
        "What metrics matter most for healthtech investors?",
      answer:
        "Patient engagement rates, clinical outcomes (if measurable), NRR, and regulatory readiness. Revenue Map generates investor-ready reports that highlight both SaaS health and clinical value.",
    },
    {
      question:
        "How do regulatory costs affect healthtech profitability?",
      answer:
        "Regulatory costs (HIPAA, FDA, SOC 2) can be 15-25% of early-stage spend. Revenue Map models these as fixed and variable costs, showing the scale at which they become a small percentage of revenue.",
    },
  ],
  edtech: [
    {
      question:
        "How do I create a financial model for an edtech startup?",
      answer:
        "Model student acquisition, course completion rates, pricing (B2C vs. B2B), and content production costs. Revenue Map builds projections that tie completion rates directly to retention and revenue.",
    },
    {
      question:
        "What is a good course completion rate for online learning?",
      answer:
        "Average completion rates are 5-15% for MOOCs but 40-70% for paid courses. Revenue Map models how completion rates affect retention, referrals, and lifetime value of each student.",
    },
    {
      question: "How do I price an online education product?",
      answer:
        "Test subscription vs. one-time purchase, and B2C vs. B2B licensing. Revenue Map simulates each pricing model across different cohort sizes so you can see which generates sustainable growth.",
    },
    {
      question: "What metrics do edtech investors care about?",
      answer:
        "Student engagement, completion rates, NRR (for B2B), and content efficiency (revenue per content hour produced). Revenue Map calculates all of these and benchmarks them against funded edtech companies.",
    },
    {
      question:
        "How do I reduce student acquisition cost for an education platform?",
      answer:
        "Focus on word-of-mouth from completers and B2B partnerships with schools or employers. Revenue Map models different acquisition channels and shows which ones deliver the lowest blended CAC.",
    },
  ],
  proptech: [
    {
      question:
        "How do I build a financial model for a proptech startup?",
      answer:
        "Model listing volumes, transaction fees or SaaS subscriptions, lead-to-deal conversion, and property management economics. Revenue Map projects revenue across different property segments and deal cycles.",
    },
    {
      question: "What are good unit economics for a real estate platform?",
      answer:
        "Target a lead-to-deal conversion rate above 2% and a cost-per-lead under $50 for residential. Revenue Map models the full funnel from listing to close so you see true per-transaction profitability.",
    },
    {
      question:
        "How do I forecast revenue for a property management platform?",
      answer:
        "Multiply managed units by monthly fee, then factor in onboarding time and churn. Revenue Map builds a recurring revenue model that accounts for seasonal move-in/move-out patterns.",
    },
    {
      question:
        "What metrics matter for proptech investors?",
      answer:
        "Transaction volume, revenue per property, CAC/LTV ratio, and geographic expansion potential. Revenue Map generates these metrics with investor-ready formatting and industry benchmarks.",
    },
    {
      question:
        "Is a commission-based or SaaS model better for proptech?",
      answer:
        "Commission models scale with transaction volume; SaaS models provide predictable revenue. Revenue Map lets you model both and compare them side by side to find your optimal revenue structure.",
    },
  ],
  "ai-ml": [
    {
      question:
        "How do I create a financial model for an AI startup?",
      answer:
        "Model API call volumes, compute costs (GPU/TPU), enterprise contract values, and usage-based pricing tiers. Revenue Map balances infrastructure costs against revenue so you can price sustainably.",
    },
    {
      question: "How do I price an AI API product?",
      answer:
        "Usage-based pricing (per API call or per token) is standard, often with volume discounts and enterprise tiers. Revenue Map simulates different pricing structures and shows how they affect margin at scale.",
    },
    {
      question:
        "How do compute costs scale for AI/ML products?",
      answer:
        "Compute costs can grow linearly or sub-linearly with usage depending on optimization. Revenue Map models GPU costs, inference optimization, and caching effects so you project true gross margins.",
    },
    {
      question:
        "What metrics do investors look for in AI/ML companies?",
      answer:
        "Gross margin (after compute), NRR, usage growth rate, and model efficiency improvements over time. Revenue Map calculates all of these with SaaS-grade benchmarking adapted for AI economics.",
    },
    {
      question: "Can my AI product scale without burning through compute?",
      answer:
        "Yes, if revenue per API call exceeds compute cost per call with sufficient margin. Revenue Map models this breakeven across different traffic levels and shows when your AI product becomes self-sustaining.",
    },
  ],
};

/* ─── How It Works steps ─── */

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Describe your idea",
    description:
      "Tell us about your business model, pricing, and target market. Our AI assistant helps fill in the details.",
  },
  {
    step: 2,
    title: "Get instant projections",
    description:
      "Revenue Map generates a 36-month financial model with Monte Carlo simulation, sensitivity analysis, and key metrics.",
  },
  {
    step: 3,
    title: "Validate & share",
    description:
      "Explore scenarios, adjust assumptions in real-time, and export investor-ready reports.",
  },
];

/* ─── Static params ─── */

export function generateStaticParams() {
  return getAllModels().map((m) => ({ slug: m.key }));
}

/* ─── Metadata ─── */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidProductType(slug)) {
    return { title: "Model Not Found — Revenue Map" };
  }
  const model = getModelDef(slug);
  const title = `${model.label} Financial Model — Revenue Map`;
  const description = model.description;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/models/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/models/${slug}`,
    },
  };
}

/* ─── Page component ─── */

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isValidProductType(slug)) {
    notFound();
  }

  const model = getModelDef(slug);
  const Icon = ICON_MAP[model.key];
  const features = ENGINE_FEATURES[model.baseEngine];
  const faqs = MODEL_FAQS[model.key];

  /* FAQ structured data */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <LandingNavbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-[#0F172A]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-24 pb-20">
          {/* Gradient backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${model.color}33, transparent)`,
            }}
          />

          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${model.color}20` }}
            >
              <Icon
                className="h-8 w-8"
                style={{ color: model.color }}
              />
            </div>

            <h1 className="text-4xl font-black text-[#F8FAFC] sm:text-5xl lg:text-6xl">
              {model.label} Financial Model
            </h1>

            <p className="mt-4 text-lg text-[#94A3B8] sm:text-xl max-w-2xl mx-auto">
              {model.description}
            </p>

            <p className="mt-3 text-xl font-bold text-[#F8FAFC] sm:text-2xl">
              {model.headline}
            </p>

            <Link
              href="/onboarding/survey"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: model.color }}
            >
              <Sparkles className="h-5 w-5" />
              Try {model.label} Model — Free
            </Link>
          </div>
        </section>

        {/* ── What's Included ── */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-3xl font-black text-[#F8FAFC] sm:text-4xl">
              What&apos;s Included
            </h2>
            <p className="mt-3 text-center text-[#94A3B8] text-lg max-w-2xl mx-auto">
              Everything you need to model {model.label.toLowerCase()}{" "}
              unit economics and growth.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-xl border border-[#334155]/60 bg-[rgba(30,41,59,0.4)] p-5 backdrop-blur-sm transition-colors hover:border-[#334155]"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 flex-shrink-0"
                      style={{ color: model.color }}
                    />
                    <span className="text-sm font-semibold text-[#F8FAFC]">
                      {feature}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-20 border-t border-[#1E293B]">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-3xl font-black text-[#F8FAFC] sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-center text-[#94A3B8] text-lg">
              From idea to investor-ready projections in minutes.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="text-center">
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-black text-white"
                    style={{ backgroundColor: model.color }}
                  >
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#F8FAFC]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 border-t border-[#1E293B]">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-3xl font-black text-[#F8FAFC] sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-center text-[#94A3B8] text-lg">
              Common questions about {model.label.toLowerCase()}{" "}
              financial modeling.
            </p>

            <div className="mt-12 space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-[#334155]/60 bg-[rgba(30,41,59,0.4)] backdrop-blur-sm"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-left font-semibold text-[#F8FAFC] [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-[#94A3B8] transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 text-sm leading-relaxed text-[#94A3B8]">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-20 border-t border-[#1E293B]">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <BarChart3
              className="mx-auto h-10 w-10 mb-4"
              style={{ color: model.color }}
            />
            <h2 className="text-3xl font-black text-[#F8FAFC] sm:text-4xl">
              Ready to model your {model.label.toLowerCase()} business?
            </h2>
            <p className="mt-4 text-lg text-[#94A3B8] max-w-xl mx-auto">
              Stop guessing. Get a data-driven financial model in
              minutes — not weeks.
            </p>
            <Link
              href="/onboarding/survey"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: model.color }}
            >
              <Sparkles className="h-5 w-5" />
              Get Started — Free
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-[#1E293B] py-10">
          <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[#94A3B8]">
            &copy; {new Date().getFullYear()} Revenue Map. All rights
            reserved.
          </div>
        </footer>
      </div>
    </>
  );
}

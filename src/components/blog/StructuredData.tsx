import type { BlogPost } from "@/types/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://megaapp.io";

export function ArticleJsonLd({ post }: { post: BlogPost }) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}${post.image}`,
    datePublished: post.date,
    dateModified: post.dateModified ?? post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Mega App",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    ...(post.keyword && { keywords: post.keyword }),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='headline']", "[data-speakable='summary']"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function HowToJsonLd({
  howTo,
}: {
  howTo: { name: string; description: string; steps: { name: string; text: string }[] };
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Mega App",
    url: SITE_URL,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Financial modeling platform for SaaS, e-commerce, and B2B businesses. Build investor-ready models with Monte Carlo simulations, scenario analysis, and automated P&L projections.",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free",
        description: "1 project, 3 scenarios, all charts & reports",
      },
      {
        "@type": "Offer",
        price: "29",
        priceCurrency: "USD",
        name: "Pro",
        description: "Unlimited projects, Monte Carlo simulation, public dashboards",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "29",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
      },
    ],
    featureList: [
      "Subscription financial modeling (MRR, churn, cohorts)",
      "E-commerce modeling (AOV, COGS, unit economics)",
      "SaaS B2B modeling (ARR, NRR, Quick Ratio, Rule of 40)",
      "Monte Carlo simulation (1000+ runs)",
      "Scenario analysis (base, optimistic, pessimistic)",
      "Investor-ready PDF reports",
      "67+ configurable parameters",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mega App",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Financial modeling platform for SaaS and e-commerce businesses.",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

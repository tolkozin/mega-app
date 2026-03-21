import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { IDEA_COLLECTIONS, IDEA_LISTS } from "@/lib/ideas";
import { IdeasHubClient } from "@/components/ideas/IdeasHubClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "1,500+ Business Ideas by Niche, Demographic & Budget (2026) — Revenue Map",
  description:
    "Explore curated lists of the best business ideas by niche, demographic, and budget — subscription apps, e-commerce, SaaS, ideas for women, students, zero-cost startups, million-dollar ventures, and more.",
  alternates: { canonical: `${SITE_URL}/ideas` },
  openGraph: {
    title: "1,500+ Business Ideas by Niche, Demographic & Budget (2026)",
    description:
      "Curated lists of the best business ideas across 12 industries, 20 demographics, and 10 budget levels. Find your next startup idea and validate it instantly.",
    url: `${SITE_URL}/ideas`,
  },
};

export default function IdeasHubPage() {
  const allCollectionLists = IDEA_COLLECTIONS.flatMap((c) => c.lists);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "1,500+ Business Ideas by Niche, Demographic & Budget",
    description: metadata.description,
    url: `${SITE_URL}/ideas`,
    numberOfItems: allCollectionLists.length,
    hasPart: allCollectionLists.map((l) => {
      const list = IDEA_LISTS.find((il) => il.slug === l.slug);
      return {
        "@type": "ItemList",
        name: list?.title ?? l.label,
        url: `${SITE_URL}/ideas/${l.slug}`,
        numberOfItems: list?.ideas.length ?? 30,
        description: list?.subtitle ?? "",
      };
    }),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I choose the right business idea?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start by filtering our 1,500+ ideas by your budget, target demographic, or industry niche. Then use Revenue Map's financial projection tool to validate your top picks with real revenue, cost, and break-even analysis before investing any money.",
        },
      },
      {
        "@type": "Question",
        name: "Can I start a profitable business with no money?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Our zero-cost business ideas list includes 30 businesses you can start with nothing but a laptop and your skills — from freelance writing and social media management to affiliate marketing and online tutoring.",
        },
      },
      {
        "@type": "Question",
        name: "What are the most profitable low-investment business ideas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "High-profit, low-investment businesses include management consulting, online courses, SaaS products, and specialized services like cybersecurity training or executive coaching — all with 70%+ gross margins and under $5,000 startup costs.",
        },
      },
      {
        "@type": "Question",
        name: "How many business ideas are in this collection?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our collection contains over 1,500 curated business ideas across 42 lists: 12 industry niches (50 ideas each), 20 demographic groups (30 ideas each), and 10 budget levels (30 ideas each).",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingNavbar />
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9fc]" />}>
        <IdeasHubClient />
      </Suspense>
    </>
  );
}

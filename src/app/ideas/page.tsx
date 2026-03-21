import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { IDEA_COLLECTIONS, IDEA_LISTS } from "@/lib/ideas";
import { IdeasHubClient } from "@/components/ideas/IdeasHubClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "Business Ideas — Find & Validate Your Next Startup Idea | Revenue Map",
  description:
    "Not sure what to build? Browse curated business ideas by industry niche, target audience, budget, app category, and build timeline. Pick an idea and validate it with real financial projections — revenue, costs, and break-even analysis.",
  alternates: { canonical: `${SITE_URL}/ideas` },
  openGraph: {
    title: "Business Ideas — Find & Validate Your Next Startup",
    description: "Browse curated startup ideas by niche, audience, budget, app category, and build time. Validate any idea with a real financial model in minutes.",
    url: `${SITE_URL}/ideas`,
  },
};

export default function IdeasHubPage() {
  const allCollectionLists = IDEA_COLLECTIONS.flatMap((c) => c.lists);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Business Ideas by Niche, Category & Budget",
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
          text: "Start by filtering ideas by your budget, target demographic, or industry niche. Then use Revenue Map's financial projection tool to validate your top picks with real revenue, cost, and break-even analysis before investing any money.",
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
          text: "Our collection contains thousands of curated business ideas across dozens of lists — organized by industry niche, target demographic, startup budget, app category, and build timeline. Each list focuses on a specific angle to help you find the right fit.",
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

import type { Metadata } from "next";
import { Suspense } from "react";
import { METRICS } from "@/lib/knowledge-base";
import { KBIndexClient } from "@/components/knowledge-base/KBIndexClient";

export const metadata: Metadata = {
  title: "Free Startup Calculators — MRR, CAC, LTV, Churn & More",
  description:
    "Calculate any startup metric in seconds. 20+ free calculators with formulas, real industry benchmarks, and plain-English explanations. No signup, no spreadsheet — just type your numbers and get the answer.",
  alternates: {
    canonical: "https://revenuemap.app/knowledge-base",
  },
};

export default function KnowledgeBasePage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Revenue Map Knowledge Base",
    description: metadata.description,
    url: "https://revenuemap.app/knowledge-base",
    numberOfItems: METRICS.length,
    hasPart: METRICS.map((m) => ({
      "@type": "DefinedTerm",
      name: m.name,
      url: `https://revenuemap.app/knowledge-base/${m.slug}`,
      description: m.description.slice(0, 150),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-heading tracking-tight text-[#1a1a2e] mb-3">
            Knowledge Base
          </h1>
          <p className="text-lg text-[#6b7280] max-w-2xl">
            Free calculators, benchmarks, and expert guides for every metric that matters.
            Choose a category or business model to filter.
          </p>
        </div>

        <Suspense fallback={null}>
          <KBIndexClient metrics={METRICS} />
        </Suspense>
      </div>
    </>
  );
}

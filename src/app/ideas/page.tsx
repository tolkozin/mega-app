import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { IDEA_COLLECTIONS, IDEA_LISTS } from "@/lib/ideas";
import { ArrowRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "1,200+ Business Ideas for Every Niche & Demographic (2026) — Revenue Map",
  description:
    "Explore curated lists of the best business ideas by niche and demographic — subscription apps, e-commerce, SaaS, ideas for women, students, parents, remote workers, and more.",
  alternates: { canonical: `${SITE_URL}/ideas` },
  openGraph: {
    title: "1,200+ Business Ideas for Every Niche & Demographic (2026)",
    description:
      "Curated lists of the best business ideas across 12 industries and 20 demographics. Find your next startup idea and validate it instantly.",
    url: `${SITE_URL}/ideas`,
  },
};

export default function IdeasHubPage() {
  const nicheCollection = IDEA_COLLECTIONS.find((c) => c.type === "niche")!;
  const demoCollection = IDEA_COLLECTIONS.find((c) => c.type === "demographic")!;
  const allLists = [...nicheCollection.lists, ...demoCollection.lists];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "1,200+ Business Ideas for Every Niche & Demographic",
    description: metadata.description,
    url: `${SITE_URL}/ideas`,
    numberOfItems: allLists.length,
    hasPart: allLists.map((l) => {
      const list = IDEA_LISTS.find((il) => il.slug === l.slug);
      return {
        "@type": "ItemList",
        name: list?.title ?? l.label,
        url: `${SITE_URL}/ideas/${l.slug}`,
        numberOfItems: list?.ideas.length ?? 50,
        description: list?.subtitle ?? "",
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <LandingNavbar />
      <div className="min-h-screen bg-[#f8f9fc]">
        {/* Hero */}
        <section className="pt-20 pb-12 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#1a1a2e] mb-4">
            1,200+ Business Ideas<br className="hidden sm:block" />
            for Every Niche & Demographic
          </h1>
          <p className="text-lg text-[#6b7280] max-w-2xl mx-auto mb-8">
            Curated startup ideas across {nicheCollection.lists.length} industries and {demoCollection.lists.length} demographics.
            Pick your niche or audience, find your next idea, and validate it with real financial projections.
          </p>
          <Link href="/onboarding/survey">
            <button className="h-11 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-lg hover:bg-[#1a53c7] transition-colors">
              Validate Your Idea Free
            </button>
          </Link>
        </section>

        {/* Niche grid */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">
            {nicheCollection.label}
          </h2>
          <p className="text-sm text-[#6b7280] mb-6">{nicheCollection.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {nicheCollection.lists.map((item) => {
              const list = IDEA_LISTS.find((il) => il.slug === item.slug);
              return (
                <Link
                  key={item.slug}
                  href={`/ideas/${item.slug}`}
                  className="group bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:border-[#2163e7]/30 hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-1 group-hover:text-[#2163e7] transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-[#6b7280] mb-4 flex-1 leading-relaxed">
                    {list?.subtitle ?? "50 curated business ideas with revenue potential."}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2163e7]">
                    View {list?.ideas.length ?? 50} ideas
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Demographic grid */}
        <section className="max-w-5xl mx-auto px-4 pb-24">
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">
            {demoCollection.label}
          </h2>
          <p className="text-sm text-[#6b7280] mb-6">{demoCollection.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {demoCollection.lists.map((item) => {
              const list = IDEA_LISTS.find((il) => il.slug === item.slug);
              return (
                <Link
                  key={item.slug}
                  href={`/ideas/${item.slug}`}
                  className="group bg-white rounded-xl border border-[#e5e7eb] p-5 hover:border-[#2163e7]/30 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="text-sm font-bold text-[#1a1a2e] group-hover:text-[#2163e7] transition-colors">
                      {item.label}
                    </h3>
                  </div>
                  <p className="text-xs text-[#6b7280] mb-3 flex-1 leading-relaxed line-clamp-2">
                    {list?.subtitle ?? "30 curated business ideas."}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#2163e7]">
                    View 30 ideas
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-[#e5e7eb] py-20 px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-[#1a1a2e] mb-4">
            Found an idea you like?
          </h2>
          <p className="text-[#6b7280] max-w-xl mx-auto mb-8">
            Plug it into Revenue Map and get a full financial projection in minutes — revenue, costs, break-even, and investor-ready reports.
          </p>
          <Link href="/onboarding/survey">
            <button className="h-11 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-lg hover:bg-[#1a53c7] transition-colors">
              Start Free Projection
            </button>
          </Link>
        </section>
      </div>
    </>
  );
}

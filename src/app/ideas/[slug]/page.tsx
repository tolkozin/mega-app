import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { getIdeaList, getAllIdeaSlugs, IDEA_COLLECTIONS } from "@/lib/ideas";
import { ArrowRight, Trophy, Star, Sparkles } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export function generateStaticParams() {
  return getAllIdeaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const list = getIdeaList(slug);
  if (!list) return {};
  return {
    title: `${list.title} (2026) — Top ${list.ideas.length} Curated Ideas`,
    description: `${list.subtitle} Each idea includes a revenue model you can validate with real industry benchmarks. Curated for 2026.`,
    alternates: { canonical: `${SITE_URL}/ideas/${list.slug}` },
    openGraph: {
      title: `${list.title} — Revenue Map`,
      description: list.subtitle,
      url: `${SITE_URL}/ideas/${list.slug}`,
    },
  };
}

export default async function IdeaListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const list = getIdeaList(slug);
  if (!list) notFound();

  const top5 = list.ideas.slice(0, 5);
  const rest = list.ideas.slice(5);
  const collectionMeta = IDEA_COLLECTIONS[0].lists.find(
    (l) => l.slug === list.slug
  );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: list.title,
    description: list.subtitle,
    url: `${SITE_URL}/ideas/${list.slug}`,
    numberOfItems: list.ideas.length,
    itemListElement: list.ideas.map((idea, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: idea.name,
      description: idea.description,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What are the best ${collectionMeta?.label ?? list.slug} business ideas in 2026?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The top ideas include ${top5.map((i) => i.name).join(", ")}. Each of these has strong market potential and recurring revenue opportunity.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I validate a ${collectionMeta?.label ?? list.slug} business idea?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use Revenue Map to create a financial projection with real benchmarks. You'll see revenue, costs, break-even point, and key metrics — no spreadsheet required.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingNavbar />
      <div className="min-h-screen bg-[#f8f9fc]">
        {/* Breadcrumb */}
        <div className="max-w-5xl mx-auto px-4 pt-8">
          <nav className="flex items-center gap-1.5 text-sm text-[#9ca3af]">
            <Link href="/ideas" className="hover:text-[#2163e7] transition-colors">
              Business Ideas
            </Link>
            <span>/</span>
            <span className="text-[#6b7280]">{collectionMeta?.label ?? list.slug}</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="pt-6 pb-10 px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {collectionMeta && (
              <span className="text-3xl">{collectionMeta.icon}</span>
            )}
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-[#1a1a2e]">
              {list.title}
            </h1>
          </div>
          <p className="text-lg text-[#6b7280] max-w-3xl">
            {list.subtitle}
          </p>
        </section>

        {/* Niche overview */}
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#2163e7]" />
              <h2 className="text-lg font-bold text-[#1a1a2e]">
                Why {collectionMeta?.label ?? "This Niche"}?
              </h2>
            </div>
            <p className="text-[#4b5563] leading-relaxed">{list.overview}</p>
          </div>
        </section>

        {/* Top 5 featured ideas */}
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-[#f59e0b]" />
            <h2 className="text-xl font-bold text-[#1a1a2e]">Top 5 Picks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {top5.map((idea, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-2xl border p-6 flex flex-col ${
                  idea.bestPick
                    ? "border-[#2163e7] shadow-lg shadow-[#2163e7]/10 ring-1 ring-[#2163e7]/20"
                    : "border-[#e5e7eb] hover:border-[#2163e7]/30 hover:shadow-md"
                } transition-all`}
              >
                {idea.bestPick && (
                  <div className="absolute -top-3 left-4 bg-[#2163e7] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Best Pick
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <span className="text-xs font-bold text-white bg-[#1a1a2e] rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-bold text-[#1a1a2e]">{idea.name}</h3>
                </div>
                <p className="text-sm text-[#6b7280] leading-relaxed flex-1">
                  {idea.description}
                </p>
                <Link
                  href="/onboarding/survey"
                  className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#2163e7] hover:text-[#1a53c7] transition-colors"
                >
                  Build projection
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Remaining 45 ideas */}
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">
            More Ideas ({rest.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rest.map((idea, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-[#2163e7]/20 transition-colors flex flex-col"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-medium text-[#9ca3af] bg-[#f3f4f6] rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                    {i + 6}
                  </span>
                  <h3 className="text-sm font-bold text-[#1a1a2e]">{idea.name}</h3>
                </div>
                <p className="text-xs text-[#6b7280] leading-relaxed flex-1 ml-8">
                  {idea.description}
                </p>
                <Link
                  href="/onboarding/survey"
                  className="mt-2 ml-8 text-xs font-medium text-[#2163e7] hover:text-[#1a53c7] transition-colors"
                >
                  Try this idea &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-[#e5e7eb] py-20 px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-[#1a1a2e] mb-4">
            Ready to validate your idea?
          </h2>
          <p className="text-[#6b7280] max-w-xl mx-auto mb-8">
            Pick any idea above and get a full financial projection in minutes — revenue forecasts, unit economics, break-even analysis, and investor-ready reports.
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

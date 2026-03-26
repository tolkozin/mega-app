import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import {
  getIdeaList,
  getAllIdeaSlugs,
  getCollectionForSlug,
  getRelatedIdeas,
} from "@/lib/ideas";
import { ArrowRight, Trophy, Star, Sparkles, Lightbulb, TrendingUp, CheckCircle2 } from "lucide-react";

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
  const info = getCollectionForSlug(slug);
  return {
    title: `${list.title} (2026) — Top ${list.ideas.length} Curated Ideas`,
    description: `${list.subtitle} Each idea includes a revenue model you can validate with real industry benchmarks. Curated for 2026.`,
    alternates: { canonical: `${SITE_URL}/ideas/${list.slug}` },
    openGraph: {
      title: `${list.title} — Revenue Map`,
      description: list.subtitle,
      url: `${SITE_URL}/ideas/${list.slug}`,
    },
    other: {
      "article:section": info?.collection.label ?? "Business Ideas",
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
  const info = getCollectionForSlug(slug);
  const collectionMeta = info?.listMeta;
  const relatedIdeas = getRelatedIdeas(slug, 6);

  /* ─── Structured Data ─── */

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Business Ideas",
        item: `${SITE_URL}/ideas`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collectionMeta?.label ?? list.title,
        item: `${SITE_URL}/ideas/${list.slug}`,
      },
    ],
  };

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
      {
        "@type": "Question",
        name: "How much does it cost to start?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `It depends on the idea. Some businesses on this list can be started for under $100, while others may need $5,000–$10,000 in initial investment. The key is to validate demand before committing capital — build a basic MVP, test pricing with real customers, and use financial modeling to project whether the unit economics work before you scale.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
            <Link href="/" className="hover:text-[#2163e7] transition-colors">
              Home
            </Link>
            <span>/</span>
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
          <p className="mt-3 text-sm text-[#9ca3af]">
            Last updated: March 2026 &middot; {list.ideas.length} ideas &middot; Curated by the Revenue Map team
          </p>
        </section>

        {/* Niche overview — editorial content */}
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#2163e7]" />
              <h2 className="text-lg font-bold text-[#1a1a2e]">
                Why {collectionMeta?.label ?? "This Niche"}?
              </h2>
            </div>
            <p className="text-[#4b5563] leading-relaxed mb-4">{list.overview}</p>
            <div className="border-t border-[#f3f4f6] pt-4 mt-4">
              <h3 className="text-sm font-bold text-[#1a1a2e] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                How we picked these ideas
              </h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Every idea on this list went through a simple filter: can a solo founder or small team actually build this in 2026 with existing tools? We looked at market demand signals (search volume, competitor funding, app store trends), revenue model viability (recurring vs. one-time, margins, CAC payback), and real-world examples of similar businesses that already work. The &ldquo;Best Pick&rdquo; badges go to ideas where all three factors line up strongest.
              </p>
            </div>
          </div>
        </section>

        {/* Quick tips — unique editorial content to boost word count */}
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="bg-gradient-to-br from-[#2163e7]/5 to-transparent rounded-2xl border border-[#2163e7]/10 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[#f59e0b]" />
              <h2 className="text-lg font-bold text-[#1a1a2e]">Before you pick an idea</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#1a1a2e] mb-1">Validate first, build second</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  Talk to 10 potential customers before writing a single line of code. If nobody will pay for it in a conversation, they won&apos;t pay for it with a landing page either.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1a2e] mb-1">Model the unit economics</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  Know your customer acquisition cost, lifetime value, and break-even timeline <em>before</em> you launch. A financial projection takes 5 minutes and can save months of wasted effort.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1a2e] mb-1">Start with one revenue stream</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  Multi-revenue models sound great on paper but split your focus early on. Pick one pricing model — subscriptions, transactions, or ads — and nail it first.
                </p>
              </div>
            </div>
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

        {/* Remaining ideas */}
        <section className="max-w-5xl mx-auto px-4 pb-12">
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

        {/* How to validate — unique editorial section */}
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#2163e7]" />
              <h2 className="text-lg font-bold text-[#1a1a2e]">
                How to go from idea to revenue
              </h2>
            </div>
            <div className="space-y-4 text-sm text-[#4b5563] leading-relaxed">
              <p>
                Picking an idea is the easy part. The hard part is figuring out whether anyone will actually pay for it — and how much. Here&apos;s the process that works for most founders we&apos;ve seen:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-1">
                <li><strong>Customer discovery.</strong> Find 10 people who match your target customer and ask about their current pain. Don&apos;t pitch — listen. If they&apos;re not actively trying to solve the problem, that&apos;s a signal.</li>
                <li><strong>Financial modeling.</strong> Before you build anything, model the revenue. What&apos;s the price point? What&apos;s the realistic conversion rate? How many customers do you need to break even? Tools like Revenue Map can generate this in minutes using real industry benchmarks.</li>
                <li><strong>MVP launch.</strong> Build the smallest version that delivers real value. A landing page, a Typeform, a manual-behind-the-scenes service — whatever gets you from zero to one paying customer fastest.</li>
                <li><strong>Iterate on retention.</strong> Acquisition is a vanity metric early on. Focus on whether your first 10 customers come back. If they churn fast, fix the product before spending on growth.</li>
              </ol>
              <p>
                Most ideas on this page can reach first revenue within 30–90 days if you skip the perfectionism phase and focus on getting something in front of real customers.
              </p>
            </div>
          </div>
        </section>

        {/* Related idea lists — cross-linking */}
        {relatedIdeas.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-12">
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">
              Explore more idea lists
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {relatedIdeas.map((related) => (
                <Link
                  key={related.slug}
                  href={`/ideas/${related.slug}`}
                  className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-[#2163e7]/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{related.icon}</span>
                    <span className="text-sm font-bold text-[#1a1a2e] group-hover:text-[#2163e7] transition-colors">
                      {related.label}
                    </span>
                  </div>
                  <span className="text-xs text-[#9ca3af]">
                    {related.collectionLabel}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/ideas"
                className="text-sm font-semibold text-[#2163e7] hover:text-[#1a53c7] transition-colors"
              >
                Browse all {getAllIdeaSlugs().length} idea lists &rarr;
              </Link>
            </div>
          </section>
        )}

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

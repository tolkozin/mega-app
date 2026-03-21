import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  METRICS,
  CATEGORY_META,
  getMetricBySlug,
  getAllMetricSlugs,
  getRelatedMetrics,
} from "@/lib/knowledge-base";
import { MODEL_REGISTRY } from "@/lib/model-registry";
import type { ProductType } from "@/lib/model-registry";
import { MetricCalculator } from "@/components/blog/MetricCalculator";
import { ChevronDown, Lightbulb, ArrowRight, Sparkles, ChevronRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

/* ─── Static params ─── */

export function generateStaticParams() {
  return getAllMetricSlugs().map((slug) => ({ slug }));
}

/* ─── Metadata ─── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const metric = getMetricBySlug(slug);
  if (!metric) return { title: "Metric Not Found" };

  const title = `${metric.name} Calculator — What It Is, Formula & Real Benchmarks`;
  const description = `What is ${metric.name}? Calculate it instantly, see the formula, learn what good looks like with real industry benchmarks, and understand why it matters for your business. Free, no signup.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/knowledge-base/${slug}` },
    openGraph: {
      title: `Free ${metric.name} Calculator — Revenue Map`,
      description: `Calculate ${metric.name} instantly. Formula + real benchmarks + plain-English guide.`,
      url: `${SITE_URL}/knowledge-base/${slug}`,
    },
  };
}

/* ─── Page ─── */

export default async function MetricPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const metric = getMetricBySlug(slug);
  if (!metric) notFound();

  const cat = CATEGORY_META[metric.category];
  const related = getRelatedMetrics(slug);

  /* Structured data */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: metric.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: metric.name,
    description: metric.description,
    url: `${SITE_URL}/knowledge-base/${slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Knowledge Base", item: `${SITE_URL}/knowledge-base` },
      { "@type": "ListItem", position: 3, name: metric.shortName, item: `${SITE_URL}/knowledge-base/${slug}` },
    ],
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: metric.name,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable]"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([faqSchema, definedTermSchema, breadcrumbSchema, speakableSchema]),
        }}
      />

      <div className="min-h-screen bg-[#f8f9fc]">
        {/* ── Breadcrumb ── */}
        <div className="container mx-auto px-4 pt-6">
          <nav className="flex items-center gap-1.5 text-sm text-[#6b7280]">
            <Link href="/" className="hover:text-[#1a1a2e]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/knowledge-base" className="hover:text-[#1a1a2e]">Knowledge Base</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1a1a2e] font-medium">{metric.shortName}</span>
          </nav>
        </div>

        {/* ── Hero ── */}
        <section className="pt-8 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: cat.color }}
              >
                {cat.label}
              </span>
              <div className="flex items-center gap-1.5">
                {metric.models.slice(0, 6).map((key) => {
                  const m = MODEL_REGISTRY[key as ProductType];
                  if (!m) return null;
                  return (
                    <span
                      key={key}
                      title={m.label}
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: m.elementBg, color: m.elementText }}
                    >
                      {m.elementSymbol}
                    </span>
                  );
                })}
                {metric.models.length > 6 && (
                  <span className="text-xs text-[#6b7280]">+{metric.models.length - 6}</span>
                )}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-[#1a1a2e] mb-4">
              {metric.name}
            </h1>

            <p className="text-lg text-[#6b7280] leading-relaxed" data-speakable>
              {metric.speakable}
            </p>
          </div>
        </section>

        {/* ── Why It Matters ── */}
        <section className="py-12 bg-white border-t border-[#e5e7eb]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-extrabold font-heading text-[#1a1a2e] mb-4">
              Why {metric.shortName} Matters
            </h2>
            <p className="text-[#6b7280] leading-relaxed text-base">
              {metric.whyItMatters}
            </p>
          </div>
        </section>

        {/* ── How to Calculate ── */}
        <section className="py-12 border-t border-[#e5e7eb]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-extrabold font-heading text-[#1a1a2e] mb-4">
              How to Calculate {metric.shortName}
            </h2>
            <p className="text-[#6b7280] leading-relaxed mb-6">
              {metric.howToCalculate}
            </p>
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-2">
                {metric.formulaLabel}
              </div>
              <div className="font-mono text-lg font-bold text-[#1a1a2e] bg-[#f8f9fc] rounded-lg px-4 py-3 border border-[#e5e7eb]">
                {metric.formula}
              </div>
            </div>
          </div>
        </section>

        {/* ── Calculator ── */}
        <section className="py-12 bg-white border-t border-[#e5e7eb]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-extrabold font-heading text-[#1a1a2e] mb-6">
              {metric.shortName} Calculator
            </h2>
            <MetricCalculator
              title={`Calculate Your ${metric.shortName}`}
              description={`Enter your numbers to calculate ${metric.shortName.toLowerCase()} instantly.`}
              fields={JSON.stringify(metric.calculatorFields)}
              result={JSON.stringify(metric.calculatorResult)}
              formula={metric.calculatorFormula}
              color={cat.color}
            />
          </div>
        </section>

        {/* ── Benchmarks ── */}
        <section className="py-12 border-t border-[#e5e7eb]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-extrabold font-heading text-[#1a1a2e] mb-6">
              Industry Benchmarks
            </h2>
            <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8f9fc]">
                    <th className="text-left px-5 py-3 font-bold text-[#1a1a2e]">Segment</th>
                    <th className="text-left px-5 py-3 font-bold text-[#10B981]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        Good
                      </span>
                    </th>
                    <th className="text-left px-5 py-3 font-bold text-[#F59E0B]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                        Average
                      </span>
                    </th>
                    <th className="text-left px-5 py-3 font-bold text-[#EF4444]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                        Poor
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metric.benchmarks.map((row, i) => (
                    <tr
                      key={i}
                      className={i < metric.benchmarks.length - 1 ? "border-b border-[#e5e7eb]" : ""}
                    >
                      <td className="px-5 py-3 font-medium text-[#1a1a2e]">{row.segment}</td>
                      <td className="px-5 py-3 text-[#10B981] font-semibold">{row.good}</td>
                      <td className="px-5 py-3 text-[#F59E0B] font-semibold">{row.average}</td>
                      <td className="px-5 py-3 text-[#EF4444] font-semibold">{row.poor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Expert Tips ── */}
        <section className="py-12 bg-white border-t border-[#e5e7eb]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-extrabold font-heading text-[#1a1a2e] mb-6">
              Expert Tips
            </h2>
            <div className="space-y-3">
              {metric.expertTips.map((tip, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl border border-[#e5e7eb] bg-[#f8f9fc] p-4"
                >
                  <Lightbulb
                    className="w-5 h-5 mt-0.5 shrink-0"
                    style={{ color: cat.color }}
                  />
                  <p className="text-sm text-[#6b7280] leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 border-t border-[#e5e7eb]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-extrabold font-heading text-[#1a1a2e] mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {metric.faq.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-[#e5e7eb] bg-white"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-left font-semibold text-[#1a1a2e] [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-[#6b7280] transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 text-sm leading-relaxed text-[#6b7280]">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Related Metrics ── */}
        {related.length > 0 && (
          <section className="py-12 bg-white border-t border-[#e5e7eb]">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-2xl font-extrabold font-heading text-[#1a1a2e] mb-6">
                Related Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((rm) => {
                  const rCat = CATEGORY_META[rm.category];
                  return (
                    <Link
                      key={rm.slug}
                      href={`/knowledge-base/${rm.slug}`}
                      className="group rounded-xl border border-[#e5e7eb] bg-[#f8f9fc] p-4 transition-all hover:border-[#2163e7]/40 hover:shadow-sm"
                    >
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white mb-2"
                        style={{ backgroundColor: rCat.color }}
                      >
                        {rCat.label.replace(" Metrics", "")}
                      </span>
                      <h3 className="text-sm font-bold text-[#1a1a2e] group-hover:text-[#2163e7] transition-colors">
                        {rm.shortName}
                      </h3>
                      <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">
                        {rm.description.slice(0, 80)}...
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Applicable Models ── */}
        <section className="py-12 border-t border-[#e5e7eb]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-extrabold font-heading text-[#1a1a2e] mb-4">
              Business Models Using {metric.shortName}
            </h2>
            <p className="text-[#6b7280] mb-6">
              {metric.shortName} is a key metric for these business types. Click any model to see how Revenue Map calculates it automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              {metric.models.map((key) => {
                const m = MODEL_REGISTRY[key as ProductType];
                if (!m) return null;
                return (
                  <Link
                    key={key}
                    href={`/models/${key}`}
                    className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 transition-all hover:border-[#2163e7]/30 hover:shadow-sm"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: m.elementBg, color: m.elementText }}
                    >
                      <m.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium text-[#1a1a2e]">{m.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6b7280]" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 border-t border-[#e5e7eb] grid-pattern">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold font-heading text-[#1a1a2e] sm:text-4xl">
              Track {metric.shortName} automatically
            </h2>
            <p className="mt-4 text-lg text-[#6b7280] max-w-xl mx-auto">
              Revenue Map calculates {metric.shortName.toLowerCase()}, benchmarks it against your industry, and projects it over 36 months — in under 5 minutes.
            </p>
            <Link
              href="/onboarding/survey"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white bg-[#2163e7] hover:bg-[#1a53c7] transition-colors shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              Build My Model — Free
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-[#e5e7eb] py-10 bg-white">
          <div className="container mx-auto px-4 text-center text-sm text-[#6b7280]">
            &copy; {new Date().getFullYear()} Revenue Map. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}

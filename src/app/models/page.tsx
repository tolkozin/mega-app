import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { getAllModels } from "@/lib/model-registry";
import { ArrowRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app";

export const metadata: Metadata = {
  title: "Financial Models for Every Business Type — Subscription, E-Commerce, SaaS & More",
  description:
    "Choose from 9+ ready-made financial model templates. Each uses real industry benchmarks, Monte Carlo simulations, and AI to deliver accurate projections in minutes — no spreadsheets required.",
  alternates: { canonical: `${SITE_URL}/models` },
  openGraph: {
    title: "Financial Models for Every Business Type — Revenue Map",
    description:
      "9+ ready-made financial models with real benchmarks and AI projections. Subscription apps, e-commerce, B2B SaaS, marketplaces, and more.",
    url: `${SITE_URL}/models`,
  },
};

const MODELS = getAllModels();

/* Questions each model helps answer */
const MODEL_QUESTIONS: Record<string, string[]> = {
  subscription: [
    "Will my app be profitable with freemium?",
    "How many users do I need to hit $1M ARR?",
    "What's the optimal pricing for my subscription tiers?",
    "When will I break even on customer acquisition?",
  ],
  ecommerce: [
    "Am I actually making money on each order?",
    "How much can I afford to spend on ads?",
    "When will my store become profitable?",
    "What AOV do I need to cover my costs?",
  ],
  saas: [
    "Am I growing efficiently enough for investors?",
    "What's my Rule of 40 and Magic Number?",
    "How long until CAC payback?",
    "Is my NRR strong enough to sustain growth?",
  ],
  marketplace: [
    "Can my marketplace reach critical mass?",
    "What take rate makes both sides happy?",
    "How much does each transaction actually cost me?",
    "When does supply/demand become self-reinforcing?",
  ],
  foodtech: [
    "Is each delivery order actually profitable?",
    "How do delivery costs scale with volume?",
    "What's the right pricing for my market?",
    "Can I afford to subsidize early orders?",
  ],
  traveltech: [
    "Will my platform survive the off-season?",
    "What commission rate makes sense for my niche?",
    "How does seasonality affect my cash position?",
    "When does repeat travel booking kick in?",
  ],
  gametech: [
    "Will players stick around long enough to monetize?",
    "What's the real LTV of my player cohorts?",
    "Can my UA spend scale profitably?",
    "How much should I invest in retention features?",
  ],
  fintech: [
    "Can my fintech scale past compliance costs?",
    "What transaction volume do I need to break even?",
    "How do regulatory costs affect unit economics?",
    "Is my revenue per user enough to cover risk?",
  ],
  healthtech: [
    "Can my health platform scale with regulatory overhead?",
    "What's the real cost of patient acquisition?",
    "How do compliance costs change at scale?",
    "Is my per-patient revenue sustainable?",
  ],
  edtech: [
    "Will students stay long enough to be profitable?",
    "What completion rate do I need for positive LTV?",
    "How does content cost scale with student count?",
    "Can I justify my pricing vs free alternatives?",
  ],
  proptech: [
    "What's my real cost per closed deal?",
    "How long is my average sales cycle and cost?",
    "Can my margins survive commission pressure?",
    "When does my listing inventory become self-sustaining?",
  ],
  "ai-ml": [
    "Can my AI product scale without burning through compute?",
    "How does inference cost change with user growth?",
    "What pricing covers my GPU costs?",
    "When do economies of scale kick in for my model?",
  ],
};

export default function AllModelsPage() {
  return (
    <>
      <LandingNavbar />
      <div className="min-h-screen bg-[#f8f9fc]">
        {/* Hero */}
        <section className="pt-20 pb-12 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#1a1a2e] mb-4">
            Every business model.<br className="hidden sm:block" />One platform.
          </h1>
          <p className="text-lg text-[#6b7280] max-w-2xl mx-auto mb-8">
            Choose your business type and get instant financial projections built on real benchmarks — no spreadsheet skills required.
          </p>
          <Link href="/onboarding/survey">
            <button className="h-11 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-lg hover:bg-[#1a53c7] transition-colors">
              Get Started Free
            </button>
          </Link>
        </section>

        {/* Model cards grid */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODELS.map((m) => {
              const questions = MODEL_QUESTIONS[m.key] ?? [];
              return (
                <div
                  key={m.key}
                  className="bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:border-[#2163e7]/30 hover:shadow-lg transition-all flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: m.elementBg, color: m.elementText }}
                    >
                      <m.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#1a1a2e]">{m.label}</h2>
                      <span className="text-xs text-[#9ca3af] uppercase tracking-wider">
                        {m.baseEngine} engine
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#6b7280] mb-4 leading-relaxed">{m.description}</p>

                  {/* Questions this model answers */}
                  {questions.length > 0 && (
                    <div className="mb-6 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                        Questions it answers
                      </p>
                      <ul className="space-y-1.5">
                        {questions.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#4b5563]">
                            <span className="text-[#2163e7] mt-0.5 shrink-0">?</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex gap-2 mt-auto pt-4 border-t border-[#f3f4f6]">
                    <Link href={`/dashboard/${m.key}`} className="flex-1">
                      <button className="w-full h-9 bg-[#2163e7] text-white text-sm font-bold rounded-lg hover:bg-[#1a53c7] transition-colors flex items-center justify-center gap-1.5">
                        Try it now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <Link href={`/models/${m.key}`}>
                      <button className="h-9 px-4 text-sm font-medium text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:border-[#2163e7] hover:text-[#2163e7] transition-colors">
                        Learn more
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-[#e5e7eb] py-20 px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-[#1a1a2e] mb-4">
            Not sure which model fits?
          </h2>
          <p className="text-[#6b7280] max-w-xl mx-auto mb-8">
            Start with our guided setup — we&apos;ll recommend the right model based on your business type, stage, and goals.
          </p>
          <Link href="/onboarding/survey">
            <button className="h-11 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-lg hover:bg-[#1a53c7] transition-colors">
              Start Free Setup
            </button>
          </Link>
        </section>
      </div>
    </>
  );
}

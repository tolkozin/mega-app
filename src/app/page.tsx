import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const features = [
  {
    title: "Subscription Modeling",
    description: "MRR, churn, cohort analysis, 67+ configurable parameters with 3-phase business lifecycle.",
  },
  {
    title: "E-commerce Modeling",
    description: "AOV, CPC, unit economics, repeat purchases, COGS tracking with full P&L projections.",
  },
  {
    title: "SaaS B2B Modeling",
    description: "ARR, NRR, GRR, Quick Ratio, Rule of 40, Magic Number with seat-based pricing.",
  },
  {
    title: "Monte Carlo Simulation",
    description: "Run hundreds of simulations to understand your risk profile and confidence intervals.",
  },
  {
    title: "Scenario Analysis",
    description: "Base, optimistic, and pessimistic scenarios with adjustable sensitivity parameters.",
  },
  {
    title: "Invoicing",
    description: "Create and track invoices with status management, line items, and tax calculations.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["1 project", "3 scenarios per project", "All charts & reports", "CSV export"],
  },
  {
    name: "Pro",
    price: "$29/mo",
    features: ["Unlimited projects", "Unlimited scenarios", "Monte Carlo simulation", "Public dashboards", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Everything in Pro", "Team workspace", "Custom branding", "API access", "Dedicated support"],
  },
];

export default function LandingPage() {
  const featuredPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <LandingNavbar />

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1C1D21] mb-6">
            Financial Modeling
            <br />
            <span className="text-[#5E81F4]">for Modern Businesses</span>
          </h1>
          <p className="text-lg md:text-xl text-[#8181A5] max-w-2xl mx-auto mb-8">
            Build investor-ready financial models for subscription, e-commerce, and SaaS businesses.
            Monte Carlo simulations, scenario analysis, and beautiful dashboards.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <button className="h-11 px-6 bg-[#5E81F4] text-white font-bold text-sm rounded-lg hover:bg-[#4B6FE0] transition-colors">
                Start Free
              </button>
            </Link>
            <Link href="/pricing">
              <button className="h-11 px-6 border border-[#ECECF2] text-[#1C1D21] font-bold text-sm rounded-lg hover:bg-[#F8F8FC] transition-colors">
                View Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#F8F8FC]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1C1D21] text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl border border-[#ECECF2] p-6">
                <h3 className="text-[15px] font-bold text-[#1C1D21] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#8181A5]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1C1D21] text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl border p-6 ${
                  plan.highlighted
                    ? "border-[#5E81F4] shadow-lg shadow-[#5E81F4]/10 scale-105"
                    : "border-[#ECECF2]"
                }`}
              >
                <h3 className="text-lg font-bold text-[#1C1D21] mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-[#1C1D21] mb-4">{plan.price}</div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center text-sm text-[#8181A5]">
                      <svg className="w-4 h-4 mr-2 text-[#5E81F4] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block">
                  <button
                    className={`w-full h-10 text-sm font-bold rounded-lg transition-colors ${
                      plan.highlighted
                        ? "bg-[#5E81F4] text-white hover:bg-[#4B6FE0]"
                        : "border border-[#ECECF2] text-[#1C1D21] hover:bg-[#F8F8FC]"
                    }`}
                  >
                    {plan.name === "Enterprise" ? "Contact Us" : "Get Started"}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* From the Blog */}
      {featuredPosts.length > 0 && (
        <section className="py-20 bg-[#F8F8FC]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-[#1C1D21]">From the Blog</h2>
              <Link href="/blog">
                <button className="h-9 px-4 border border-[#ECECF2] text-[#1C1D21] text-sm font-bold rounded-lg hover:bg-white transition-colors">
                  View All Articles
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#ECECF2] py-8">
        <div className="container mx-auto px-4 text-center text-sm text-[#8181A5]">
          <p>&copy; {new Date().getFullYear()} Mega App. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

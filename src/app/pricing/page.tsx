import Link from "next/link";
import type { Metadata } from "next";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://megaapp.io";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free and upgrade when you need more power. Plans for solo founders, growing teams, and enterprises.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing — Mega App",
    description:
      "Start free and upgrade when you need more power. Plans for solo founders, growing teams, and enterprises.",
    url: `${SITE_URL}/pricing`,
  },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["1 project", "3 scenarios per project", "All charts & reports", "CSV export"],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited projects",
      "Unlimited scenarios",
      "Monte Carlo simulation",
      "Public dashboards",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Everything in Pro",
      "Team workspace",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <LandingNavbar />
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-[#1C1D21] text-center mb-4">Pricing</h1>
        <p className="text-center text-[#8181A5] mb-12 max-w-lg mx-auto">
          Start free and upgrade when you need more power. All plans include core financial modeling features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl border p-6 ${
                plan.highlighted
                  ? "border-[#5E81F4] shadow-lg shadow-[#5E81F4]/10"
                  : "border-[#ECECF2]"
              }`}
            >
              <h3 className="text-lg font-bold text-[#1C1D21]">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#1C1D21]">{plan.price}</span>
                <span className="text-[#8181A5]">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center text-sm text-[#8181A5]">
                    <svg className="w-4 h-4 mr-2 text-[#5E81F4] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
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
    </>
  );
}

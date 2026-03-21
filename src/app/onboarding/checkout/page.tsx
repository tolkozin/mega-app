"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Check } from "lucide-react";

const PLANS = [
  {
    key: "plus",
    name: "Plus",
    subtitle: "For founders actively building their model",
    monthlyPrice: 29,
    annualPrice: 23,
    features: [
      "3 projects",
      "3 scenarios per project",
      "30 AI messages / month",
      "3 AI reports / month",
      "Share with up to 3 people",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    subtitle: "For serious founders who need no limits",
    monthlyPrice: 49,
    annualPrice: 39,
    badge: "Most Popular",
    features: [
      "Unlimited projects",
      "Unlimited scenarios",
      "Unlimited AI messages",
      "Unlimited AI reports",
      "Share with up to 10 people",
    ],
  },
];

function getVariantId(plan: string, annual: boolean): string {
  if (plan === "plus") {
    return annual
      ? (process.env.NEXT_PUBLIC_LEMONSQUEEZY_PLUS_ANNUAL_VARIANT_ID ?? "")
      : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID ?? "");
  }
  if (plan === "pro") {
    return annual
      ? (process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID ?? "")
      : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID ?? "");
  }
  return "";
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-[#8181A5]">Loading...</p></div>}>
      <CheckoutPage />
    </Suspense>
  );
}

function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [annual, setAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(
    searchParams.get("plan") === "pro" ? "pro" : "plus"
  );

  const surveyId = searchParams.get("survey_id") ?? "";

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  async function handleStart() {
    setLoading(true);
    try {
      const variantId = getVariantId(selectedPlan, annual);
      if (!variantId) throw new Error("Variant not configured");

      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, plan: selectedPlan, surveyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (!data.url) throw new Error("No checkout URL");
      window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to start checkout");
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#8181A5]">Loading...</p>
      </div>
    );
  }

  const plan = PLANS.find((p) => p.key === selectedPlan)!;
  const price = annual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="Revenue Map" className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-[#1C1D21] text-center mb-1">
          Almost there!
        </h1>
        <p className="text-sm text-[#8181A5] text-center mb-8">
          Choose your plan and start your 3-day free trial
        </p>

        {/* Billing toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-1 bg-white rounded-full border border-[#ECECF2] p-0.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                !annual ? "bg-[#2163E7] text-white" : "text-[#8181A5]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                annual ? "bg-[#2163E7] text-white" : "text-[#8181A5]"
              }`}
            >
              Annually
            </button>
          </div>
          {annual && (
            <span className="ml-2 text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full self-center">
              Save 20%
            </span>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {PLANS.map((p) => {
            const isSelected = selectedPlan === p.key;
            const displayPrice = annual ? p.annualPrice : p.monthlyPrice;
            return (
              <button
                key={p.key}
                onClick={() => setSelectedPlan(p.key)}
                className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#2163E7] bg-[#2163E7]/5 shadow-md shadow-[#2163E7]/10"
                    : "border-[#ECECF2] hover:border-[#2163E7]/40 bg-white"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 right-3 text-[10px] font-bold bg-[#2163E7] text-white px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold text-[#1C1D21]">{p.name}</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-[#2163E7] bg-[#2163E7]" : "border-[#ECECF2]"
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2.5 5L4.5 7L7.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#8181A5] mb-3">{p.subtitle}</p>

                <div className="flex items-baseline gap-1 mb-3">
                  {annual && (
                    <span className="text-lg font-bold text-[#8181A5] line-through">${p.monthlyPrice}</span>
                  )}
                  <span className="text-2xl font-extrabold text-[#1C1D21]">${displayPrice}</span>
                  <span className="text-xs text-[#8181A5]">/mo</span>
                </div>

                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                      <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Price summary */}
        <div className="rounded-xl border border-[#ECECF2] bg-[#F8F8FC] p-4 mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-[#1C1D21]">
              {plan.name} — {annual ? "Annual" : "Monthly"}
            </span>
            <span className="text-lg font-extrabold text-[#1C1D21]">${price}/mo</span>
          </div>
          {annual && (
            <p className="text-xs text-[#8181A5]">
              Billed ${plan.annualPrice * 12}/yr
            </p>
          )}
          <p className="text-xs text-[#F59E0B] font-bold mt-2">
            3 days free, then billed {annual ? "annually" : "monthly"}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full h-12 text-sm font-bold rounded-xl bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Redirecting..." : "Start Free Trial →"}
        </button>

        <p className="text-xs text-[#8181A5] text-center mt-3">
          3 days free, then auto-renews. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

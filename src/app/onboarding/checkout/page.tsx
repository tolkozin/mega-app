"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const PLAN_INFO: Record<string, { name: string; monthlyPrice: number; annualPrice: number }> = {
  plus: { name: "Plus", monthlyPrice: 29, annualPrice: 23 },
  pro: { name: "Pro", monthlyPrice: 49, annualPrice: 39 },
};

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

  const plan = searchParams.get("plan") ?? "plus";
  const surveyId = searchParams.get("survey_id") ?? "";
  const info = PLAN_INFO[plan] ?? PLAN_INFO.plus;
  const price = annual ? info.annualPrice : info.monthlyPrice;

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  async function handleStart() {
    setLoading(true);
    try {
      const variantId = getVariantId(plan, annual);
      if (!variantId) throw new Error("Variant not configured");

      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, plan, surveyId }),
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="Revenue Map" className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-[#1C1D21] text-center mb-1">
          Almost there!
        </h1>
        <p className="text-sm text-[#8181A5] text-center mb-8">
          Set up your 3-day free trial
        </p>

        {/* Plan card */}
        <div className="rounded-xl border border-[#ECECF2] bg-[#F8F8FC] p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[#1C1D21]">
              Plan: {info.name}
            </span>
            <div className="flex items-center gap-1 bg-white rounded-full border border-[#ECECF2] p-0.5">
              <button
                onClick={() => setAnnual(false)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                  !annual ? "bg-[#5E81F4] text-white" : "text-[#8181A5]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                  annual ? "bg-[#5E81F4] text-white" : "text-[#8181A5]"
                }`}
              >
                Annually
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            {annual && (
              <span className="text-xl font-bold text-[#8181A5] line-through">${info.monthlyPrice}</span>
            )}
            <span className="text-3xl font-black text-[#1C1D21]">
              ${price}
            </span>
            <span className="text-sm text-[#8181A5]">/mo</span>
          </div>
          {annual && (
            <p className="text-xs text-[#8181A5] mt-1">
              Billed ${info.annualPrice * 12}/yr
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
          className="w-full h-12 text-sm font-bold rounded-xl bg-[#5E81F4] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Redirecting..." : "Start Free Trial →"}
        </button>

        <p className="text-xs text-[#8181A5] text-center mt-3">
          No charge today. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

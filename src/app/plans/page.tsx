"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { formatLimit } from "@/lib/plan-limits";

/* ─── Variant IDs ─── */

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

/* ─── Plan data ─── */

const plans = [
  {
    key: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { label: "Projects", value: "1" },
      { label: "Scenarios / project", value: "1" },
      { label: "Sharing", value: "None" },
      { label: "AI messages / month", value: "10" },
      { label: "AI reports / month", value: "1" },
    ],
  },
  {
    key: "plus",
    name: "Plus",
    monthlyPrice: 18,
    annualPrice: 14.4,
    annualTotal: 172.8,
    badge: "Most Popular",
    features: [
      { label: "Projects", value: "3" },
      { label: "Scenarios / project", value: "3" },
      { label: "Sharing", value: "Up to 3 people" },
      { label: "AI messages / month", value: "30" },
      { label: "AI reports / month", value: "3" },
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 23.2,
    annualTotal: 278.4,
    features: [
      { label: "Projects", value: "Unlimited" },
      { label: "Scenarios / project", value: "Unlimited" },
      { label: "Sharing", value: "Up to 10 people" },
      { label: "AI messages / month", value: "Unlimited" },
      { label: "AI reports / month", value: "Unlimited" },
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthlyPrice: -1,
    annualPrice: -1,
    features: [
      { label: "Projects", value: "Custom" },
      { label: "Scenarios / project", value: "Custom" },
      { label: "Sharing", value: "Unlimited" },
      { label: "AI messages / month", value: "Unlimited" },
      { label: "AI reports / month", value: "Unlimited" },
    ],
  },
];

const planOrder = ["free", "plus", "pro", "enterprise"];

export default function PlansPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, limits, loading: profileLoading } = useProfile();
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Auto-trigger checkout if pending_plan from auth flow
  useEffect(() => {
    if (!user || profileLoading) return;
    const pendingPlan = localStorage.getItem("pending_plan");
    if (pendingPlan) {
      localStorage.removeItem("pending_plan");
      if (pendingPlan !== profile?.plan && (pendingPlan === "plus" || pendingPlan === "pro")) {
        handleCheckout(pendingPlan);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileLoading]);

  // Load Lemon Squeezy JS
  useEffect(() => {
    if (document.getElementById("lemonsqueezy-js")) return;
    const script = document.createElement("script");
    script.id = "lemonsqueezy-js";
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan);
    try {
      const variantId = getVariantId(plan, annual);
      if (!variantId) {
        alert("Payment is not yet configured. Please try again later.");
        return;
      }

      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.LemonSqueezy) {
        win.LemonSqueezy.Url.Open(data.url);
      } else {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleManageSubscription() {
    try {
      const res = await fetch("/api/lemonsqueezy/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch {
      alert("Failed to open subscription portal.");
    }
  }

  const currentPlanIndex = planOrder.indexOf(profile?.plan ?? "free");

  if (authLoading || profileLoading) {
    return (
      <AppShell title="Plans">
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-sm text-[#8181A5]">Loading...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Plans">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1C1D21] mb-2">Choose Your Plan</h1>
          <p className="text-sm text-[#8181A5]">
            You&apos;re currently on the <span className="font-bold text-[#1C1D21]">{(profile?.plan ?? "free").charAt(0).toUpperCase() + (profile?.plan ?? "free").slice(1)}</span> plan.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex items-center rounded-full border border-[#ECECF2] bg-white p-0.5">
            <button
              onClick={() => setAnnual(false)}
              className={`relative z-10 px-4 py-1.5 text-sm font-bold rounded-full transition-colors ${
                !annual ? "text-white" : "text-[#8181A5]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`relative z-10 px-4 py-1.5 text-sm font-bold rounded-full transition-colors ${
                annual ? "text-white" : "text-[#8181A5]"
              }`}
            >
              Annually
            </button>
            <div
              className="absolute top-0.5 bottom-0.5 rounded-full bg-[#5E81F4] transition-all duration-300"
              style={{
                width: "calc(50% - 2px)",
                left: annual ? "calc(50% + 1px)" : "2px",
              }}
            />
          </div>
          {!annual && (
            <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full">
              Save 20%
            </span>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {plans.map((plan) => {
            const planIndex = planOrder.indexOf(plan.key);
            const isCurrent = plan.key === (profile?.plan ?? "free");
            const isDowngrade = planIndex < currentPlanIndex;
            const isUpgrade = planIndex > currentPlanIndex;
            const price = plan.monthlyPrice === -1
              ? "Custom"
              : plan.monthlyPrice === 0
              ? "$0"
              : annual
              ? `$${plan.annualPrice! % 1 === 0 ? plan.annualPrice : plan.annualPrice!.toFixed(2).replace(/0$/, "")}`
              : `$${plan.monthlyPrice}`;

            return (
              <div
                key={plan.key}
                className={`relative rounded-xl border p-5 transition-all ${
                  isCurrent
                    ? "border-[#5E81F4] bg-[#5E81F4]/5 ring-1 ring-[#5E81F4]"
                    : plan.badge
                    ? "border-[#5E81F4]/40 bg-white"
                    : "border-[#ECECF2] bg-white"
                }`}
              >
                {plan.badge && !isCurrent && (
                  <div className="absolute -top-2.5 right-3 rounded-full bg-[#5E81F4] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {plan.badge}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-2.5 right-3 rounded-full bg-[#14A660] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    Current Plan
                  </div>
                )}

                <h3 className="text-lg font-bold text-[#1C1D21] mb-1">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-[#1C1D21]">{price}</span>
                  {plan.monthlyPrice > 0 && <span className="text-sm text-[#8181A5]">/mo</span>}
                  {plan.monthlyPrice === 0 && <span className="text-sm text-[#8181A5]">/forever</span>}
                </div>

                {annual && plan.annualTotal && (
                  <p className="text-xs text-[#8181A5] -mt-3 mb-4">
                    Billed ${plan.annualTotal.toFixed(2).replace(/\.00$/, "")}/yr
                  </p>
                )}

                <div className="space-y-2.5 mb-5">
                  {plan.features.map((f) => (
                    <div key={f.label} className="flex items-center justify-between text-sm">
                      <span className="text-[#8181A5]">{f.label}</span>
                      <span className="font-bold text-[#1C1D21]">{f.value}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  profile?.lemon_squeezy_subscription_id ? (
                    <button
                      onClick={handleManageSubscription}
                      className="w-full h-9 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#8181A5] hover:text-[#1C1D21] hover:border-[#5E81F4] transition-colors"
                    >
                      Manage Subscription
                    </button>
                  ) : (
                    <div className="w-full h-9 flex items-center justify-center text-sm font-bold text-[#14A660]">
                      Active
                    </div>
                  )
                ) : plan.key === "enterprise" ? (
                  <a href="mailto:hello@revenuemap.app">
                    <button className="w-full h-9 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#8181A5] hover:text-[#1C1D21] hover:border-[#5E81F4] transition-colors">
                      Contact Us
                    </button>
                  </a>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={checkoutLoading === plan.key}
                    className="w-full h-9 text-sm font-bold rounded-lg bg-[#5E81F4] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-50"
                  >
                    {checkoutLoading === plan.key ? "Loading..." : `Upgrade to ${plan.name}`}
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={handleManageSubscription}
                    className="w-full h-9 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#8181A5] hover:text-[#1C1D21] transition-colors"
                  >
                    Downgrade
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Current usage */}
        {profile && (
          <div className="rounded-xl border border-[#ECECF2] bg-white p-5">
            <h3 className="text-sm font-bold text-[#1C1D21] mb-4">Current Usage</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <UsageStat label="AI Messages" current={profile.ai_chat_count ?? 0} max={limits.aiMessagesPerMonth} />
              <UsageStat label="AI Reports" current={profile.ai_report_count ?? 0} max={limits.aiReportsPerMonth} />
              <UsageStat label="Max Projects" current={null} max={limits.maxProjects} />
              <UsageStat label="Max Shares" current={null} max={limits.maxShares} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function UsageStat({ label, current, max }: { label: string; current: number | null; max: number }) {
  const isUnlimited = max === Infinity;
  return (
    <div>
      <p className="text-xs text-[#8181A5] mb-1">{label}</p>
      <p className="text-lg font-bold text-[#1C1D21]">
        {current !== null ? (
          <>{current} <span className="text-sm font-normal text-[#8181A5]">/ {formatLimit(max)}</span></>
        ) : (
          formatLimit(max)
        )}
      </p>
    </div>
  );
}

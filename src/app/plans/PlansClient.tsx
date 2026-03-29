"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { V2Shell as AppShell } from "@/components/v2/layout/V2Shell";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { formatLimit, isActivePlan, PLAN_LIMITS } from "@/lib/plan-limits";

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
    key: "plus",
    name: "Plus",
    monthlyPrice: 29,
    annualPrice: 23,
    annualTotal: 276,
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
    monthlyPrice: 49,
    annualPrice: 39,
    annualTotal: 468,
    badge: "Most Popular",
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

const planOrder = ["free", "expired", "plus", "pro", "enterprise"];

export function PlansClient() {
  const { user, loading: authLoading } = useAuth();
  const { profile, limits, loading: profileLoading, refetch } = useProfile();
  const router = useRouter();
  const [annual, setAnnual] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    targetPlan: string;
    targetName: string;
    isUpgrade: boolean;
  } | null>(null);

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


  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan);
    try {
      const variantId = getVariantId(plan, annual);

      if (!variantId) {
        window.location.href = "/pricing";
        return;
      }

      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, plan }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (!data.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (error) {
      console.error("[Checkout] error:", error);
      alert(error instanceof Error ? error.message : "Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  const hasSubscription = !!profile?.lemon_squeezy_subscription_id;

  function openConfirmModal(targetPlanKey: string, targetPlanName: string, isUpgrade: boolean) {
    setConfirmModal({ targetPlan: targetPlanKey, targetName: targetPlanName, isUpgrade });
  }

  async function handleConfirmChange() {
    if (!confirmModal) return;
    const { targetPlan } = confirmModal;
    setConfirmModal(null);
    setCheckoutLoading(targetPlan);
    try {
      const res = await fetch("/api/lemonsqueezy/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan, annual }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Plan change failed");
      await refetch();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to change plan. Please try again.");
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

  async function handleRefreshPlan() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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

  const isExpiredOrFree = !isActivePlan(profile?.plan ?? "free");

  return (
    <AppShell title="Plans">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1C1D21] mb-2">Choose Your Plan</h1>
          <p className="text-sm text-[#8181A5]">
            {isExpiredOrFree ? (
              <>Subscribe to start using Revenue Map. All plans include a <span className="font-bold text-[#F59E0B]">10-day free trial</span>.</>
            ) : (
              <>You&apos;re on the <span className="font-bold text-[#1C1D21]">{(profile?.plan ?? "free").charAt(0).toUpperCase() + (profile?.plan ?? "free").slice(1)}</span> plan.</>
            )}
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
              className="absolute top-0.5 bottom-0.5 rounded-full bg-[#2163E7] transition-all duration-300"
              style={{
                width: "calc(50% - 2px)",
                left: annual ? "calc(50% + 1px)" : "2px",
              }}
            />
          </div>
          {annual && (
            <span className="text-xs font-bold text-[#14A660] bg-[#14A660]/10 px-2.5 py-1 rounded-full">
              Save 20%
            </span>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {plans.map((plan) => {
            const planIndex = planOrder.indexOf(plan.key);
            const isCurrent = plan.key === (profile?.plan ?? "free");
            const isUpgrade = planIndex > currentPlanIndex;
            const price = plan.monthlyPrice === -1
              ? "Custom"
              : `$${annual ? plan.annualPrice : plan.monthlyPrice}`;

            return (
              <div
                key={plan.key}
                className={`relative rounded-xl border p-5 transition-all ${
                  isCurrent
                    ? "border-[#2163E7] bg-[#2163E7]/5 ring-1 ring-[#2163E7]"
                    : plan.badge
                    ? "border-[#2163E7]/40 bg-white"
                    : "border-[#ECECF2] bg-white"
                }`}
              >
                {plan.badge && !isCurrent && (
                  <div className="absolute -top-2.5 right-3 rounded-full bg-[#2163E7] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {plan.badge}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-2.5 right-3 rounded-full bg-[#14A660] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    Current Plan
                  </div>
                )}

                <h3 className="text-lg font-bold text-[#1C1D21] mb-1">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-1">
                  {annual && plan.monthlyPrice > 0 && (
                    <span className="text-xl font-bold text-[#8181A5] line-through">${plan.monthlyPrice}</span>
                  )}
                  <span className="text-3xl font-extrabold text-[#1C1D21]">{price}</span>
                  {plan.monthlyPrice > 0 && <span className="text-sm text-[#8181A5]">/mo</span>}
                </div>

                {annual && plan.annualTotal && (
                  <p className="text-xs text-[#8181A5] mb-1">
                    Billed annually
                  </p>
                )}

                {plan.monthlyPrice > 0 && (
                  <p className="text-xs text-[#F59E0B] font-bold mb-4">10-day free trial</p>
                )}
                {plan.monthlyPrice === -1 && <div className="mb-4" />}

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
                  hasSubscription ? (
                    <button
                      onClick={handleManageSubscription}
                      className="w-full h-9 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#8181A5] hover:text-[#1C1D21] hover:border-[#2163E7] transition-colors"
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
                    <button className="w-full h-9 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#8181A5] hover:text-[#1C1D21] hover:border-[#2163E7] transition-colors">
                      Contact Us
                    </button>
                  </a>
                ) : hasSubscription && isActivePlan(profile!.plan) ? (
                  isUpgrade ? (
                    <button
                      onClick={() => openConfirmModal(plan.key, plan.name, true)}
                      disabled={checkoutLoading === plan.key}
                      className="w-full h-9 text-sm font-bold rounded-lg bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-50"
                    >
                      {checkoutLoading === plan.key ? "Upgrading..." : `Upgrade to ${plan.name}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => openConfirmModal(plan.key, plan.name, false)}
                      disabled={checkoutLoading === plan.key}
                      className="w-full h-9 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#8181A5] hover:text-[#1C1D21] transition-colors disabled:opacity-50"
                    >
                      {checkoutLoading === plan.key ? "Downgrading..." : "Downgrade"}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={checkoutLoading === plan.key}
                    className="w-full h-9 text-sm font-bold rounded-lg bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-50"
                  >
                    {checkoutLoading === plan.key ? "Loading..." : "Start free trial"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Refresh plan button */}
        <div className="flex items-center justify-center mb-8">
          <button
            onClick={handleRefreshPlan}
            disabled={refreshing}
            className="text-sm text-[#8181A5] hover:text-[#2163E7] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? "animate-spin" : ""}>
              <path d="M14 8A6 6 0 112.34 5.67" />
              <path d="M2 2v4h4" />
            </svg>
            {refreshing ? "Refreshing..." : "Just paid? Refresh plan status"}
          </button>
        </div>

        {/* Current usage */}
        {profile && isActivePlan(profile.plan) && (
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
        {/* Confirmation modal */}
        {confirmModal && (
          <PlanChangeModal
            currentPlan={profile?.plan ?? "free"}
            targetPlan={confirmModal.targetPlan}
            targetName={confirmModal.targetName}
            isUpgrade={confirmModal.isUpgrade}
            onConfirm={handleConfirmChange}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </div>
    </AppShell>
  );
}

/* ─── Confirmation Modal ─── */

const featureLabels: Record<string, string> = {
  maxProjects: "Projects",
  maxScenariosPerProject: "Scenarios per project",
  maxShares: "Team sharing",
  aiMessagesPerMonth: "AI messages / month",
  aiReportsPerMonth: "AI reports / month",
};

function fmtValue(v: number): string {
  return v === Infinity ? "Unlimited" : String(v);
}

function PlanChangeModal({
  currentPlan,
  targetPlan,
  targetName,
  isUpgrade,
  onConfirm,
  onCancel,
}: {
  currentPlan: string;
  targetPlan: string;
  targetName: string;
  isUpgrade: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const current = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;
  const target = PLAN_LIMITS[targetPlan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;

  const keys = ["maxProjects", "maxScenariosPerProject", "maxShares", "aiMessagesPerMonth", "aiReportsPerMonth"] as const;

  // For upgrade: show what you gain (target > current)
  // For downgrade: show what you lose (current > target)
  const changes = keys
    .filter((k) => current[k] !== target[k])
    .map((k) => ({
      label: featureLabels[k],
      from: fmtValue(current[k]),
      to: fmtValue(target[k]),
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isUpgrade ? "bg-[#2163E7]/10" : "bg-[#F59E0B]/10"
            }`}
          >
            {isUpgrade ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2163E7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 16V4M10 4l5 5M10 4L5 9" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 4v12M10 16l5-5M10 16l-5-5" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1C1D21]">
              {isUpgrade ? `Upgrade to ${targetName}` : `Downgrade to ${targetName}`}
            </h3>
            <p className="text-sm text-[#8181A5]">
              {isUpgrade
                ? "Your plan will be upgraded immediately with prorated billing."
                : "Changes take effect at the end of your current billing period."}
            </p>
          </div>
        </div>

        {/* Changes list */}
        <div className="rounded-xl border border-[#ECECF2] overflow-hidden">
          <div
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wide ${
              isUpgrade
                ? "bg-[#2163E7]/5 text-[#2163E7]"
                : "bg-[#F59E0B]/5 text-[#F59E0B]"
            }`}
          >
            {isUpgrade ? "What you get" : "What you lose"}
          </div>
          <div className="divide-y divide-[#ECECF2]">
            {changes.map((c) => (
              <div key={c.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-[#1C1D21]">{c.label}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#8181A5]">{c.from}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#8181A5" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 6h8M7 3l3 3-3 3" />
                  </svg>
                  <span className={`font-bold ${isUpgrade ? "text-[#14A660]" : "text-[#E54545]"}`}>
                    {c.to}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proration note */}
        <p className="text-xs text-[#8181A5]">
          {isUpgrade
            ? "You will be charged a prorated amount for the remainder of this billing cycle. The full new price applies at next renewal."
            : "A credit for unused time on your current plan will be applied to your next invoice."}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 h-10 text-sm font-bold rounded-lg border border-[#ECECF2] text-[#8181A5] hover:text-[#1C1D21] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-10 text-sm font-bold rounded-lg text-white transition-colors ${
              isUpgrade
                ? "bg-[#2163E7] hover:bg-[#4B6FE0]"
                : "bg-[#F59E0B] hover:bg-[#D97706]"
            }`}
          >
            {isUpgrade ? `Upgrade to ${targetName}` : `Downgrade to ${targetName}`}
          </button>
        </div>
      </div>
    </div>
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

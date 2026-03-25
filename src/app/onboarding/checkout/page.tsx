"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSurveyStore } from "@/stores/survey-store";
import { Check, Shield, Clock, TrendingUp, BarChart3, PieChart } from "lucide-react";

/* ─── Project type display names ─── */

const PROJECT_TYPE_LABELS: Record<string, string> = {
  subscription: "Mobile App",
  ecommerce: "E-Commerce",
  saas: "SaaS B2B",
  marketplace: "Marketplace",
  foodtech: "FoodTech",
  traveltech: "TravelTech",
  gametech: "GameTech",
  fintech: "FinTech",
  healthtech: "HealthTech",
  edtech: "EdTech",
  proptech: "PropTech",
  "ai-ml": "AI / ML",
};

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
  const searchParams = useSearchParams();
  const { user, loading: authLoading, signUp } = useAuth();
  const { data: surveyData } = useSurveyStore();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [annual, setAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(
    searchParams.get("plan") === "pro" ? "pro" : "plus"
  );
  const [hydrated, setHydrated] = useState(false);

  // Registration fields (shown when not logged in)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = useSurveyStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    if (useSurveyStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Save survey to DB — retry until it works
  async function saveSurvey(): Promise<string | null> {
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch("/api/survey/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: surveyData, plan: selectedPlan }),
        });
        if (res.status === 401) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        const result = await res.json();
        if (res.ok && result.id) return result.id;
      } catch {
        // retry
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    return null;
  }

  // Create LS checkout URL — retry until it works
  async function createCheckout(surveyId: string | null): Promise<string> {
    const variantId = getVariantId(selectedPlan, annual);
    if (!variantId) throw new Error("Plan variant not configured");

    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch("/api/lemonsqueezy/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, plan: selectedPlan, surveyId: surveyId ?? "" }),
        });
        if (res.status === 401) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Checkout failed");
        if (!data.url) throw new Error("No checkout URL");
        return data.url;
      } catch (e) {
        if (i === 4) throw e;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    throw new Error("Failed to create checkout after retries");
  }

  // Single action: register (if needed) → save survey → create checkout → redirect
  async function handleStart() {
    setError("");
    setLoading(true);

    try {
      // Step 1: Register if not logged in
      if (!user) {
        if (!email || !password) {
          setError("Please fill in your email and password");
          setLoading(false);
          return;
        }
        setStatusText("Creating your account...");
        await signUp(email, password, displayName);
        // Wait for session cookie to propagate
        await new Promise((r) => setTimeout(r, 2000));
      }

      // Step 2: Save survey
      setStatusText("Saving your model...");
      const surveyId = surveyData.projectType ? await saveSurvey() : null;

      // Step 3: Create LS checkout
      setStatusText("Preparing checkout...");
      const checkoutUrl = await createCheckout(surveyId);

      // Step 4: Redirect to Lemon Squeezy
      setStatusText("Redirecting to payment...");
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setLoading(false);
      setStatusText("");
    }
  }

  const isLoggedIn = !!user;
  const plan = PLANS.find((p) => p.key === selectedPlan)!;
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const typeLabel = hydrated && surveyData.projectType
    ? PROJECT_TYPE_LABELS[surveyData.projectType] ?? surveyData.projectType
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="Revenue Map" className="w-10 h-10" width={40} height={40} />
        </div>

        <h1 className="text-2xl font-bold text-[#1C1D21] text-center mb-1">
          {isLoggedIn ? "Almost there!" : "Your model is ready — let's set you up"}
        </h1>
        <p className="text-sm text-[#8181A5] text-center mb-6">
          {isLoggedIn
            ? "Choose your plan and start your 10-day free trial"
            : "Create an account, pick a plan, and unlock your financial model"}
        </p>

        {/* Free trial banner */}
        <div className="flex items-center justify-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl px-4 py-3 mb-6">
          <Clock className="w-4 h-4 text-[#10B981] shrink-0" />
          <p className="text-sm font-bold text-[#10B981]">
            10 days free — no charge until day 11
          </p>
        </div>

        {/* Registration fields (inline, only when not logged in) */}
        {!isLoggedIn && !authLoading && (
          <div className="rounded-xl border border-[#ECECF2] bg-[#F8F8FC] p-5 mb-6">
            <h3 className="text-base font-bold text-[#1C1D21] mb-1">Create your account</h3>
            <p className="text-xs text-[#8181A5] mb-4">Quick signup to start your free trial</p>

            <div className="space-y-3">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
                className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors disabled:opacity-50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
                className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors disabled:opacity-50"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                required
                minLength={6}
                disabled={loading}
                className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors disabled:opacity-50"
              />
            </div>

            <p className="text-[10px] text-[#8181A5] text-center mt-3">
              Already have an account?{" "}
              <a href="/auth/login" className="text-[#2163E7] hover:underline">Sign in</a>
            </p>
          </div>
        )}

        {/* Personalized context block */}
        {typeLabel && (
          <div className="rounded-xl border border-[#ECECF2] bg-[#F8F8FC] p-4 mb-6">
            <p className="text-sm font-bold text-[#1C1D21] mb-3">
              Your {typeLabel} model will include:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { icon: TrendingUp, label: "Revenue projections" },
                { icon: BarChart3, label: "Unit economics" },
                { icon: PieChart, label: "CAC / LTV analysis" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-[#2163E7] shrink-0" />
                  <span className="text-xs font-bold text-[#4B5563]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-1 bg-white rounded-full border border-[#ECECF2] p-0.5">
            <button
              onClick={() => setAnnual(false)}
              disabled={loading}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                !annual ? "bg-[#2163E7] text-white" : "text-[#8181A5]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              disabled={loading}
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
                onClick={() => !loading && setSelectedPlan(p.key)}
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
            10 days free, then billed {annual ? "annually" : "monthly"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>
        )}

        {/* CTA — single button that does everything */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full h-12 text-sm font-bold rounded-xl bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-50"
        >
          {loading
            ? statusText || "Processing..."
            : isLoggedIn
              ? "Start Free Trial →"
              : "Create Account & Start Free Trial →"}
        </button>

        {/* Social proof + trust */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-[#8181A5]">
            <Shield className="w-3.5 h-3.5" />
            <span>Cancel anytime</span>
          </div>
          <div className="w-px h-3 bg-[#ECECF2]" />
          <div className="flex items-center gap-1.5 text-xs text-[#8181A5]">
            <Clock className="w-3.5 h-3.5" />
            <span>No charge for 10 days</span>
          </div>
        </div>

        <p className="text-xs text-[#8181A5] text-center mt-3">
          10 days free, then auto-renews. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

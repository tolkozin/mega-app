"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

/* ─── Inline registration form ─── */

function InlineRegisterForm({ onRegistered }: { onRegistered: () => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      // Small delay for auth state to propagate
      setTimeout(onRegistered, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#ECECF2] bg-[#F8F8FC] p-5 mb-6">
      <h3 className="text-base font-bold text-[#1C1D21] mb-1">Create your account</h3>
      <p className="text-xs text-[#8181A5] mb-4">Quick signup to start your free trial</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg mb-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-[#2163E7] hover:bg-[#4B6FE0] text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account & Continue"}
        </button>
      </form>

      <p className="text-[10px] text-[#8181A5] text-center mt-3">
        Already have an account?{" "}
        <a href="/auth/login" className="text-[#2163E7] hover:underline">Sign in</a>
      </p>
    </div>
  );
}

/* ─── Main page ─── */

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
  const { data: surveyData, plan: storePlan } = useSurveyStore();
  const [loading, setLoading] = useState(false);
  const [annual, setAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(
    searchParams.get("plan") === "pro" ? "pro" : "plus"
  );
  const [hydrated, setHydrated] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  const surveyIdFromUrl = searchParams.get("survey_id") ?? "";
  const [surveyId, setSurveyId] = useState(surveyIdFromUrl);

  useEffect(() => {
    const unsub = useSurveyStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    if (useSurveyStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Save survey to DB when user is available and we don't have a surveyId yet
  const savingRef = useRef(false);
  useEffect(() => {
    if (!user || surveyId || savingRef.current || !hydrated) return;
    if (!surveyData.projectType) return;

    savingRef.current = true;

    async function save() {
      try {
        const res = await fetch("/api/survey/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: surveyData, plan: selectedPlan }),
        });
        const result = await res.json();
        if (res.ok && result.id) {
          setSurveyId(result.id);
        }
      } catch {
        // Survey will be saved via webhook fallback
      }
    }

    save();
  }, [user, surveyId, hydrated, surveyData, selectedPlan]);

  async function handleStart() {
    if (!user) return; // Should not happen — form handles registration first

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

  const plan = PLANS.find((p) => p.key === selectedPlan)!;
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const typeLabel = hydrated && surveyData.projectType
    ? PROJECT_TYPE_LABELS[surveyData.projectType] ?? surveyData.projectType
    : null;

  const isLoggedIn = !!user;

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

        {/* Inline registration if not logged in */}
        {!isLoggedIn && !authLoading && (
          <InlineRegisterForm onRegistered={() => setJustRegistered(true)} />
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
            10 days free, then billed {annual ? "annually" : "monthly"}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={loading || !isLoggedIn}
          className="w-full h-12 text-sm font-bold rounded-xl bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Redirecting..." : !isLoggedIn ? "Create account above to continue" : "Start Free Trial →"}
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

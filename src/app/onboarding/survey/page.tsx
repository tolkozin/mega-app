"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSurveyStore } from "@/stores/survey-store";
import type { SurveyData } from "@/lib/survey-types";
import {
  TOTAL_STEPS,
  INDUSTRY_OPTIONS,
  MONETIZATION_OPTIONS,
  ACQUISITION_OPTIONS,
} from "@/lib/survey-types";
import {
  Smartphone,
  ShoppingCart,
  Cloud,
  Store,
  UtensilsCrossed,
  Plane,
  Gamepad2,
  Landmark,
  HeartPulse,
  GraduationCap,
  Building2,
  Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Animation variants ─── */

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

/* ─── Reusable UI ─── */

function RadioCard({
  selected,
  onClick,
  icon,
  iconComponent: IconComponent,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: string;
  iconComponent?: LucideIcon;
  label: string;
  description?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? "border-[#2163E7] bg-[#2163E7]/5"
          : "border-[#ECECF2] hover:border-[#2163E7]/40"
      }`}
    >
      <div className="flex items-center gap-3">
        {IconComponent && <IconComponent className="w-5 h-5 text-[#2163E7]" />}
        {icon && !IconComponent && <span className="text-xl">{icon}</span>}
        <div>
          <p className="font-bold text-sm text-[#1C1D21]">{label}</p>
          {description && (
            <p className="text-xs text-[#8181A5] mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
}

function CheckboxCard({
  checked,
  onClick,
  icon,
  label,
}: {
  checked: boolean;
  onClick: () => void;
  icon?: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
        checked
          ? "border-[#2163E7] bg-[#2163E7]/5"
          : "border-[#ECECF2] hover:border-[#2163E7]/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
            checked
              ? "border-[#2163E7] bg-[#2163E7]"
              : "border-[#ECECF2]"
          }`}
        >
          {checked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-sm font-bold text-[#1C1D21]">{label}</span>
      </div>
    </button>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-[#1C1D21]">{title}</h2>
      {subtitle && <p className="text-sm text-[#8181A5] mt-1">{subtitle}</p>}
    </div>
  );
}

/* ─── Steps ─── */

function Step1() {
  const { data, update } = useSurveyStore();
  const options: { key: SurveyData["projectType"] & string; icon: LucideIcon; label: string; description: string }[] = [
    { key: "subscription", icon: Smartphone, label: "Subscription App", description: "Subscription-based mobile application" },
    { key: "ecommerce", icon: ShoppingCart, label: "E-Commerce", description: "Online store selling physical or digital goods" },
    { key: "saas", icon: Cloud, label: "SaaS B2B", description: "Cloud software for businesses" },
    { key: "marketplace", icon: Store, label: "Marketplace", description: "Platform connecting buyers and sellers" },
    { key: "foodtech", icon: UtensilsCrossed, label: "FoodTech", description: "Food delivery, meal kits, or cloud kitchens" },
    { key: "traveltech", icon: Plane, label: "TravelTech", description: "Travel booking and experiences" },
    { key: "gametech", icon: Gamepad2, label: "GameTech", description: "Games, esports, or gaming tools" },
    { key: "fintech", icon: Landmark, label: "FinTech", description: "Payments, lending, or financial services" },
    { key: "healthtech", icon: HeartPulse, label: "HealthTech", description: "Healthcare and wellness technology" },
    { key: "edtech", icon: GraduationCap, label: "EdTech", description: "Education and learning platforms" },
    { key: "proptech", icon: Building2, label: "PropTech", description: "Real estate and property technology" },
    { key: "ai-ml", icon: Brain, label: "AI / ML", description: "AI platforms, APIs, or data analytics" },
  ];
  return (
    <>
      <StepHeader title="What are you building?" subtitle="This helps us set up the right financial model for you" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((o) => (
          <RadioCard
            key={o.key}
            selected={data.projectType === o.key}
            onClick={() => update({ projectType: o.key, industry: "", industryCustom: "" })}
            iconComponent={o.icon}
            label={o.label}
            description={o.description}
          />
        ))}
      </div>
    </>
  );
}

function Step2() {
  const { data, update } = useSurveyStore();
  const options = INDUSTRY_OPTIONS[data.projectType ?? "saas"] ?? [];
  const isOther = data.industry === "Other";
  return (
    <>
      <StepHeader title="What's your industry / niche?" subtitle="We'll use market benchmarks specific to your space" />
      <div className="space-y-3">
        {options.map((o) => (
          <RadioCard key={o} selected={data.industry === o} onClick={() => update({ industry: o, industryCustom: "" })} label={o} />
        ))}
        <RadioCard
          selected={isOther}
          onClick={() => update({ industry: "Other" })}
          label="Other"
        />
        {isOther && (
          <input
            autoFocus
            className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] mt-1"
            placeholder="Describe your niche"
            value={data.industryCustom}
            onChange={(e) => update({ industryCustom: e.target.value })}
          />
        )}
      </div>
    </>
  );
}

function Step3() {
  const { data, update } = useSurveyStore();
  const options = [
    { key: "idea", icon: "💡", label: "Just an idea — haven't started yet" },
    { key: "building", icon: "🔨", label: "Building — working on it, no customers yet" },
    { key: "launched", icon: "🚀", label: "Just launched — first customers coming in" },
    { key: "growing", icon: "📈", label: "Growing — have paying customers already" },
  ];
  return (
    <>
      <StepHeader title="Where are you right now?" subtitle="Be honest — it helps us give you realistic projections" />
      <div className="space-y-3">
        {options.map((o) => (
          <RadioCard
            key={o.key}
            selected={data.stage === o.key}
            onClick={() => update({ stage: o.key as typeof data.stage })}
            icon={o.icon}
            label={o.label}
          />
        ))}
      </div>
    </>
  );
}

function Step4() {
  const { data, update } = useSurveyStore();
  const toggle = (val: string) => {
    const current = data.monetization;
    if (val === "I'm not sure yet") {
      update({ monetization: current.includes(val) ? [] : [val] });
      return;
    }
    const without = current.filter((v) => v !== "I'm not sure yet");
    update({
      monetization: without.includes(val)
        ? without.filter((v) => v !== val)
        : [...without, val],
    });
  };
  const notSure = data.monetization.includes("I'm not sure yet");
  return (
    <>
      <StepHeader title="How will you make money?" subtitle="Select all that apply" />
      <div className="space-y-3">
        {MONETIZATION_OPTIONS.map((o) => (
          <CheckboxCard
            key={o}
            checked={data.monetization.includes(o)}
            onClick={() => toggle(o)}
            label={o}
          />
        ))}
      </div>
      {notSure && (
        <p className="mt-3 text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-2 rounded-lg">
          No worries — our AI will suggest the best model for your type of business.
        </p>
      )}
    </>
  );
}

function Step5() {
  const { data, update } = useSurveyStore();
  const options = [
    { key: "b2c", icon: "👤", label: "Individual consumers (B2C)" },
    { key: "b2b_smb", icon: "🏢", label: "Small businesses (B2B SMB)" },
    { key: "b2b_enterprise", icon: "🏛️", label: "Mid-size or enterprise companies (B2B)" },
    { key: "both", icon: "👥", label: "Both B2B and B2C" },
    { key: "not_sure", icon: "", label: "Not sure yet" },
  ];
  return (
    <>
      <StepHeader title="Who is your customer?" />
      <div className="space-y-3">
        {options.map((o) => (
          <RadioCard
            key={o.key}
            selected={data.customerType === o.key}
            onClick={() => update({ customerType: o.key })}
            icon={o.icon || undefined}
            label={o.label}
          />
        ))}
      </div>
    </>
  );
}

function Step6() {
  const { data, update } = useSurveyStore();
  const options = [
    "Under $10 / month (or per order)",
    "$10 – $50",
    "$50 – $200",
    "$200 – $1,000",
    "$1,000+",
    "Haven't decided yet",
    "Something else",
  ];
  const isOther = data.pricePoint === "Something else";
  return (
    <>
      <StepHeader title="How much will you charge per customer?" subtitle="Your average price per month or per order — approximate is fine" />
      <div className="space-y-3">
        {options.map((o) => (
          <RadioCard
            key={o}
            selected={data.pricePoint === o}
            onClick={() => update({ pricePoint: o, pricePointCustom: "" })}
            label={o}
          />
        ))}
        {isOther && (
          <input
            autoFocus
            className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] mt-1"
            placeholder="Tell us more about your pricing idea"
            value={data.pricePointCustom}
            onChange={(e) => update({ pricePointCustom: e.target.value })}
          />
        )}
      </div>
    </>
  );
}

function Step7() {
  const { data, update } = useSurveyStore();
  const toggle = (val: string) => {
    const current = data.acquisitionChannels;
    if (val === "Not sure yet") {
      update({ acquisitionChannels: current.includes(val) ? [] : [val] });
      return;
    }
    const without = current.filter((v) => v !== "Not sure yet");
    update({
      acquisitionChannels: without.includes(val)
        ? without.filter((v) => v !== val)
        : [...without, val],
    });
  };
  return (
    <>
      <StepHeader title="How do you plan to acquire customers?" subtitle="Select your main channels" />
      <div className="space-y-3">
        {ACQUISITION_OPTIONS.map((o) => (
          <CheckboxCard
            key={o.label}
            checked={data.acquisitionChannels.includes(o.label)}
            onClick={() => toggle(o.label)}
            icon={o.icon || undefined}
            label={o.label}
          />
        ))}
      </div>
    </>
  );
}

function Step8() {
  const { data, update } = useSurveyStore();
  const options = [
    "Bootstrapping — no budget yet",
    "Under $500",
    "$500 – $2,000",
    "$2,000 – $10,000",
    "$10,000 – $50,000",
    "$50,000+",
    "Something else",
  ];
  const isOther = data.budget === "Something else";
  return (
    <>
      <StepHeader title="What's your starting budget?" subtitle="This helps us model realistic growth assumptions" />
      <div className="space-y-3">
        {options.map((o) => (
          <RadioCard
            key={o}
            selected={data.budget === o}
            onClick={() => update({ budget: o, budgetCustom: "" })}
            label={o}
          />
        ))}
        {isOther && (
          <input
            autoFocus
            className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] mt-1"
            placeholder="Tell us about your budget"
            value={data.budgetCustom}
            onChange={(e) => update({ budgetCustom: e.target.value })}
          />
        )}
      </div>
    </>
  );
}

function Step9() {
  const { data, update } = useSurveyStore();
  const options = [
    { key: "first_1k", icon: "💰", label: "Earn my first $1,000 in revenue" },
    { key: "10k_month", icon: "🎯", label: "Reach $10K / month" },
    { key: "validate", icon: "📊", label: "Validate if my idea is financially viable" },
    { key: "investors", icon: "🤝", label: "Attract investors or co-founders" },
    { key: "full_time", icon: "🚪", label: "Replace my salary and go full-time" },
    { key: "other", icon: "", label: "Something else" },
  ];
  const isOther = data.goal === "other";
  return (
    <>
      <StepHeader title="What's your main goal for the next 12 months?" subtitle="This shapes what your AI assistant focuses on" />
      <div className="space-y-3">
        {options.map((o) => (
          <RadioCard
            key={o.key}
            selected={data.goal === o.key}
            onClick={() => update({ goal: o.key, goalCustom: "" })}
            icon={o.icon || undefined}
            label={o.label}
          />
        ))}
        {isOther && (
          <input
            autoFocus
            className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7] mt-1"
            placeholder="Tell us about your goal"
            value={data.goalCustom}
            onChange={(e) => update({ goalCustom: e.target.value })}
          />
        )}
      </div>
    </>
  );
}

const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9];

/* ─── Validation: is "Continue" active? ─── */

function canContinue(step: number, data: SurveyData): boolean {
  switch (step) {
    case 0: return data.projectType !== null;
    case 1: return data.industry !== "" && (data.industry !== "Other" || data.industryCustom.trim() !== "");
    case 2: return data.stage !== null;
    case 3: return data.monetization.length > 0;
    case 4: return data.customerType !== "";
    case 5: return data.pricePoint !== "" && (data.pricePoint !== "Something else" || data.pricePointCustom.trim() !== "");
    case 6: return data.acquisitionChannels.length > 0;
    case 7: return data.budget !== "" && (data.budget !== "Something else" || data.budgetCustom.trim() !== "");
    case 8: return data.goal !== "" && (data.goal !== "other" || data.goalCustom.trim() !== "");
    default: return false;
  }
}

/* ─── Main page ─── */

export default function SurveyPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center"><p className="text-sm text-[#8181A5]">Loading...</p></div>}>
      <SurveyPage />
    </Suspense>
  );
}

function SurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const store = useSurveyStore();
  const { step, direction, data, plan, next, back, setPlan, reset } = store;
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist hydration before reading store values
  useEffect(() => {
    // Zustand persist stores expose onFinishHydration on the persist API
    const unsub = useSurveyStore.persist.onFinishHydration(() => setHydrated(true));
    // If already hydrated (e.g. hot reload), set immediately
    if (useSurveyStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Read plan from URL on mount
  useEffect(() => {
    const p = searchParams.get("plan");
    if (p === "plus" || p === "pro") setPlan(p);
  }, [searchParams, setPlan]);

  // Auto-submit: user came back from registration with a completed survey draft
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  useEffect(() => {
    if (!hydrated || autoSubmitted || authLoading || !user || saving) return;
    // Survey is filled if user was on the last step and projectType is set
    const isSurveyFilled = step === TOTAL_STEPS - 1 && data.projectType !== null;
    if (isSurveyFilled) {
      setAutoSubmitted(true);
      handleFinish();
    }
  }, [hydrated, authLoading, user, step, data.projectType]); // eslint-disable-line react-hooks/exhaustive-deps

  const StepComponent = STEPS[step];
  const isLast = step === TOTAL_STEPS - 1;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  async function handleFinish() {
    // If not logged in, save draft to store and redirect to register
    if (!user) {
      router.push(`/auth/register?plan=${plan}`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/survey/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: data, plan }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save");
      // Reset store and redirect to checkout
      router.push(`/onboarding/checkout?plan=${plan}&survey_id=${result.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save survey");
    } finally {
      setSaving(false);
    }
  }

  // Show loading while auto-submitting after registration
  if (autoSubmitted && saving) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-[#ECECF2] border-t-[#2163E7] rounded-full animate-spin" />
        <p className="text-sm text-[#8181A5]">Saving your answers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[#ECECF2]">
        <div
          className="h-full bg-[#2163E7] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Logo */}
      <div className="px-6 pt-5 pb-2">
        <img src="/logo.svg" alt="Revenue Map" className="w-8 h-8" />
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-[#ECECF2] px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="h-10 px-4 text-sm font-bold text-[#8181A5] hover:text-[#1C1D21] transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            &larr; Back
          </button>

          <span className="text-xs text-[#8181A5]">
            {step + 1} / {TOTAL_STEPS}
          </span>

          {isLast ? (
            <button
              onClick={handleFinish}
              disabled={!canContinue(step, data) || saving}
              className="h-10 px-6 text-sm font-bold rounded-lg bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "See My Financial Projection →"}
            </button>
          ) : (
            <button
              onClick={next}
              disabled={!canContinue(step, data)}
              className="h-10 px-6 text-sm font-bold rounded-lg bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

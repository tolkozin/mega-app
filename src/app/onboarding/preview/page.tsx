"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSurveyStore } from "@/stores/survey-store";
import type { SurveyData } from "@/lib/survey-types";
import { Lock, TrendingUp, Target, BarChart3, PieChart, ArrowRight } from "lucide-react";

/* ─── Project type display names ─── */

const PROJECT_TYPE_LABELS: Record<string, string> = {
  subscription: "Mobile App",
  ecommerce: "E-Commerce",
  saas: "SaaS",
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

/* ─── Goal display text ─── */

const GOAL_LABELS: Record<string, string> = {
  first_1k: "Earn your first $1,000",
  "10k_month": "Reach $10K/month",
  validate: "Validate financial viability",
  investors: "Attract investors",
  full_time: "Go full-time",
  other: "Hit your custom goal",
};

/* ─── Personalized feature bullets ─── */

function getFeatureBullets(data: SurveyData): { icon: typeof TrendingUp; text: string }[] {
  const bullets: { icon: typeof TrendingUp; text: string }[] = [
    { icon: TrendingUp, text: "3-year revenue projection" },
    { icon: BarChart3, text: "Monthly cash flow breakdown" },
    { icon: PieChart, text: "CAC / LTV analysis" },
  ];

  if (data.goal && data.goal !== "other") {
    bullets.push({
      icon: Target,
      text: `Goal tracking: ${GOAL_LABELS[data.goal] ?? data.goal}`,
    });
  } else if (data.goalCustom) {
    bullets.push({
      icon: Target,
      text: `Goal tracking: ${data.goalCustom}`,
    });
  }

  return bullets;
}

/* ─── Fake dashboard chart bars (CSS-only) ─── */

function MockDashboard() {
  const barHeights = [40, 55, 48, 65, 72, 60, 80, 90, 85, 95, 100, 110];
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-white border border-[#ECECF2] shadow-lg">
      {/* Mock header */}
      <div className="px-5 py-3 border-b border-[#ECECF2] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2163E7]/30" />
          <div className="w-24 h-3 rounded-full bg-[#ECECF2]" />
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-6 rounded-md bg-[#ECECF2]" />
          <div className="w-16 h-6 rounded-md bg-[#ECECF2]" />
        </div>
      </div>

      {/* Mock KPI row */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {["$127K", "$8.4K", "3.2x"].map((val, i) => (
          <div key={i} className="bg-[#F8F8FC] rounded-lg p-3">
            <div className="w-16 h-2 rounded bg-[#ECECF2] mb-2" />
            <p className="text-lg font-extrabold text-[#1C1D21]">{val}</p>
          </div>
        ))}
      </div>

      {/* Mock bar chart */}
      <div className="px-5 pb-5">
        <div className="flex items-end gap-1.5 h-28">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-[#2163E7]/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {["Jan", "Apr", "Jul", "Oct"].map((m) => (
            <span key={m} className="text-[10px] text-[#8181A5]">{m}</span>
          ))}
        </div>
      </div>

      {/* Blur + lock overlay */}
      <div className="absolute inset-0 backdrop-blur-[6px] bg-white/40 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
          <Lock className="w-6 h-6 text-[#2163E7]" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */

export default function PreviewPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center">
          <p className="text-sm text-[#8181A5]">Loading...</p>
        </div>
      }
    >
      <PreviewPage />
    </Suspense>
  );
}

function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { data, plan } = useSurveyStore();
  const [hydrated, setHydrated] = useState(false);

  const surveyId = searchParams.get("survey_id") ?? "";

  useEffect(() => {
    const unsub = useSurveyStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    if (useSurveyStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Redirect to survey if no project type selected
  useEffect(() => {
    if (hydrated && !data.projectType) {
      router.push("/onboarding/survey");
    }
  }, [hydrated, data.projectType, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  if (!hydrated || authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#ECECF2] border-t-[#2163E7] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data.projectType) return null;

  const typeLabel = PROJECT_TYPE_LABELS[data.projectType] ?? data.projectType;
  const bullets = getFeatureBullets(data);

  function handleUnlock() {
    const params = new URLSearchParams();
    params.set("plan", plan);
    if (surveyId) params.set("survey_id", surveyId);
    router.push(`/onboarding/checkout?${params.toString()}`);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-5 pb-2">
        <img
          src="/logo.svg"
          alt="Revenue Map"
          className="w-8 h-8"
          width={32}
          height={32}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Headline */}
          <h1 className="text-2xl font-bold text-[#1C1D21] text-center mb-2">
            Your {typeLabel} financial model is ready&nbsp;to&nbsp;unlock
          </h1>
          <p className="text-sm text-[#8181A5] text-center mb-8">
            We built a personalized projection based on your answers
          </p>

          {/* Mock dashboard */}
          <div className="mb-8">
            <MockDashboard />
          </div>

          {/* Personalized bullets */}
          <div className="space-y-3 mb-8">
            {bullets.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2163E7]/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-4 h-4 text-[#2163E7]" />
                </div>
                <span className="text-sm font-bold text-[#1C1D21]">
                  {b.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleUnlock}
            className="w-full h-12 text-sm font-bold rounded-xl bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors flex items-center justify-center gap-2"
          >
            Unlock Your Model — Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-[#8181A5] text-center mt-3">
            10 days free, then from ${plan === "pro" ? "49" : "29"}/mo. Cancel
            anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

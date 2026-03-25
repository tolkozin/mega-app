"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSurveyStore } from "@/stores/survey-store";

const STEPS = [
  "Analyzing your business type",
  "Applying industry benchmarks",
  "Building revenue projections",
  "Calculating unit economics",
  "Preparing your dashboard",
];

export default function GeneratingPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#ECECF2] border-t-[#2163E7] rounded-full animate-spin" />
        </div>
      }
    >
      <GeneratingPage />
    </Suspense>
  );
}

function GeneratingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, plan } = useSurveyStore();
  const [activeStep, setActiveStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [surveyId, setSurveyId] = useState(searchParams.get("survey_id") ?? "");
  const [hydrated, setHydrated] = useState(false);
  const saveCalledRef = useRef(false);
  const autoCheckout = searchParams.get("auto") === "1";
  const supabase = useRef(createClient()).current;

  // Wait for Zustand hydration
  useEffect(() => {
    const unsub = useSurveyStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    if (useSurveyStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Animate progress steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Save survey — poll for auth session directly (no useAuth dependency)
  const saveSurvey = useCallback(async () => {
    // Try up to 8 times over ~12 seconds for auth to settle
    for (let i = 0; i < 8; i++) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Auth not ready yet — wait and retry
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        const res = await fetch("/api/survey/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: data, plan }),
        });
        const result = await res.json();
        if (res.status === 401) {
          // Session exists but server doesn't see it yet — retry
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        if (!res.ok) throw new Error(result.error || "Failed to save");
        setSurveyId(result.id);
        setSaved(true);
        return;
      } catch (e) {
        if (i < 7) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        console.error("Failed to save survey after retries:", e);
        // Proceed anyway — survey can be saved later
        setSaved(true);
      }
    }
    // If we exhausted retries without saving, still proceed
    setSaved(true);
  }, [data, plan, supabase]);

  useEffect(() => {
    if (!hydrated || saveCalledRef.current) return;
    if (!data.projectType) {
      router.replace("/onboarding/survey");
      return;
    }
    if (surveyId) {
      setSaved(true);
      return;
    }

    saveCalledRef.current = true;
    saveSurvey();
  }, [hydrated, data.projectType, surveyId, router, saveSurvey]);

  // When animation is done AND survey is saved, redirect to checkout
  useEffect(() => {
    if (saved && activeStep === STEPS.length - 1) {
      const timer = setTimeout(() => {
        const params = new URLSearchParams();
        params.set("plan", plan);
        if (surveyId) params.set("survey_id", surveyId);
        if (autoCheckout) params.set("auto", "1");
        router.push(`/onboarding/checkout?${params.toString()}`);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [saved, activeStep, plan, surveyId, autoCheckout, router]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <img
            src="/logo.svg"
            alt="Revenue Map"
            className="w-10 h-10"
            width={40}
            height={40}
          />
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-3 border-[#ECECF2] border-t-[#2163E7] rounded-full animate-spin" />
        </div>

        <h2 className="text-xl font-bold text-[#1C1D21] mb-2">
          Building your financial model...
        </h2>
        <p className="text-sm text-[#8181A5] mb-8">
          This takes just a few seconds
        </p>

        <div className="space-y-3 text-left max-w-xs mx-auto">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              {i < activeStep ? (
                <div className="w-5 h-5 rounded-full bg-[#14A660] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : i === activeStep ? (
                <div className="w-5 h-5 border-2 border-[#2163E7] border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[#ECECF2] shrink-0" />
              )}
              <span
                className={`text-sm transition-colors ${
                  i <= activeStep
                    ? "text-[#1C1D21] font-bold"
                    : "text-[#8181A5]"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

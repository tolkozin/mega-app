"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, loading: authLoading } = useAuth();
  const { data, plan, reset } = useSurveyStore();
  const [activeStep, setActiveStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [surveyId, setSurveyId] = useState(searchParams.get("survey_id") ?? "");
  const [hydrated, setHydrated] = useState(false);
  const saveCalledRef = useRef(false);
  // If plan came from pricing page URL, auto-start LS checkout after generating
  const autoCheckout = searchParams.get("auto") === "1";

  // Wait for Zustand hydration
  useEffect(() => {
    const unsub = useSurveyStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    if (useSurveyStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Animate progress steps — each step takes ~1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Save survey to DB — retry until auth settles (user just registered)
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
    // Wait for auth to settle — user may have just registered
    if (authLoading) return;

    saveCalledRef.current = true;

    async function saveSurvey(retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch("/api/survey/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: data, plan }),
          });
          const result = await res.json();
          if (res.status === 401 && i < retries - 1) {
            // Auth not settled yet — wait and retry
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          if (!res.ok) throw new Error(result.error || "Failed to save");
          setSurveyId(result.id);
          setSaved(true);
          return;
        } catch (e) {
          if (i < retries - 1) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          console.error("Failed to save survey:", e);
          setSaved(true); // Still proceed
        }
      }
    }

    saveSurvey();
  }, [hydrated, authLoading, data, plan, surveyId, router]);

  // When animation is done AND survey is saved, redirect to checkout
  useEffect(() => {
    if (saved && activeStep === STEPS.length - 1) {
      const timer = setTimeout(() => {
        const params = new URLSearchParams();
        params.set("plan", plan);
        if (surveyId) params.set("survey_id", surveyId);
        if (autoCheckout) params.set("auto", "1");
        router.push(`/onboarding/checkout?${params.toString()}`);
      }, 1200); // Small delay after last step completes
      return () => clearTimeout(timer);
    }
  }, [saved, activeStep, plan, surveyId, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.svg"
            alt="Revenue Map"
            className="w-10 h-10"
            width={40}
            height={40}
          />
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-3 border-[#ECECF2] border-t-[#2163E7] rounded-full animate-spin" />
        </div>

        <h2 className="text-xl font-bold text-[#1C1D21] mb-2">
          Building your financial model...
        </h2>
        <p className="text-sm text-[#8181A5] mb-8">
          This takes just a few seconds
        </p>

        {/* Progress steps */}
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

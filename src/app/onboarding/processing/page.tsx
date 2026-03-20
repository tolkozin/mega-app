"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
// Survey store is read by the dashboard page to apply presets

const PROGRESS_STEPS = [
  "Analyzing your business type",
  "Applying market benchmarks",
  "Building your projections",
  "Preparing your dashboard",
];

export default function ProcessingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-[#8181A5]">Loading...</p></div>}>
      <ProcessingPage />
    </Suspense>
  );
}

function ProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  // Survey store is NOT reset here — the dashboard reads it to apply industry presets
  const [activeStep, setActiveStep] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const surveyId = searchParams.get("survey_id") ?? "";

  // Animate progress steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Poll for project creation
  useEffect(() => {
    if (!user || !surveyId) return;

    async function poll() {
      try {
        const res = await fetch(`/api/survey/status?id=${surveyId}`);
        const data = await res.json();
        if (data.status === "completed" && data.projectId) {
          clearInterval(pollRef.current);
          clearTimeout(timeoutRef.current);
          // Don't reset survey here — dashboard reads it to apply industry presets
          const productType = data.productType ?? "subscription";
          router.push(`/dashboard/${productType}?from=onboarding`);
        }
      } catch {
        // Silently retry
      }
    }

    pollRef.current = setInterval(poll, 2000);
    poll(); // Check immediately

    // Timeout after 60 seconds
    timeoutRef.current = setTimeout(() => {
      clearInterval(pollRef.current);
      setTimedOut(true);
    }, 60000);

    return () => {
      clearInterval(pollRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [user, surveyId, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#8181A5]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="Revenue Map" className="w-10 h-10" />
        </div>

        {timedOut ? (
          <>
            <h2 className="text-xl font-bold text-[#1C1D21] mb-2">
              Taking longer than expected
            </h2>
            <p className="text-sm text-[#8181A5] mb-6">
              Your payment was received. Check your email or try refreshing.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="h-10 text-sm font-bold rounded-lg bg-[#2163E7] hover:bg-[#4B6FE0] text-white transition-colors"
              >
                Go to Dashboard
              </button>
              <a
                href="mailto:support@revenuemap.app"
                className="text-sm text-[#2163E7] hover:text-[#4B6FE0] font-bold"
              >
                Contact support@revenuemap.app
              </a>
            </div>
          </>
        ) : (
          <>
            {/* Spinner */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-10 border-3 border-[#ECECF2] border-t-[#2163E7] rounded-full animate-spin" />
            </div>

            <h2 className="text-xl font-bold text-[#1C1D21] mb-6">
              Setting up your financial model...
            </h2>

            {/* Progress steps */}
            <div className="space-y-3 text-left max-w-xs mx-auto">
              {PROGRESS_STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  {i < activeStep ? (
                    <div className="w-5 h-5 rounded-full bg-[#14A660] flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : i === activeStep ? (
                    <div className="w-5 h-5 border-2 border-[#2163E7] border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#ECECF2] shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      i <= activeStep ? "text-[#1C1D21] font-bold" : "text-[#8181A5]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

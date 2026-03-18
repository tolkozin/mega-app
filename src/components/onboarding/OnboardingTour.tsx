"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ONBOARDING_KEY = "onboarding_completed";

interface TourStep {
  title: string;
  description: string;
  icon: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Revenue Map!",
    description: "Let's take a quick tour of the key features. This will take less than a minute.",
    icon: "👋",
  },
  {
    title: "Create a Project",
    description: "Click the \"+\" button in the sidebar to create your first financial model. Choose from Subscription, E-commerce, or SaaS B2B.",
    icon: "📁",
  },
  {
    title: "Configure Your Assumptions",
    description: "Fill in your business parameters — pricing, growth, churn, costs. Don't worry about getting everything perfect right away.",
    icon: "⚙️",
  },
  {
    title: "Let AI Fill the Gaps",
    description: "Open the AI Assistant and ask it to fill in missing parameters based on market benchmarks for your industry. It knows the data so you don't have to guess.",
    icon: "🤖",
  },
  {
    title: "Run Scenarios",
    description: "Create multiple scenarios (optimistic, base, pessimistic) to stress-test your model. Compare them side by side to understand your range of outcomes.",
    icon: "📊",
  },
  {
    title: "Chat with Your Data",
    description: "Ask the AI anything about your model — \"Is my churn rate healthy?\", \"When do I break even?\", \"What's my LTV:CAC ratio?\" It gives honest answers based on real benchmarks.",
    icon: "💬",
  },
  {
    title: "Generate Investor Reports",
    description: "One click to generate a professional PDF report with your projections, unit economics, and scenario analysis. Ready to send to investors or your team.",
    icon: "📄",
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setVisible(true);
    }
  }, []);

  function handleNext() {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  }

  function handleSkip() {
    handleComplete();
  }

  function handleComplete() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  const current = tourSteps[step];
  const isLast = step === tourSteps.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-[#ECECF2]">
          <div
            className="h-full bg-[#5E81F4] transition-all duration-300"
            style={{ width: `${((step + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="text-4xl mb-4">{current.icon}</div>

          {/* Step counter */}
          <p className="text-xs font-bold text-[#8181A5] uppercase tracking-wider mb-2">
            {isFirst ? "Getting Started" : `Step ${step} of ${tourSteps.length - 1}`}
          </p>

          {/* Title */}
          <h2 className="text-xl font-bold text-[#1C1D21] mb-3">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-[#8181A5] leading-relaxed mb-8">
            {current.description}
          </p>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step
                    ? "bg-[#5E81F4] w-6"
                    : i < step
                    ? "bg-[#5E81F4]/40"
                    : "bg-[#ECECF2]"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 h-10 text-sm font-bold text-[#8181A5] hover:text-[#1C1D21] rounded-lg border border-[#ECECF2] hover:border-[#5E81F4] transition-colors"
            >
              {isFirst ? "Skip tour" : "Skip"}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 h-10 text-sm font-bold text-white bg-[#5E81F4] hover:bg-[#4B6FE0] rounded-lg transition-colors"
            >
              {isFirst ? "Let's go!" : isLast ? "Get started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

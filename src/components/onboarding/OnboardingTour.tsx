"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";

/* ─── Tour step definition ─── */
interface TourStep {
  target?: string; // data-tour attribute value; omit for full-overlay welcome
  title: string;
  description: string;
  icon: React.ReactNode;
  scrollIntoView?: boolean;
  beforeShow?: () => void;
}

const STORAGE_KEY = "rm_onboarding_done";

/* ─── Icons ─── */
const IconRocket = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2163E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11.95A22.18 22.18 0 0112 15z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3" />
  </svg>
);
const IconChat = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2163E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L14.09 8.26L21 9.27L16 13.14L16.18 20.02L12 17.77L7.82 20.02L8 13.14L3 9.27L9.91 8.26L12 2Z" />
  </svg>
);
const IconConfig = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2163E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconSave = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2163E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const IconMetrics = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2163E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const IconChart = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2163E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconSwitch = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2163E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);
const IconCalendar = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2163E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ─── Tour steps ─── */
const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Your Dashboard",
    description:
      "Your financial model is ready! It's built from your survey answers and real market data. Let's quickly show you how everything works.",
    icon: IconRocket,
  },
  {
    target: "ai-chat",
    title: "AI Assistant",
    description:
      'The AI assistant knows your model inside out. Ask questions like "What\'s my break-even?" or describe changes in plain English. You can also upload a CSV — the assistant will extract parameters automatically.',
    icon: IconChat,
  },
  {
    target: "config-sidebar",
    title: "Model Configuration",
    description:
      "All your model parameters live here — budgets, conversions, pricing, growth rates. They're split into 3 growth phases: Launch, Scale, and Maturity. Every change instantly recalculates all charts.",
    icon: IconConfig,
    scrollIntoView: true,
  },
  {
    target: "scenario-panel",
    title: "Save & Compare Scenarios",
    description:
      'Save your current configuration as a named scenario and compare different strategies side by side. Click "Save" to snapshot your model, or "New" to start a fresh scenario.',
    icon: IconSave,
    scrollIntoView: true,
  },
  {
    target: "kpi-metrics",
    title: "Key Metrics",
    description:
      "Your key performance indicators at a glance with color-coded health status: green = good, yellow = caution, red = problem. Mini sparklines show the trend over the entire period.",
    icon: IconMetrics,
    scrollIntoView: true,
  },
  {
    target: "main-chart",
    title: "Interactive Charts",
    description:
      "Charts show base, optimistic, and pessimistic scenarios. Hover or tap any point for detailed numbers. All charts update in real time when you change configuration parameters.",
    icon: IconChart,
    scrollIntoView: true,
  },
  {
    target: "model-selector",
    title: "12 Business Models",
    description:
      "Choose from 12 business models — Mobile App, E-Commerce, SaaS, Marketplace, FinTech, AI/ML, and more. Each model has unique metrics, charts, and parameters. You can also switch the calculation engine within a model for different monetization strategies.",
    icon: IconSwitch,
    scrollIntoView: true,
  },
  {
    target: "date-range",
    title: "Date Range Filter",
    description:
      "Filter the display period — select a range of months to focus on a specific time window. The phase timeline in the config sidebar will automatically adjust to match.",
    icon: IconCalendar,
    scrollIntoView: true,
  },
];

/* ─── Spotlight + card positions ─── */
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function scrollTargetIntoView(target: string): Promise<void> {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return Promise.resolve();
  return new Promise((resolve) => {
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    setTimeout(resolve, 400);
  });
}

/* ─── Component ─── */
export function OnboardingTour({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const isMobile = useIsMobile();
  const rafRef = useRef(0);

  // Check if tour already completed
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Small delay to let dashboard render
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Update spotlight rect on step change + resize
  const updateRect = useCallback(async () => {
    const s = TOUR_STEPS[step];
    if (!s?.target) {
      setRect(null);
      return;
    }
    if (s.scrollIntoView) {
      await scrollTargetIntoView(s.target);
    }
    setRect(getTargetRect(s.target));
  }, [step]);

  useEffect(() => {
    if (!visible) return;
    updateRect();

    // Re-measure on resize/scroll
    const handler = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const s = TOUR_STEPS[step];
        if (s?.target) setRect(getTargetRect(s.target));
      });
    };
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, step, updateRect]);

  const finish = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
    onComplete?.();
  }, [onComplete]);

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  }, [step, finish]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const total = TOUR_STEPS.length;
  const padding = 8;

  // Card position relative to spotlight
  const cardStyle = (): React.CSSProperties => {
    if (typeof window === "undefined") return { position: "fixed", top: 0, left: 0 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardW = Math.min(380, vw - 32);
    const cardH = 260; // approximate card height

    // No spotlight (welcome) or mobile without spotlight → center of screen
    if (!rect) {
      return {
        position: "fixed",
        top: Math.max(16, (vh - cardH) / 2),
        left: Math.max(16, (vw - cardW) / 2),
      };
    }

    // Mobile with spotlight → bottom of screen
    if (isMobile) {
      return {
        position: "fixed",
        bottom: 16,
        left: Math.max(16, (vw - cardW) / 2),
      };
    }

    const spotCenterX = rect.left + rect.width / 2;
    const spotBottom = rect.top + rect.height + padding;
    const spotTop = rect.top - padding;

    // Clamp horizontal position
    const clampedLeft = Math.max(16, Math.min(spotCenterX - cardW / 2, vw - cardW - 16));

    // Try below the spotlight
    if (spotBottom + cardH + 12 < vh) {
      return { position: "fixed", top: spotBottom + 12, left: clampedLeft };
    }
    // Try above
    if (spotTop - cardH - 12 > 0) {
      return { position: "fixed", top: spotTop - cardH - 12, left: clampedLeft };
    }
    // Try to the right of the spotlight
    if (rect.left + rect.width + cardW + 24 < vw) {
      return {
        position: "fixed",
        top: Math.max(16, Math.min(rect.top, vh - cardH - 16)),
        left: rect.left + rect.width + padding + 12,
      };
    }
    // Try to the left of the spotlight
    if (rect.left - cardW - 24 > 0) {
      return {
        position: "fixed",
        top: Math.max(16, Math.min(rect.top, vh - cardH - 16)),
        left: rect.left - padding - cardW - 12,
      };
    }
    // Fallback: center
    return {
      position: "fixed",
      top: Math.max(16, (vh - cardH) / 2),
      left: Math.max(16, (vw - cardW) / 2),
    };
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* SVG mask overlay */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                {rect && (
                  <rect
                    x={rect.left - padding}
                    y={rect.top - padding}
                    width={rect.width + padding * 2}
                    height={rect.height + padding * 2}
                    rx={12}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.55)"
              mask="url(#tour-mask)"
              style={{ pointerEvents: "auto" }}
              onClick={next}
            />
          </svg>

          {/* Spotlight border glow */}
          {rect && (
            <div
              className="absolute rounded-xl pointer-events-none"
              style={{
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
                border: "2px solid rgba(33, 99, 231, 0.5)",
                boxShadow: "0 0 0 4px rgba(33, 99, 231, 0.15), 0 0 20px rgba(33, 99, 231, 0.2)",
              }}
            />
          )}

          {/* Card */}
          <motion.div
            key={step}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              ...cardStyle(),
              width: isMobile ? "calc(100% - 32px)" : Math.min(380, window.innerWidth - 32),
              maxWidth: 380,
              zIndex: 201,
              fontFamily: "Lato, sans-serif",
            }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="h-1 bg-[#f0f1f7] flex">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className="h-full transition-colors duration-300"
                  style={{
                    flex: 1,
                    background: i <= step ? "#2163E7" : "transparent",
                  }}
                />
              ))}
            </div>

            {/* Header */}
            <div
              className="px-5 pt-5 pb-4"
              style={{
                background: "linear-gradient(135deg, rgba(33,99,231,0.08), rgba(33,99,231,0.02))",
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(33,99,231,0.1)" }}
                >
                  {current.icon}
                </div>
                <span className="text-[11px] font-bold text-[#9ca3af] tabular-nums">
                  {step + 1} / {total}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#1a1a2e] mt-3">{current.title}</h2>
              <p className="text-[13px] text-[#6b7280] mt-1.5 leading-relaxed">{current.description}</p>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-[#eef0f6] flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="h-9 px-4 text-[12px] font-bold rounded-lg border border-[#eef0f6] text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
                >
                  Back
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={finish}
                className="h-9 px-4 text-[12px] font-bold rounded-lg text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
              >
                Skip
              </button>
              <button
                onClick={next}
                className="h-9 px-5 text-[12px] font-bold rounded-lg bg-[#2163E7] text-white hover:bg-[#1a53c7] transition-colors"
              >
                {step === total - 1 ? "Get Started" : "Next"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

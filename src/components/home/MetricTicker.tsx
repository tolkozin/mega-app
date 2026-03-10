"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { motion, useReducedMotion } from "framer-motion";

const metrics = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    label: "Monthly Recurring Revenue",
    prefix: "$",
    end: 48200,
    suffix: "",
    trend: "+12.3%",
    trendColor: "#10B981",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    label: "LTV : CAC Ratio",
    prefix: "",
    end: 42,
    suffix: "",
    decimals: 1,
    trend: "Healthy",
    trendColor: "#10B981",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    label: "Monthly Churn",
    prefix: "",
    end: 32,
    suffix: "%",
    decimals: 1,
    trend: "-0.5%",
    trendColor: "#10B981",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: "Runway",
    prefix: "",
    end: 18,
    suffix: " months",
    trend: "On track",
    trendColor: "#3B82F6",
  },
];

function MetricCard({
  metric,
  index,
}: {
  metric: (typeof metrics)[0];
  index: number;
}) {
  const prefersReduced = useReducedMotion();
  const { value, ref } = useCountUp(
    metric.end,
    1500,
    false // start immediately on mount
  );

  const displayVal =
    metric.decimals && metric.decimals > 0
      ? (value / Math.pow(10, metric.decimals)).toFixed(metric.decimals)
      : metric.prefix === "$"
        ? `$${value.toLocaleString()}`
        : value.toLocaleString();

  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
      className="flex-shrink-0 snap-center rounded-xl border border-[#334155]/80 p-4 md:p-5 min-w-[200px] md:min-w-0 md:flex-1 hover:border-[#3B82F6]/50 transition-colors"
      style={{
        background: "rgba(30,41,59,0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-2 mb-2 text-[#94A3B8]">
        {metric.icon}
        <span className="text-xs">{metric.label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl md:text-2xl font-bold text-[#F8FAFC]">
          {displayVal}
          {metric.suffix}
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-md"
          style={{
            background: `${metric.trendColor}20`,
            color: metric.trendColor,
          }}
        >
          {metric.trend}
        </span>
      </div>
    </motion.div>
  );
}

export function MetricTicker() {
  return (
    <div className="flex gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
      {metrics.map((m, i) => (
        <MetricCard key={m.label} metric={m} index={i} />
      ))}
    </div>
  );
}

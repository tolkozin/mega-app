"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  computeScores,
  type DataRow,
  type HealthStatus,
  type ScoreResult,
} from "@/lib/scoring";
import { FONT, CARD_SHADOW } from "@/components/v2/charts/v2-chart-utils";

/* ─── Props ─── */

interface ScoresTabProps {
  df: DataRow[];
  engine: string;
  modelType?: string;
}

/* ─── Constants ─── */

const HEALTH_COLORS: Record<HealthStatus, string> = {
  good: "#10B981",
  caution: "#F59E0B",
  bad: "#EF4444",
  neutral: "#6b7280",
};

const HEALTH_LABELS: Record<HealthStatus, string> = {
  good: "Good",
  caution: "Caution",
  bad: "Bad",
  neutral: "N/A",
};

const METRIC_DESCRIPTIONS: Record<string, string> = {
  "LTV/CAC Ratio": "Customer lifetime value relative to acquisition cost",
  "Churn Rate": "Monthly customer cancellation rate",
  Runway: "Months of cash remaining at current burn rate",
  "MRR Growth": "Month-over-month revenue growth rate",
  "ARR Growth": "Month-over-month revenue growth rate",
  "Revenue Growth": "Month-over-month revenue growth rate",
  Profitability: "Current month net profit status",
  "Gross Margin": "Revenue retained after cost of goods sold",
  ROAS: "Return on advertising spend",
  "Net Revenue Retention":
    "Revenue retention including expansion and contraction",
  "Rule of 40 + Quick Ratio":
    "Combined efficiency: growth + margin \u2265 40, and revenue add vs. churn ratio",
};

const FADE_IN = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

const cardStyle: React.CSSProperties = {
  boxShadow: CARD_SHADOW,
  fontFamily: FONT,
};

function healthForScore(score: number): HealthStatus {
  if (score >= 60) return "good";
  if (score >= 35) return "caution";
  return "bad";
}

/* ─── Radar Chart ─── */

function RadarChart({
  breakdown,
}: {
  breakdown: ScoreResult["breakdown"];
}) {
  const size = 340;
  const center = size / 2;
  const maxR = 100;
  const rings = [0.33, 0.66, 1.0];
  const count = breakdown.length;

  if (count === 0) return null;

  const pointAt = (index: number, fraction: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * maxR * fraction,
      y: center + Math.sin(angle) * maxR * fraction,
    };
  };

  const polygonPath = (fraction: number) => {
    return (
      breakdown
        .map((_, i) => {
          const p = pointAt(i, fraction);
          return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ") + " Z"
    );
  };

  const dataPath =
    breakdown
      .map((b, i) => {
        const p = pointAt(i, b.score / 100);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ fontFamily: FONT }}
    >
      {/* Grid rings */}
      {rings.map((r) => (
        <path
          key={r}
          d={polygonPath(r)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {breakdown.map((_, i) => {
        const p = pointAt(i, 1.0);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="rgba(33, 99, 231, 0.2)"
        stroke="#2163E7"
        strokeWidth={2}
      />

      {/* Data dots */}
      {breakdown.map((b, i) => {
        const p = pointAt(i, b.score / 100);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#2163E7"
            stroke="#fff"
            strokeWidth={2}
          />
        );
      })}

      {/* Labels */}
      {breakdown.map((b, i) => {
        const labelR = maxR + 28;
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        const lx = center + Math.cos(angle) * labelR;
        const ly = center + Math.sin(angle) * labelR;

        // Determine text-anchor based on position
        const cos = Math.cos(angle);
        let anchor: "start" | "middle" | "end" = "middle";
        if (cos > 0.3) anchor = "start";
        else if (cos < -0.3) anchor = "end";

        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="central"
            fill="#1a1a2e"
            fontSize={11}
            fontWeight={600}
            fontFamily={FONT}
          >
            <tspan>{b.label}</tspan>
            <tspan
              x={lx}
              dy="14"
              fill="#6b7280"
              fontSize={10}
              fontWeight={400}
            >
              {Math.round(b.score)}/100
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Score Breakdown Card ─── */

function BreakdownCard({
  item,
  index,
}: {
  item: ScoreResult["breakdown"][number];
  index: number;
}) {
  const health = healthForScore(item.score);
  const color = HEALTH_COLORS[health];
  const description =
    METRIC_DESCRIPTIONS[item.label] || "Business health metric";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: "easeOut" as const,
        delay: 0.06 * index,
      }}
      className="bg-white rounded-2xl p-5"
      style={cardStyle}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[13px] font-extrabold"
            style={{ color: "#1a1a2e", fontFamily: FONT }}
          >
            {item.label}
          </span>
          <span
            className="text-[13px] font-semibold"
            style={{ color: "#6b7280", fontFamily: FONT }}
          >
            &mdash; {Math.round(item.score)}/100
          </span>
        </div>
        <span
          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 rounded-full mb-3"
        style={{ backgroundColor: "#f0f1f7" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(item.score, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <p
        className="text-[12px] leading-relaxed"
        style={{ color: "#9ca3af", fontFamily: FONT }}
      >
        What&apos;s measured: {description}
      </p>
    </motion.div>
  );
}

/* ─── Category List Item ─── */

function CategoryItem({
  item,
}: {
  item: ScoreResult["breakdown"][number];
}) {
  const health = healthForScore(item.score);
  const color = HEALTH_COLORS[health];

  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[12px] font-semibold truncate"
            style={{ color: "#1a1a2e", fontFamily: FONT }}
          >
            {item.label}
          </span>
          <span
            className="text-[12px] font-semibold flex-shrink-0 ml-2"
            style={{ color: "#6b7280", fontFamily: FONT }}
          >
            {Math.round(item.score)}
          </span>
        </div>
        <div
          className="w-full h-1.5 rounded-full"
          style={{ backgroundColor: "#f0f1f7" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(item.score, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function ScoresTab({ df, engine, modelType }: ScoresTabProps) {
  const scores = useMemo(
    () => computeScores(df, engine, modelType),
    [df, engine, modelType],
  );

  /* Empty state */
  if (df.length < 2) {
    return (
      <div
        className="flex items-center justify-center py-24"
        style={{ fontFamily: FONT }}
      >
        <p className="text-[15px]" style={{ color: "#9ca3af" }}>
          Not enough data to calculate scores.
        </p>
      </div>
    );
  }

  const overallColor = HEALTH_COLORS[scores.health];
  const overallLabel = HEALTH_LABELS[scores.health];

  return (
    <div className="space-y-6" style={{ fontFamily: FONT }}>
      {/* ─── Top Row: Radar + Overall ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Radar Chart */}
        <motion.div
          {...FADE_IN}
          className="bg-white rounded-2xl p-6 flex items-center justify-center"
          style={cardStyle}
        >
          <RadarChart breakdown={scores.breakdown} />
        </motion.div>

        {/* Right: Overall Score + Category List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" as const, delay: 0.08 }}
          className="bg-white rounded-2xl p-6"
          style={cardStyle}
        >
          {/* Overall score */}
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="text-[40px] font-extrabold leading-none"
              style={{ color: "#1a1a2e" }}
            >
              {scores.overall}
            </span>
            <span
              className="text-[16px] font-semibold"
              style={{ color: "#9ca3af" }}
            >
              /100
            </span>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: overallColor }}
            />
            <span
              className="text-[13px] font-extrabold"
              style={{ color: overallColor }}
            >
              {overallLabel}
            </span>
          </div>

          {/* Category list */}
          <div>
            <h3
              className="text-[13px] font-extrabold mb-2"
              style={{ color: "#1a1a2e" }}
            >
              Score Breakdown
            </h3>
            <div className="divide-y divide-gray-100">
              {scores.breakdown.map((item) => (
                <CategoryItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Detailed Breakdown ─── */}
      <div>
        <h3
          className="text-[13px] font-extrabold mb-4"
          style={{ color: "#1a1a2e" }}
        >
          Detailed Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scores.breakdown.map((item, i) => (
            <BreakdownCard key={item.label} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScoresTab;

"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  computeScores,
  generateInsights,
  getPhaseProgress,
  getMonthlySnapshot,
  type DataRow,
  type HealthStatus,
  type ScoreResult,
  type Insight,
  type PhaseInfo,
  type SnapshotItem,
} from "@/lib/scoring";
import { FONT, CARD_SHADOW } from "@/components/v2/charts/v2-chart-utils";

/* ─── Props ─── */

interface SummaryTabProps {
  df: DataRow[];
  engine: string;
  modelType?: string;
  config: Record<string, unknown>;
  milestones?: Record<string, unknown>;
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

const INSIGHT_ICONS: Record<Insight["type"], string> = {
  good: "\u2705",
  caution: "\u26A0\uFE0F",
  bad: "\uD83D\uDD34",
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

/* ─── Health Score Card ─── */

function HealthScoreCard({ score }: { score: ScoreResult }) {
  const color = HEALTH_COLORS[score.health];
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.overall / 100) * circumference;

  return (
    <motion.div {...FADE_IN} className="bg-white rounded-2xl p-6" style={cardStyle}>
      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative flex-shrink-0" style={{ width: 128, height: 128 }}>
          <svg width={128} height={128} viewBox="0 0 128 128">
            {/* Track */}
            <circle
              cx={64}
              cy={64}
              r={radius}
              fill="none"
              stroke="#f0f1f7"
              strokeWidth={stroke}
            />
            {/* Fill */}
            <circle
              cx={64}
              cy={64}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          {/* Score number in center */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontFamily: FONT }}
          >
            <span
              className="font-extrabold"
              style={{ fontSize: 32, color: "#1a1a2e", lineHeight: 1 }}
            >
              {score.overall}
            </span>
          </div>
        </div>

        {/* Label & subtitle */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[22px] font-extrabold"
              style={{ color }}
            >
              {HEALTH_LABELS[score.health]}
            </span>
          </div>
          <p
            className="text-[13px] font-extrabold"
            style={{ color: "#1a1a2e" }}
          >
            Business Health Score
          </p>
          {score.breakdown.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {score.breakdown.map((b) => (
                <span
                  key={b.label}
                  className="text-[10px]"
                  style={{ color: "#9ca3af" }}
                >
                  {b.label}: {Math.round(b.score)}/100
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── KPI Summary Cards ─── */

function KPISummaryGrid({ df, engine }: { df: DataRow[]; engine: string }) {
  const kpis = useMemo(() => {
    if (df.length < 2) return [];
    const last = df[df.length - 1];
    const prev = df[df.length - 2];

    const ENGINE_KPIS: Record<string, { label: string; cols: string[]; format: "currency" | "pct" | "ratio" | "months" | "number"; goodFn?: (v: number) => boolean; badFn?: (v: number) => boolean }[]> = {
      subscription: [
        { label: "MRR", cols: ["Total MRR", "MRR"], format: "currency", goodFn: (v) => v > 0 },
        { label: "Active Users", cols: ["Active Users", "Active Subscribers", "Total Active"], format: "number" },
        { label: "LTV/CAC", cols: ["LTV/CAC"], format: "ratio", goodFn: (v) => v >= 3, badFn: (v) => v < 1 },
        { label: "Churn Rate", cols: ["Churn Rate", "Logo Churn %"], format: "pct", goodFn: (v) => v <= 3, badFn: (v) => v >= 8 },
        { label: "ARPU", cols: ["ARPU"], format: "currency" },
        { label: "Runway", cols: ["Runway (Months)", "Runway"], format: "months", goodFn: (v) => v >= 12, badFn: (v) => v < 6 },
      ],
      ecommerce: [
        { label: "Revenue", cols: ["Gross Revenue"], format: "currency" },
        { label: "Orders", cols: ["Total Orders", "Orders"], format: "number" },
        { label: "AOV", cols: ["AOV", "Avg Order Value"], format: "currency" },
        { label: "LTV/CAC", cols: ["LTV/CAC"], format: "ratio", goodFn: (v) => v >= 3, badFn: (v) => v < 1 },
        { label: "Gross Margin", cols: ["Gross Margin %", "Gross Margin"], format: "pct", goodFn: (v) => v >= 50 },
        { label: "ROAS", cols: ["ROAS"], format: "ratio", goodFn: (v) => v >= 2, badFn: (v) => v < 1 },
      ],
      saas: [
        { label: "ARR", cols: ["ARR"], format: "currency" },
        { label: "Active Customers", cols: ["Active Customers", "Customers"], format: "number" },
        { label: "NRR", cols: ["NRR %", "NRR"], format: "pct", goodFn: (v) => v >= 110, badFn: (v) => v < 90 },
        { label: "Quick Ratio", cols: ["Quick Ratio"], format: "ratio", goodFn: (v) => v >= 4, badFn: (v) => v < 1 },
        { label: "Rule of 40", cols: ["Rule of 40"], format: "number", goodFn: (v) => v >= 40, badFn: (v) => v < 20 },
        { label: "LTV/CAC", cols: ["LTV/CAC"], format: "ratio", goodFn: (v) => v >= 3, badFn: (v) => v < 1 },
      ],
    };

    const defs = ENGINE_KPIS[engine] ?? ENGINE_KPIS.subscription;

    return defs.map((def) => {
      const val = getNum(last, def.cols);
      const prevVal = getNum(prev, def.cols);
      const trend = prevVal !== 0 ? ((val - prevVal) / Math.abs(prevVal)) * 100 : 0;

      let health: HealthStatus = "neutral";
      if (def.goodFn && def.goodFn(val)) health = "good";
      else if (def.badFn && def.badFn(val)) health = "bad";
      else if (def.goodFn || def.badFn) health = "caution";

      let formatted: string;
      switch (def.format) {
        case "currency":
          if (Math.abs(val) >= 1e6) formatted = `$${(val / 1e6).toFixed(1)}M`;
          else if (Math.abs(val) >= 1e3) formatted = `$${(val / 1e3).toFixed(1)}k`;
          else formatted = `$${val.toFixed(0)}`;
          break;
        case "pct": formatted = `${val.toFixed(1)}%`; break;
        case "ratio": formatted = `${val.toFixed(2)}x`; break;
        case "months": formatted = `${val.toFixed(1)}mo`; break;
        case "number": formatted = val.toLocaleString("en-US", { maximumFractionDigits: 0 }); break;
      }

      return { label: def.label, value: formatted, trend, health };
    });
  }, [df, engine]);

  if (kpis.length === 0) return null;

  return (
    <motion.div {...FADE_IN} transition={{ ...FADE_IN.transition, delay: 0.08 }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl p-4"
            style={cardStyle}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-wider mb-1"
              style={{ color: "#9ca3af" }}
            >
              {kpi.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-[22px] font-extrabold"
                style={{ color: "#1a1a2e" }}
              >
                {kpi.value}
              </span>
              {kpi.trend !== 0 && (
                <span
                  className="text-[10px] font-bold"
                  style={{ color: kpi.trend > 0 ? "#10B981" : "#EF4444" }}
                >
                  {kpi.trend > 0 ? "\u25B2" : "\u25BC"}
                  {Math.abs(kpi.trend).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="inline-block rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: HEALTH_COLORS[kpi.health],
                }}
              />
              <span className="text-[10px]" style={{ color: "#9ca3af" }}>
                {HEALTH_LABELS[kpi.health]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Key Insights Card ─── */

function KeyInsightsCard({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <motion.div
      {...FADE_IN}
      transition={{ ...FADE_IN.transition, delay: 0.16 }}
      className="bg-white rounded-2xl p-5"
      style={cardStyle}
    >
      <h3
        className="text-[13px] font-extrabold mb-3"
        style={{ color: "#1a1a2e" }}
      >
        Key Insights
      </h3>
      <div className="space-y-0">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 py-2.5 ${
              i < insights.length - 1 ? "border-b" : ""
            }`}
            style={{ borderColor: "#f0f1f7" }}
          >
            <span className="text-sm flex-shrink-0 leading-none mt-0.5">
              {INSIGHT_ICONS[insight.type]}
            </span>
            <span className="text-[12px]" style={{ color: "#1a1a2e" }}>
              {insight.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Phase Progress Card ─── */

const PHASE_STATUS_COLORS: Record<PhaseInfo["status"], { bar: string; badge: string; badgeBg: string }> = {
  done: { bar: "#2163E7", badge: "#2163E7", badgeBg: "rgba(33,99,231,0.08)" },
  active: { bar: "#10B981", badge: "#10B981", badgeBg: "rgba(16,185,129,0.08)" },
  upcoming: { bar: "#f0f1f7", badge: "#9ca3af", badgeBg: "rgba(156,163,175,0.08)" },
};

const PHASE_STATUS_LABELS: Record<PhaseInfo["status"], string> = {
  done: "Done",
  active: "In Progress",
  upcoming: "Upcoming",
};

function PhaseProgressCard({ phases }: { phases: PhaseInfo[] }) {
  if (phases.length === 0) return null;

  return (
    <motion.div
      {...FADE_IN}
      transition={{ ...FADE_IN.transition, delay: 0.24 }}
      className="bg-white rounded-2xl p-5"
      style={cardStyle}
    >
      <h3
        className="text-[13px] font-extrabold mb-4"
        style={{ color: "#1a1a2e" }}
      >
        Phase Progress
      </h3>
      <div className="space-y-4">
        {phases.map((phase) => {
          const colors = PHASE_STATUS_COLORS[phase.status];
          return (
            <div key={phase.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[12px] font-bold"
                    style={{ color: "#1a1a2e" }}
                  >
                    {phase.label}
                  </span>
                  <span className="text-[10px]" style={{ color: "#9ca3af" }}>
                    (M{phase.startMonth}–M{phase.endMonth})
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: colors.badge,
                    backgroundColor: colors.badgeBg,
                  }}
                >
                  {PHASE_STATUS_LABELS[phase.status]}
                </span>
              </div>
              {/* Progress bar */}
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "#f0f1f7" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(phase.progress * 100)}%`,
                    backgroundColor: colors.bar,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Monthly Snapshot Card ─── */

function MonthlySnapshotCard({
  month,
  items,
}: {
  month: number;
  items: SnapshotItem[];
}) {
  if (items.length === 0) return null;

  return (
    <motion.div
      {...FADE_IN}
      transition={{ ...FADE_IN.transition, delay: 0.32 }}
      className="bg-white rounded-2xl p-5"
      style={cardStyle}
    >
      <div className="flex items-baseline gap-2 mb-4">
        <h3
          className="text-[13px] font-extrabold"
          style={{ color: "#1a1a2e" }}
        >
          Monthly Snapshot
        </h3>
        <span className="text-[11px]" style={{ color: "#9ca3af" }}>
          (Month {month})
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[11px]" style={{ color: "#9ca3af" }}>
              {item.label}
            </p>
            <p
              className="text-[13px] font-bold"
              style={{ color: "#1a1a2e" }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Empty state ─── */

function EmptyState() {
  return (
    <div
      className="bg-white rounded-2xl p-8 text-center"
      style={cardStyle}
    >
      <p className="text-sm" style={{ color: "#6b7280" }}>
        Not enough data to display the summary. Run a model with at least 2
        months of data.
      </p>
    </div>
  );
}

/* ─── Utility: extract numeric value from a row ─── */

function getNum(row: DataRow, cols: string[]): number {
  for (const c of cols) {
    const lc = c.toLowerCase();
    const key = Object.keys(row).find((k) => k.toLowerCase() === lc);
    if (key !== undefined) {
      const v = row[key];
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const n = Number(v);
        if (!isNaN(n)) return n;
      }
    }
  }
  // partial match
  for (const c of cols) {
    const lc = c.toLowerCase();
    const key = Object.keys(row).find((k) => k.toLowerCase().includes(lc));
    if (key !== undefined) {
      const v = row[key];
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const n = Number(v);
        if (!isNaN(n)) return n;
      }
    }
  }
  return 0;
}

/* ─── Main Component ─── */

export function SummaryTab({ df, engine, modelType, config }: SummaryTabProps) {
  const scores = useMemo(() => computeScores(df, engine, modelType), [df, engine, modelType]);
  const insights = useMemo(() => generateInsights(df, engine, modelType), [df, engine, modelType]);
  const phases = useMemo(
    () => getPhaseProgress(config, df),
    [config, df]
  );
  const snapshot = useMemo(
    () => getMonthlySnapshot(df, engine),
    [df, engine]
  );

  if (!df || df.length < 2) {
    return (
      <div className="space-y-4">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HealthScoreCard score={scores} />
      <KPISummaryGrid df={df} engine={engine} />
      <KeyInsightsCard insights={insights} />
      <PhaseProgressCard phases={phases} />
      <MonthlySnapshotCard month={snapshot.month} items={snapshot.items} />
    </div>
  );
}

export default SummaryTab;

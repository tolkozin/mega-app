"use client";

import React, { useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FONT, CARD_SHADOW } from "@/components/v2/charts/v2-chart-utils";
import type { DataRow } from "@/lib/scoring";
import type { TrackingData, TrackingRow } from "@/lib/types";

/* ─── Props ─── */

interface TrackingTabProps {
  df: DataRow[];
  engine: string;
  trackingData: TrackingData;
  onTrackingChange: (data: TrackingData) => void;
}

/* ─── Constants ─── */

const FADE_IN = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

const cardStyle: React.CSSProperties = {
  boxShadow: CARD_SHADOW,
  fontFamily: FONT,
};

const TABLE_HEADER =
  "text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]";

const BTN_PRIMARY =
  "bg-[#2163e7] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1a53c7] transition-colors";

const BTN_SECONDARY =
  "border border-[#e5e7eb] text-[#1a1a2e] text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#f8f9fc] transition-colors";

/* ─── Tracked Metrics per Engine ─── */

interface MetricDef {
  key: string;
  label: string;
  columns: string[];
  format: "currency" | "number" | "pct";
}

const METRICS_BY_ENGINE: Record<string, MetricDef[]> = {
  subscription: [
    { key: "revenue", label: "Revenue", columns: ["Total Gross Revenue", "Gross Revenue", "Revenue"], format: "currency" },
    { key: "users", label: "Active Users", columns: ["Active Users", "Active Subs"], format: "number" },
    { key: "mrr", label: "MRR", columns: ["MRR"], format: "currency" },
    { key: "churn", label: "Churn Rate", columns: ["Churn Rate", "Monthly Churn Rate"], format: "pct" },
    { key: "expenses", label: "Expenses", columns: ["Total Expenses", "Expenses"], format: "currency" },
    { key: "net_profit", label: "Net Profit", columns: ["Net Profit"], format: "currency" },
  ],
  ecommerce: [
    { key: "revenue", label: "Revenue", columns: ["Total Gross Revenue", "Gross Revenue", "Revenue", "Total Revenue"], format: "currency" },
    { key: "orders", label: "Orders", columns: ["Total Orders", "Orders"], format: "number" },
    { key: "aov", label: "AOV", columns: ["AOV", "Average Order Value"], format: "currency" },
    { key: "roas", label: "ROAS", columns: ["ROAS", "Cumulative ROAS"], format: "number" },
    { key: "expenses", label: "Expenses", columns: ["Total Expenses", "Expenses"], format: "currency" },
    { key: "net_profit", label: "Net Profit", columns: ["Net Profit"], format: "currency" },
  ],
  saas: [
    { key: "arr", label: "ARR", columns: ["ARR"], format: "currency" },
    { key: "customers", label: "Customers", columns: ["Total Customers", "Active Accounts"], format: "number" },
    { key: "mrr", label: "MRR", columns: ["MRR"], format: "currency" },
    { key: "seats", label: "Active Seats", columns: ["Active Seats", "Total Seats"], format: "number" },
    { key: "expenses", label: "Expenses", columns: ["Total Expenses", "Expenses"], format: "currency" },
    { key: "net_profit", label: "Net Profit", columns: ["Net Profit"], format: "currency" },
  ],
};

/* ─── Helpers ─── */

function num(row: DataRow | TrackingRow, ...candidates: string[]): number {
  for (const c of candidates) {
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
  return 0;
}

function fmt(value: number, format: "currency" | "number" | "pct"): string {
  if (format === "pct") return `${value.toFixed(1)}%`;
  if (format === "currency") {
    if (Math.abs(value) >= 1e6) return `${value < 0 ? "-" : ""}$${(Math.abs(value) / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${value < 0 ? "-" : ""}$${(Math.abs(value) / 1e3).toFixed(1)}K`;
    return `${value < 0 ? "-$" : "$"}${Math.abs(value).toFixed(0)}`;
  }
  return Math.round(value).toLocaleString("en-US");
}

function parseCSV(text: string): TrackingRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: TrackingRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: TrackingRow = { month: 0 };
    for (let j = 0; j < headers.length; j++) {
      const h = headers[j];
      const v = values[j] ?? "";
      const n = Number(v.replace(/[$,%]/g, ""));
      if (h.toLowerCase() === "month") {
        row.month = isNaN(n) ? i : n;
      } else {
        row[h] = isNaN(n) ? v : n;
      }
    }
    if (row.month > 0) rows.push(row);
  }

  return rows;
}

/* ─── CSV Import Card ─── */

function ImportCard({
  trackingData,
  onTrackingChange,
  metrics,
}: {
  trackingData: TrackingData;
  onTrackingChange: (data: TrackingData) => void;
  metrics: MetricDef[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const rows = parseCSV(reader.result as string);
        if (rows.length > 0) {
          onTrackingChange({ ...trackingData, rows });
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [trackingData, onTrackingChange],
  );

  const handleClear = useCallback(() => {
    onTrackingChange({ ...trackingData, rows: [] });
  }, [trackingData, onTrackingChange]);

  const csvTemplate = useMemo(() => {
    const headers = ["Month", ...metrics.map((m) => m.label)];
    return headers.join(",") + "\n1," + metrics.map(() => "0").join(",");
  }, [metrics]);

  const handleDownloadTemplate = useCallback(() => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tracking-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [csvTemplate]);

  return (
    <motion.div {...FADE_IN} className="bg-white rounded-2xl p-6" style={cardStyle}>
      <h3
        className="text-[15px] font-bold text-[#1a1a2e] mb-4"
        style={{ fontFamily: FONT }}
      >
        Import Actual Data
      </h3>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          className={BTN_PRIMARY}
          onClick={() => fileRef.current?.click()}
        >
          Upload CSV
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={handleDownloadTemplate}
        >
          Download Template
        </button>
        {trackingData.rows.length > 0 && (
          <button
            type="button"
            className="text-[12px] font-bold text-[#EF4444] hover:text-[#DC2626] transition-colors"
            onClick={handleClear}
          >
            Clear Data
          </button>
        )}
        <span
          className="text-[11px] text-[#9ca3af] ml-auto"
          style={{ fontFamily: FONT }}
        >
          {trackingData.rows.length > 0
            ? `${trackingData.rows.length} months loaded`
            : "No actual data imported yet"}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Variance Table ─── */

function VarianceTable({
  df,
  trackingData,
  metrics,
}: {
  df: DataRow[];
  trackingData: TrackingData;
  metrics: MetricDef[];
}) {
  const comparisonMonths = useMemo(() => {
    const actualMonths = new Set(trackingData.rows.map((r) => r.month));
    return df
      .map((row) => num(row, "Month"))
      .filter((m) => actualMonths.has(m));
  }, [df, trackingData.rows]);

  if (comparisonMonths.length === 0) {
    return (
      <motion.div {...FADE_IN} className="bg-white rounded-2xl p-6" style={cardStyle}>
        <h3
          className="text-[15px] font-bold text-[#1a1a2e] mb-4"
          style={{ fontFamily: FONT }}
        >
          Plan vs Actual
        </h3>
        <div className="py-8 text-center">
          <p className="text-[13px] text-[#9ca3af]" style={{ fontFamily: FONT }}>
            Import actual data to see plan vs actual comparison
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...FADE_IN} className="bg-white rounded-2xl p-6" style={cardStyle}>
      <h3
        className="text-[15px] font-bold text-[#1a1a2e] mb-4"
        style={{ fontFamily: FONT }}
      >
        Plan vs Actual
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontFamily: FONT }}>
          <thead>
            <tr>
              <th className={TABLE_HEADER + " text-left pb-3 pr-3"}>Month</th>
              <th className={TABLE_HEADER + " text-left pb-3 pr-3"}>Metric</th>
              <th className={TABLE_HEADER + " text-right pb-3 pr-3"}>Plan</th>
              <th className={TABLE_HEADER + " text-right pb-3 pr-3"}>Actual</th>
              <th className={TABLE_HEADER + " text-right pb-3"}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {comparisonMonths.map((month) => {
              const planRow = df.find(
                (r) => num(r, "Month") === month,
              );
              const actualRow = trackingData.rows.find(
                (r) => r.month === month,
              );
              if (!planRow || !actualRow) return null;

              return metrics.map((metric, mi) => {
                const planned = num(planRow, ...metric.columns);
                const actual = num(actualRow, metric.label, metric.key, ...metric.columns);
                const diff = actual - planned;
                const pctDiff =
                  planned !== 0 ? (diff / Math.abs(planned)) * 100 : 0;
                const isPositive = diff >= 0;
                // For churn and expenses, negative variance is good
                const isGood =
                  metric.key === "churn" || metric.key === "expenses"
                    ? !isPositive
                    : isPositive;

                return (
                  <tr
                    key={`${month}-${metric.key}`}
                    className={mi === 0 ? "border-t border-[#f0f1f7]" : ""}
                  >
                    {mi === 0 && (
                      <td
                        className="py-2 pr-3 text-[12px] font-bold text-[#1a1a2e] align-top"
                        rowSpan={metrics.length}
                      >
                        M{month}
                      </td>
                    )}
                    <td className="py-1.5 pr-3 text-[12px] text-[#6b7280]">
                      {metric.label}
                    </td>
                    <td className="py-1.5 pr-3 text-[12px] text-right text-[#1a1a2e] font-semibold">
                      {fmt(planned, metric.format)}
                    </td>
                    <td className="py-1.5 pr-3 text-[12px] text-right text-[#1a1a2e] font-semibold">
                      {fmt(actual, metric.format)}
                    </td>
                    <td className="py-1.5 text-[12px] text-right font-bold">
                      <span style={{ color: isGood ? "#10B981" : "#EF4444" }}>
                        {isPositive ? "+" : ""}
                        {fmt(diff, metric.format)}{" "}
                        <span className="text-[10px] font-semibold">
                          ({isPositive ? "+" : ""}
                          {pctDiff.toFixed(1)}%)
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ─── Variance Summary ─── */

function VarianceSummary({
  df,
  trackingData,
  metrics,
}: {
  df: DataRow[];
  trackingData: TrackingData;
  metrics: MetricDef[];
}) {
  const insights = useMemo(() => {
    if (trackingData.rows.length === 0) return [];

    const results: { text: string; type: "good" | "bad" | "neutral" }[] = [];

    for (const metric of metrics) {
      let totalPlan = 0;
      let totalActual = 0;
      let count = 0;

      for (const actualRow of trackingData.rows) {
        const planRow = df.find(
          (r) => num(r, "Month") === actualRow.month,
        );
        if (!planRow) continue;

        totalPlan += num(planRow, ...metric.columns);
        totalActual += num(actualRow, metric.label, metric.key, ...metric.columns);
        count++;
      }

      if (count === 0 || totalPlan === 0) continue;

      const pctDiff = ((totalActual - totalPlan) / Math.abs(totalPlan)) * 100;
      const isGood =
        metric.key === "churn" || metric.key === "expenses"
          ? pctDiff < 0
          : pctDiff > 0;

      if (Math.abs(pctDiff) >= 5) {
        results.push({
          text: `${metric.label}: ${pctDiff > 0 ? "+" : ""}${pctDiff.toFixed(1)}% vs plan across ${count} months`,
          type: isGood ? "good" : "bad",
        });
      }
    }

    return results;
  }, [df, trackingData, metrics]);

  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const, delay: 0.08 }}
      className="bg-white rounded-2xl p-6"
      style={cardStyle}
    >
      <h3
        className="text-[15px] font-bold text-[#1a1a2e] mb-4"
        style={{ fontFamily: FONT }}
      >
        Variance Insights
      </h3>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-2 py-2"
          >
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{
                backgroundColor:
                  insight.type === "good" ? "#10B981" : "#EF4444",
              }}
            />
            <span
              className="text-[12px] text-[#1a1a2e]"
              style={{ fontFamily: FONT }}
            >
              {insight.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Integration Placeholders ─── */

const INTEGRATIONS = [
  { name: "Google Analytics", icon: "GA", color: "#E37400" },
  { name: "Stripe", icon: "St", color: "#635BFF" },
  { name: "Mixpanel", icon: "Mp", color: "#7856FF" },
  { name: "App Store Connect", icon: "AS", color: "#0D84FF" },
  { name: "Google Play Console", icon: "GP", color: "#01875F" },
  { name: "Meta Ads", icon: "Me", color: "#1877F2" },
];

function IntegrationsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const, delay: 0.12 }}
      className="bg-white rounded-2xl p-6"
      style={cardStyle}
    >
      <h3
        className="text-[15px] font-bold text-[#1a1a2e] mb-4"
        style={{ fontFamily: FONT }}
      >
        Integrations
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center gap-3 bg-[#f8f9fc] rounded-xl border border-[#e5e7eb] px-4 py-3 opacity-60"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ backgroundColor: integration.color }}
            >
              {integration.icon}
            </div>
            <div className="min-w-0">
              <span
                className="text-[12px] font-bold text-[#1a1a2e] block truncate"
                style={{ fontFamily: FONT }}
              >
                {integration.name}
              </span>
              <span
                className="text-[10px] text-[#9ca3af]"
                style={{ fontFamily: FONT }}
              >
                Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export function TrackingTab({
  df,
  engine,
  trackingData,
  onTrackingChange,
}: TrackingTabProps) {
  const metrics = METRICS_BY_ENGINE[engine] ?? METRICS_BY_ENGINE.subscription;

  if (df.length < 2) {
    return (
      <div
        className="flex items-center justify-center py-24"
        style={{ fontFamily: FONT }}
      >
        <p className="text-[15px]" style={{ color: "#9ca3af" }}>
          Not enough data to display tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: FONT }}>
      <ImportCard
        trackingData={trackingData}
        onTrackingChange={onTrackingChange}
        metrics={metrics}
      />
      <VarianceTable df={df} trackingData={trackingData} metrics={metrics} />
      <VarianceSummary df={df} trackingData={trackingData} metrics={metrics} />
      <IntegrationsCard />
    </div>
  );
}

export default TrackingTab;

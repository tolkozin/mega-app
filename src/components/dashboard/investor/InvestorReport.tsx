"use client";

import React, { useRef, useState } from "react";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import { exportToPDF } from "@/lib/pdf-export";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { RunResult } from "@/lib/api";
import {
  PlotlyChart as ReportChart,
  gradientArea,
  CHART_COLORS,
  DONUT_COLORS,
} from "@/components/dashboard/charts/PlotlyChart";

export { ReportChart, gradientArea, CHART_COLORS, DONUT_COLORS };

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModelType = string;

interface InvestorReportProps {
  projectName: string;
  modelType: ModelType;
  data: RunResult;
  children?: React.ReactNode;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

import { getModelDef, getBaseEngine } from "@/lib/model-registry";

function getModelLabel(type: string): string {
  return getModelDef(type).label;
}

function getModelColor(type: string): string {
  return getModelDef(type).color;
}

function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function fmtMoney(v: unknown) {
  return formatCurrency(num(v));
}

function fmtPct100(v: unknown) {
  // values stored as 0-1 fractions
  return formatPercent(num(v) * 100);
}

function fmtRaw(v: unknown) {
  return num(v).toFixed(1);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-sm font-bold uppercase tracking-widest mb-3"
      style={{ color: "#1C1D21", letterSpacing: "0.08em" }}
    >
      {children}
    </h2>
  );
}

export function Divider() {
  return <div className="border-t my-5" style={{ borderColor: "#ECECF2" }} />;
}

export function KPIGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{children}</div>
  );
}

export function KPICard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ border: "1px solid #ECECF2", backgroundColor: "#FAFAFA" }}
    >
      <p className="text-xs font-medium" style={{ color: "#8181A5" }}>
        {label}
      </p>
      <p className="text-base font-bold mt-0.5" style={{ color: "#1C1D21" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: "#8181A5" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function CompactTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile: stacked card layout
    return (
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-lg p-3"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <p className="text-xs font-bold mb-2" style={{ color: "#F8FAFC" }}>
              {row[0]}
            </p>
            <div className="space-y-1">
              {row.slice(1).map((cell, j) => (
                <div key={j} className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "#94A3B8" }}>
                    {headers[j + 1]}
                  </span>
                  <span className="text-xs font-medium" style={{ color: "#F8FAFC" }}>
                    {cell}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop: standard table
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid #ECECF2" }}>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left py-1.5 pr-4 font-semibold"
                style={{ color: "#8181A5" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: "1px solid #ECECF2" }}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="py-1.5 pr-4"
                  style={{ color: "#1C1D21" }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Shared sections ─────────────────────────────────────────────────────────

function ExecutiveSummary({ data, modelType }: { data: RunResult; modelType: ModelType }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const last = df[df.length - 1];
  const first = df[0];

  const totalRevKey =
    modelType === "subscription" ? "Total Gross Revenue" : "Gross Revenue";
  const totalRev = df.reduce((s, r) => s + num(r[totalRevKey]), 0);
  const totalProfit = df.reduce((s, r) => s + num(r["Net Profit"]), 0);
  const endCash = num(last["Cash Balance"]);
  const peakBurn = Math.max(...df.map((r) => num(r["Burn Rate"])));
  const runway = num(last["Runway (Months)"]);
  const grossMarginKey = "Gross Margin %";
  const avgGM =
    df.reduce((s, r) => s + num(r[grossMarginKey]), 0) / df.length;

  const months = df.length;
  const revenueGrowth =
    first[totalRevKey] && first[totalRevKey] > 0
      ? ((num(last[totalRevKey]) - num(first[totalRevKey])) /
          num(first[totalRevKey])) *
        100
      : null;

  const monthsArr = df.map((_, i) => i + 1);
  const revByMonth = df.map((r) => num(r[totalRevKey]));

  return (
    <div>
      <SectionHeader>Executive Summary</SectionHeader>
      <KPIGrid>
        <KPICard
          label="Total Revenue"
          value={fmtMoney(totalRev)}
          sub={`over ${months} months`}
        />
        <KPICard
          label="Net Profit / (Loss)"
          value={fmtMoney(totalProfit)}
          sub="cumulative"
        />
        <KPICard
          label="Ending Cash"
          value={fmtMoney(endCash)}
          sub={runway > 0 ? `${formatNumber(runway)} mo runway` : "no limit"}
        />
        <KPICard
          label="Avg Gross Margin"
          value={avgGM ? fmtPct100(avgGM) : "—"}
          sub={
            revenueGrowth !== null
              ? `Rev growth ${revenueGrowth.toFixed(0)}%`
              : undefined
          }
        />
      </KPIGrid>
      <div className="mt-4">
        <ReportChart
          size="small"
          data={[
            gradientArea(
              monthsArr,
              revByMonth,
              "Revenue",
              CHART_COLORS.primary,
              CHART_COLORS.primaryLight,
            ) as Plotly.Data,
          ]}
          layout={{ title: { text: "Monthly Revenue", font: { size: 13, color: "#8181A5" } } }}
        />
      </div>
    </div>
  );
}

function PnLOverview({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  // Show quarterly snapshots (every 3 months) up to 12 rows
  const step = Math.max(1, Math.floor(df.length / 12));
  const filtered = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
  const sampled = filtered.length > 12
    ? [...filtered.slice(0, 11), filtered[filtered.length - 1]]
    : filtered;
  const rows = sampled.map((r) => {
      const rev = num(r["Total Gross Revenue"] ?? r["Gross Revenue"]);
      const cogs = num(r["Total COGS"] ?? r["COGS"]);
      const opex = num(r["Total OpEx"] ?? r["Total Expenses"]);
      const ebitda = num(r["EBITDA"]);
      const net = num(r["Net Profit"]);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        fmtMoney(rev),
        fmtMoney(cogs),
        fmtMoney(opex),
        fmtMoney(ebitda),
        fmtMoney(net),
      ];
    });

  return (
    <div>
      <SectionHeader>P&L Overview</SectionHeader>
      <CompactTable
        headers={["Month", "Revenue", "COGS", "OpEx", "EBITDA", "Net Profit"]}
        rows={rows}
      />
    </div>
  );
}

function CashFlowSummary({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const step = Math.max(1, Math.floor(df.length / 10));
  const filtered = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
  const sampled = filtered.length > 10
    ? [...filtered.slice(0, 9), filtered[filtered.length - 1]]
    : filtered;
  const rows = sampled.map((r) => {
      const burn = num(r["Burn Rate"]);
      const cash = num(r["Cash Balance"]);
      const cumProfit = num(r["Cumulative Net Profit"]);
      const runway = num(r["Runway (Months)"]);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        fmtMoney(burn),
        fmtMoney(cash),
        fmtMoney(cumProfit),
        runway > 0 ? `${runway.toFixed(0)} mo` : "\u221e",
      ];
    });

  return (
    <div>
      <SectionHeader>Cash Flow Summary</SectionHeader>
      <CompactTable
        headers={["Month", "Burn Rate", "Cash Balance", "Cum. Profit", "Runway"]}
        rows={rows}
      />
    </div>
  );
}

function KeyAssumptions({ data, modelType }: { data: RunResult; modelType: ModelType }) {
  const ms = data.milestones as Record<string, unknown>;

  function fmtMs(v: unknown) {
    if (v === null || v === undefined) return "—";
    return `Month ${v}`;
  }

  const engine = getBaseEngine(modelType);
  const assumptions: [string, string][] =
    engine === "subscription"
      ? [
          ["Break-Even (P&L)", fmtMs(ms.break_even_month)],
          ["Cumulative Break-Even", fmtMs(ms.cumulative_break_even)],
          ["Cash-Flow Positive", fmtMs(ms.cf_positive_month)],
          ["Runway Out", fmtMs(ms.runway_out_month)],
          ["1,000 Users", fmtMs(ms.users_1000)],
          ["10,000 Users", fmtMs(ms.users_10000)],
          ["MRR $10K", fmtMs(ms.mrr_10000)],
          ["MRR $100K", fmtMs(ms.mrr_100000)],
        ]
      : engine === "ecommerce"
      ? [
          ["Break-Even (P&L)", fmtMs(ms.break_even_month)],
          ["Cumulative Break-Even", fmtMs(ms.cumulative_break_even)],
          ["Cash-Flow Positive", fmtMs(ms.cf_positive_month)],
          ["Runway Out", fmtMs(ms.runway_out_month)],
          ["Investment Payback", fmtMs(ms.investment_payback_month)],
        ]
      : [
          ["Break-Even (P&L)", fmtMs(ms.break_even_month)],
          ["Cumulative Break-Even", fmtMs(ms.cumulative_break_even)],
          ["Cash-Flow Positive", fmtMs(ms.cf_positive_month)],
          ["Runway Out", fmtMs(ms.runway_out_month)],
          ["50 Customers", fmtMs(ms.customers_50)],
          ["100 Customers", fmtMs(ms.customers_100)],
          ["ARR $100K", fmtMs(ms.arr_100000)],
          ["ARR $1M", fmtMs(ms.arr_1000000)],
        ];

  const half = Math.ceil(assumptions.length / 2);
  const left = assumptions.slice(0, half);
  const right = assumptions.slice(half);

  return (
    <div>
      <SectionHeader>Key Milestones</SectionHeader>
      <div className="grid grid-cols-2 gap-x-8">
        {[left, right].map((col, ci) => (
          <table key={ci} className="w-full text-xs border-collapse">
            <tbody>
              {col.map(([label, value]) => (
                <tr key={label} style={{ borderBottom: "1px solid #ECECF2" }}>
                  <td className="py-1.5 pr-2" style={{ color: "#8181A5" }}>
                    {label}
                  </td>
                  <td
                    className="py-1.5 text-right font-semibold"
                    style={{ color: "#1C1D21" }}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InvestorReport({
  projectName,
  modelType,
  data,
  children,
}: InvestorReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const df = data.dataframe as Record<string, number>[];
  const firstMonth = df.length ? num(df[0]["Month"]) : 1;
  const lastMonth = df.length ? num(df[df.length - 1]["Month"]) : 1;

  async function handleDownload() {
    setExporting(true);
    try {
      await exportToPDF(
        reportRef,
        `${projectName.replace(/\s+/g, "-")}-investor-report`
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      {/* Download button — outside the captured ref */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
          style={{
            backgroundColor: getModelColor(modelType),
            color: "#ffffff",
          }}
        >
          {exporting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Exporting…
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Printable report */}
      <div
        ref={reportRef}
        className="max-w-4xl mx-auto bg-white"
        style={{
          fontFamily: "'Lato', sans-serif",
          padding: "40px 48px",
          color: "#1C1D21",
        }}
      >
        {/* Report header */}
        <div
          className="flex items-start justify-between pb-5 mb-6"
          style={{ borderBottom: "2px solid #1C1D21" }}
        >
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#1C1D21" }}>
              {projectName}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8181A5" }}>
              Financial Investor Report · Month {firstMonth}–{lastMonth}
            </p>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full mt-1"
            style={{
              backgroundColor: getModelColor(modelType) + "1A",
              color: getModelColor(modelType),
              border: `1px solid ${getModelColor(modelType)}40`,
            }}
          >
            {getModelLabel(modelType)} Model
          </span>
        </div>

        {/* Shared sections — each data-pdf-page gets its own PDF page */}
        <div data-pdf-page>
          <ExecutiveSummary data={data} modelType={modelType} />
        </div>
        <Divider />
        <div data-pdf-page>
          <KeyAssumptions data={data} modelType={modelType} />
        </div>
        <Divider />
        <div data-pdf-page>
          <PnLOverview data={data} />
        </div>
        <Divider />
        <div data-pdf-page>
          <CashFlowSummary data={data} />
        </div>

        {/* Model-specific content */}
        {children && (
          <>
            <Divider />
            {children}
          </>
        )}
      </div>
    </div>
  );
}

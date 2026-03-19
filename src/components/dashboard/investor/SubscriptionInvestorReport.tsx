"use client";

import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import type { RunResult } from "@/lib/api";
import {
  InvestorReport,
  SectionHeader,
  Divider,
  KPIGrid,
  KPICard,
  CompactTable,
} from "./InvestorReport";
import { ReportChart, gradientArea, CHART_COLORS, DONUT_COLORS } from "./InvestorReport";

interface SubscriptionInvestorReportProps {
  projectName: string;
  data: RunResult;
}

function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function fmtMoney(v: unknown) {
  return formatCurrency(num(v));
}

// ─── MRR / ARR Table ─────────────────────────────────────────────────────────

function MrrArrTable({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const step = Math.max(1, Math.floor(df.length / 12));
  const rows = df
    .filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1)
    .slice(0, 12)
    .map((r) => [
      `Mo ${num(r["Month"]).toFixed(0)}`,
      fmtMoney(r["Total MRR"]),
      fmtMoney(num(r["Total MRR"]) * 12),
      fmtMoney(r["MRR Weekly"]),
      fmtMoney(r["MRR Monthly"]),
      fmtMoney(r["MRR Annual"]),
      `${num(r["Active Users"]).toFixed(0)}`,
    ]);

  return (
    <div>
      <SectionHeader>MRR / ARR Breakdown</SectionHeader>
      <CompactTable
        headers={["Month", "Total MRR", "ARR Run-Rate", "Weekly MRR", "Monthly MRR", "Annual MRR", "Active Users"]}
        rows={rows}
      />
    </div>
  );
}

// ─── Unit Economics ───────────────────────────────────────────────────────────

function UnitEconomics({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const last = df[df.length - 1];
  const avgLtvCac = df.reduce((s, r) => s + num(r["LTV/CAC"]), 0) / df.length;
  const avgCac = df.reduce((s, r) => s + num(r["CAC"]), 0) / df.length;
  const avgLtv = df.reduce((s, r) => s + num(r["LTV"]), 0) / df.length;

  // Payback: CAC / (ARPU * GrossMargin); estimate from data
  const arpu = num(last["ARPU"]);
  const gm = num(last["Gross Margin %"]); // stored as 0-1
  const paybackMonths =
    avgCac > 0 && arpu > 0 && gm > 0
      ? (avgCac / (arpu * gm)).toFixed(1)
      : "—";

  const churnRates = df
    .filter((r) => num(r["Month"]) > 1)
    .map((r) => num(r["Churn Rate"] ?? r["Churn Rate %"] ?? 0));
  const avgChurn =
    churnRates.length > 0
      ? churnRates.reduce((s, v) => s + v, 0) / churnRates.length
      : 0;

  return (
    <div>
      <SectionHeader>Unit Economics</SectionHeader>
      <KPIGrid>
        <KPICard
          label="Avg CAC"
          value={`$${avgCac.toFixed(2)}`}
          sub="cost to acquire 1 user"
        />
        <KPICard
          label="Avg LTV"
          value={`$${avgLtv.toFixed(2)}`}
          sub="lifetime value"
        />
        <KPICard
          label="LTV / CAC"
          value={`${avgLtvCac.toFixed(2)}x`}
          sub=">3x is healthy"
        />
        <KPICard
          label="CAC Payback"
          value={paybackMonths === "—" ? "—" : `${paybackMonths} mo`}
          sub="months to recover CAC"
        />
      </KPIGrid>
      <div className="mt-4">
        <ReportChart
          size="small"
          data={[{
            x: df.map((_, i) => i + 1),
            y: df.map(r => num(r["LTV/CAC"])),
            mode: "lines",
            name: "LTV/CAC",
            line: { color: CHART_COLORS.primary, width: 2.5, shape: "spline" },
          } as Plotly.Data]}
          layout={{ yaxis: { title: "Ratio" } }}
        />
      </div>
    </div>
  );
}

// ─── Churn Rate Summary ───────────────────────────────────────────────────────

function ChurnSummary({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const step = Math.max(1, Math.floor(df.length / 10));
  const rows = df
    .filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1)
    .slice(0, 10)
    .map((r) => {
      const churn =
        num(r["Churn Rate"] ?? r["Churn Rate %"] ?? 0);
      const churned = num(r["Churned Users"] ?? 0);
      const newUsers = num(r["New Users"] ?? 0);
      const active = num(r["Active Users"] ?? 0);
      const roas = num(r["Cumulative ROAS"] ?? r["ROAS"] ?? 0);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        `${(churn * 100).toFixed(2)}%`,
        formatNumber(churned),
        formatNumber(newUsers),
        formatNumber(active),
        `${roas.toFixed(1)}x`,
      ];
    });

  return (
    <div>
      <SectionHeader>Churn Rate Summary</SectionHeader>
      <CompactTable
        headers={["Month", "Churn Rate", "Churned Users", "New Users", "Active Users", "ROAS"]}
        rows={rows}
      />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SubscriptionInvestorReport({
  projectName,
  data,
}: SubscriptionInvestorReportProps) {
  return (
    <InvestorReport
      projectName={projectName}
      modelType="subscription"
      data={data}
    >
      <MrrArrTable data={data} />
      <Divider />
      <UnitEconomics data={data} />
      <Divider />
      <ChurnSummary data={data} />
    </InvestorReport>
  );
}

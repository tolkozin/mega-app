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
  ReportChart,
  gradientArea,
  CHART_COLORS,
  DONUT_COLORS,
} from "./InvestorReport";

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

// ─── Revenue Breakdown (was MrrArrTable) ─────────────────────────────────────

function RevenueBreakdown({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const first = df[0];
  const last = df[df.length - 1];
  const totalMrr = num(last["Total MRR"]);
  const arrRunRate = totalMrr * 12;
  const firstMrr = num(first["Total MRR"]);
  const mrrGrowth = firstMrr > 0 ? ((totalMrr - firstMrr) / firstMrr) * 100 : 0;
  const activeUsers = num(last["Active Users"]);

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
      <SectionHeader>Revenue Breakdown</SectionHeader>
      <KPIGrid>
        <KPICard
          label="Total MRR"
          value={formatCurrency(totalMrr)}
          sub="last month"
        />
        <KPICard
          label="ARR Run-Rate"
          value={formatCurrency(arrRunRate)}
          sub="MRR × 12"
        />
        <KPICard
          label="MRR Growth"
          value={formatPercent(mrrGrowth)}
          sub="first → last month"
        />
        <KPICard
          label="Active Users"
          value={formatNumber(activeUsers)}
          sub="last month"
        />
      </KPIGrid>
      <div className="mt-4">
        <ReportChart
          size="small"
          data={[{
            x: df.map((_, i) => i + 1),
            y: df.map(r => num(r["Total MRR"])),
            mode: "lines",
            name: "MRR",
            line: { color: CHART_COLORS.primary, width: 2.5, shape: "spline" },
            fill: "tozeroy",
            fillcolor: CHART_COLORS.primaryLight,
          } as Plotly.Data]}
          layout={{ yaxis: { title: "MRR ($)" } }}
        />
      </div>
      <div className="mt-4">
        <CompactTable
          headers={["Month", "Total MRR", "ARR Run-Rate", "Weekly MRR", "Monthly MRR", "Annual MRR", "Active Users"]}
          rows={rows}
        />
      </div>
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
      <div className="mt-4">
        <CompactTable
          headers={["Month", "LTV", "CAC", "LTV/CAC", "ARPU", "Gross Margin"]}
          rows={(() => {
            const step = Math.max(1, Math.floor(df.length / 10));
            return df
              .filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1)
              .slice(0, 10)
              .map((r) => [
                `Mo ${num(r["Month"]).toFixed(0)}`,
                fmtMoney(r["LTV"]),
                fmtMoney(r["CAC"]),
                `${num(r["LTV/CAC"]).toFixed(2)}x`,
                fmtMoney(r["ARPU"]),
                formatPercent(num(r["Gross Margin %"] ?? r["Gross Margin"]) * 100),
              ]);
          })()}
        />
      </div>
    </div>
  );
}

// ─── Churn Rate Summary ───────────────────────────────────────────────────────

function ChurnSummary({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const churnRates = df
    .filter((r) => num(r["Month"]) > 1)
    .map((r) => num(r["Churn Rate"] ?? r["Churn Rate %"] ?? 0));
  const avgChurnRate =
    churnRates.length > 0
      ? (churnRates.reduce((s, v) => s + v, 0) / churnRates.length) * 100
      : 0;
  const totalChurned = df.reduce((s, r) => s + num(r["Churned Users"] ?? 0), 0);
  const last = df[df.length - 1];
  const first = df[0];
  const endRoas = num(last["Cumulative ROAS"] ?? last["ROAS"] ?? 0);
  const netUserGrowth = num(last["Active Users"]) - num(first["Active Users"]);

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
      <KPIGrid>
        <KPICard
          label="Avg Monthly Churn"
          value={formatPercent(avgChurnRate)}
          sub="average across all months"
        />
        <KPICard
          label="Total Churned Users"
          value={formatNumber(totalChurned)}
          sub="cumulative"
        />
        <KPICard
          label="End-Period ROAS"
          value={`${endRoas.toFixed(1)}x`}
          sub="cumulative return on ad spend"
        />
        <KPICard
          label="Net User Growth"
          value={formatNumber(netUserGrowth)}
          sub="last − first month"
        />
      </KPIGrid>
      <div className="mt-4">
        <ReportChart
          size="small"
          data={[{
            x: df.map((_, i) => i + 1),
            y: df.map(r => num(r["Churn Rate"] ?? r["Churn Rate %"] ?? 0) * 100),
            mode: "lines",
            name: "Churn Rate",
            line: { color: CHART_COLORS.red, width: 2.5, shape: "spline" },
          } as Plotly.Data]}
          layout={{ yaxis: { title: "Churn Rate (%)" } }}
        />
      </div>
      <div className="mt-4">
        <CompactTable
          headers={["Month", "Churn Rate", "Churned Users", "New Users", "Active Users", "ROAS"]}
          rows={rows}
        />
      </div>
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
      <div data-pdf-page>
        <RevenueBreakdown data={data} />
      </div>
      <Divider />
      <div data-pdf-page>
        <UnitEconomics data={data} />
      </div>
      <Divider />
      <div data-pdf-page>
        <ChurnSummary data={data} />
      </div>
    </InvestorReport>
  );
}

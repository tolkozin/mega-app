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
  CHART_COLORS,
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
  const activeUsers = num(last["Total Active Users"]);

  const step = Math.max(1, Math.floor(df.length / 12));
  const filtered = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
  const sampledDf = filtered.length > 12
    ? [...filtered.slice(0, 11), filtered[filtered.length - 1]]
    : filtered;
  const rows = sampledDf.map((r) => [
      `Mo ${num(r["Month"]).toFixed(0)}`,
      fmtMoney(r["Total MRR"]),
      fmtMoney(num(r["Total MRR"]) * 12),
      fmtMoney(r["MRR Weekly"]),
      fmtMoney(r["MRR Monthly"]),
      fmtMoney(r["MRR Annual"]),
      `${num(r["Total Active Users"]).toFixed(0)}`,
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
      <div className="mt-3">
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
      <div className="mt-3">
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
  const avgCac = df.reduce((s, r) => s + num(r["Blended CAC"]), 0) / df.length;
  const avgLtv = df.reduce((s, r) => s + num(r["LTV"]), 0) / df.length;

  // Payback: CAC / (ARPU * GrossMargin); estimate from data
  const arpu = num(last["ARPU"]);
  const gm = num(last["Gross Margin %"]); // stored as 0-1
  const paybackMonths =
    avgCac > 0 && arpu > 0 && gm > 0
      ? (avgCac / (arpu * gm)).toFixed(1)
      : "—";

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
      <div className="mt-3">
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
      <div className="mt-3">
        <CompactTable
          headers={["Month", "LTV", "CAC", "LTV/CAC", "ARPU", "Gross Margin"]}
          rows={(() => {
            const step = Math.max(1, Math.floor(df.length / 10));
            const filtered = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
            const sampled = filtered.length > 10
              ? [...filtered.slice(0, 9), filtered[filtered.length - 1]]
              : filtered;
            return sampled.map((r) => [
                `Mo ${num(r["Month"]).toFixed(0)}`,
                fmtMoney(r["LTV"]),
                fmtMoney(r["Blended CAC"]),
                `${num(r["LTV/CAC"]).toFixed(2)}x`,
                fmtMoney(r["ARPU"]),
                formatPercent(num(r["Gross Margin %"]) * 100),
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

  const blendedChurns = df
    .filter((r) => num(r["Month"]) > 1)
    .map((r) => num(r["Blended Churn"]));
  const avgChurnRate =
    blendedChurns.length > 0
      ? (blendedChurns.reduce((s, v) => s + v, 0) / blendedChurns.length) * 100
      : 0;
  const last = df[df.length - 1];
  const first = df[0];
  const endCRR = num(last["CRR %"]);
  const endNRR = num(last["NRR %"]);
  const netUserGrowth = num(last["Total Active Users"]) - num(first["Total Active Users"]);

  const step = Math.max(1, Math.floor(df.length / 10));
  const filtered = df.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1);
  const sampled = filtered.length > 10
    ? [...filtered.slice(0, 9), filtered[filtered.length - 1]]
    : filtered;
  const rows = sampled.map((r) => {
      const monthlyChurn = num(r["Monthly Churn %"]);
      const crr = num(r["CRR %"]);
      const newUsers = num(r["New Paid Users"]);
      const active = num(r["Total Active Users"]);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        formatPercent(monthlyChurn),
        formatPercent(crr),
        formatNumber(newUsers),
        formatNumber(active),
      ];
    });

  return (
    <div>
      <SectionHeader>Churn & Retention Summary</SectionHeader>
      <KPIGrid>
        <KPICard
          label="Avg Monthly Churn"
          value={formatPercent(avgChurnRate)}
          sub="blended across all months"
        />
        <KPICard
          label="End CRR"
          value={formatPercent(endCRR)}
          sub="customer retention rate"
        />
        <KPICard
          label="End NRR"
          value={formatPercent(endNRR)}
          sub="net revenue retention"
        />
        <KPICard
          label="Net User Growth"
          value={formatNumber(netUserGrowth)}
          sub="last − first month"
        />
      </KPIGrid>
      <div className="mt-3">
        <ReportChart
          size="small"
          data={[{
            x: df.map((_, i) => i + 1),
            y: df.map(r => num(r["Monthly Churn %"])),
            mode: "lines",
            name: "Monthly Churn %",
            line: { color: CHART_COLORS.red, width: 2.5, shape: "spline" },
          } as Plotly.Data]}
          layout={{ yaxis: { title: "Monthly Churn (%)" } }}
        />
      </div>
      <div className="mt-3">
        <CompactTable
          headers={["Month", "Monthly Churn", "CRR %", "New Users", "Active Users"]}
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

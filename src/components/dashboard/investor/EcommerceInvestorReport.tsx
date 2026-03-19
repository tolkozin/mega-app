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

interface EcommerceInvestorReportProps {
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

// ─── GMV Summary ──────────────────────────────────────────────────────────────

function GmvSummary({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const last = df[df.length - 1];

  const totalGmv = df.reduce(
    (s, r) => s + num(r["Gross Revenue"] ?? r["Total GMV"] ?? 0),
    0
  );
  const totalOrders = df.reduce((s, r) => s + num(r["Total Orders"]), 0);
  const avgAov = totalOrders > 0 ? totalGmv / totalOrders : 0;
  const totalProfit = df.reduce((s, r) => s + num(r["Net Profit"]), 0);
  const endGM = num(last["Gross Margin %"]);

  return (
    <div>
      <SectionHeader>GMV Summary</SectionHeader>
      <KPIGrid>
        <KPICard
          label="Total GMV"
          value={fmtMoney(totalGmv)}
          sub="gross merchandise value"
        />
        <KPICard
          label="Total Orders"
          value={formatNumber(totalOrders)}
          sub="all channels"
        />
        <KPICard
          label="Avg AOV"
          value={`$${avgAov.toFixed(2)}`}
          sub="average order value"
        />
        <KPICard
          label="Net Profit"
          value={fmtMoney(totalProfit)}
          sub={endGM ? `${formatPercent(endGM * 100)} gross margin` : undefined}
        />
      </KPIGrid>
      <div className="mt-4">
        <ReportChart
          size="small"
          data={[
            gradientArea(
              df.map((_, i) => i + 1),
              df.map(r => num(r["Gross Revenue"])),
              "Revenue",
              CHART_COLORS.primary,
              CHART_COLORS.primaryLight,
            ) as Plotly.Data,
          ]}
          layout={{}}
        />
      </div>
    </div>
  );
}

// ─── AOV and Conversion Trends ────────────────────────────────────────────────

function AovConversionTable({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const step = Math.max(1, Math.floor(df.length / 12));
  const rows = df
    .filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1)
    .slice(0, 12)
    .map((r) => {
      const aov = num(r["Effective AOV"] ?? r["AOV"]);
      const orders = num(r["Total Orders"]);
      const rev = num(r["Gross Revenue"]);
      const gm = num(r["Gross Margin %"]);
      const roas = num(r["ROAS"] ?? r["Cumulative ROAS"]);
      const roi = num(r["ROI %"]);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        `$${aov.toFixed(2)}`,
        formatNumber(orders),
        fmtMoney(rev),
        gm ? formatPercent(gm * 100) : "—",
        `${roas.toFixed(1)}x`,
        `${roi.toFixed(0)}%`,
      ];
    });

  return (
    <div>
      <SectionHeader>AOV & Conversion Trends</SectionHeader>
      <CompactTable
        headers={["Month", "AOV", "Orders", "Revenue", "Gross Margin", "ROAS", "ROI"]}
        rows={rows}
      />
    </div>
  );
}

// ─── Customer Acquisition Summary ────────────────────────────────────────────

function CustomerAcquisitionSummary({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const last = df[df.length - 1];

  const avgCac = df.reduce((s, r) => s + num(r["CAC"]), 0) / df.length;
  const avgLtv = df.reduce((s, r) => s + num(r["LTV"]), 0) / df.length;
  const avgLtvCac =
    df.reduce((s, r) => s + num(r["LTV/CAC"]), 0) / df.length;
  const totalAdSpend = df.reduce((s, r) => s + num(r["Ad Spend"]), 0);
  const totalOrganicSpend = df.reduce(
    (s, r) => s + num(r["Organic Spend"] ?? 0),
    0
  );
  const endRoas = num(last["Cumulative ROAS"] ?? last["ROAS"]);

  return (
    <div>
      <SectionHeader>Customer Acquisition Summary</SectionHeader>
      <KPIGrid>
        <KPICard
          label="Avg CAC"
          value={`$${avgCac.toFixed(2)}`}
          sub="blended paid + organic"
        />
        <KPICard
          label="Avg LTV"
          value={`$${avgLtv.toFixed(2)}`}
          sub="customer lifetime value"
        />
        <KPICard
          label="LTV / CAC"
          value={`${avgLtvCac.toFixed(2)}x`}
          sub=">3x is healthy"
        />
        <KPICard
          label="Total Ad Spend"
          value={fmtMoney(totalAdSpend)}
          sub={
            totalOrganicSpend > 0
              ? `+${fmtMoney(totalOrganicSpend)} organic`
              : undefined
          }
        />
      </KPIGrid>

      {/* Compact channel breakdown */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div
          className="rounded-lg p-3 text-xs"
          style={{ border: "1px solid #ECECF2" }}
        >
          <p className="font-semibold mb-1" style={{ color: "#8181A5" }}>
            End-Period ROAS
          </p>
          <p className="text-xl font-bold" style={{ color: "#1C1D21" }}>
            {endRoas.toFixed(1)}x
          </p>
        </div>
        <div
          className="rounded-lg p-3 text-xs"
          style={{ border: "1px solid #ECECF2" }}
        >
          <p className="font-semibold mb-1" style={{ color: "#8181A5" }}>
            End-Period Runway
          </p>
          <p className="text-xl font-bold" style={{ color: "#1C1D21" }}>
            {num(last["Runway (Months)"]) > 0
              ? `${formatNumber(num(last["Runway (Months)"]))} mo`
              : "\u221e"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Gross Margin Table ───────────────────────────────────────────────────────

function GrossMarginTable({ data }: { data: RunResult }) {
  const df = data.dataframe as Record<string, number>[];
  if (!df.length) return null;

  const step = Math.max(1, Math.floor(df.length / 10));
  const rows = df
    .filter((_, i) => i === 0 || (i + 1) % step === 0 || i === df.length - 1)
    .slice(0, 10)
    .map((r) => {
      const rev = num(r["Gross Revenue"]);
      const cogs = num(r["COGS"]);
      const gp = rev - cogs;
      const gm = num(r["Gross Margin %"]);
      const netMargin = num(r["Net Margin %"] ?? 0);
      const netProfit = num(r["Net Profit"]);
      return [
        `Mo ${num(r["Month"]).toFixed(0)}`,
        fmtMoney(rev),
        fmtMoney(cogs),
        fmtMoney(gp),
        gm ? formatPercent(gm * 100) : "—",
        fmtMoney(netProfit),
        netMargin ? formatPercent(netMargin * 100) : "—",
      ];
    });

  return (
    <div>
      <SectionHeader>Gross Margin Analysis</SectionHeader>
      <CompactTable
        headers={["Month", "Revenue", "COGS", "Gross Profit", "GM%", "Net Profit", "Net Margin"]}
        rows={rows}
      />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function EcommerceInvestorReport({
  projectName,
  data,
}: EcommerceInvestorReportProps) {
  return (
    <InvestorReport
      projectName={projectName}
      modelType="ecommerce"
      data={data}
    >
      <div data-pdf-page>
        <GmvSummary data={data} />
      </div>
      <Divider />
      <div data-pdf-page>
        <CustomerAcquisitionSummary data={data} />
      </div>
      <Divider />
      <div data-pdf-page>
        <AovConversionTable data={data} />
      </div>
      <Divider />
      <div data-pdf-page>
        <GrossMarginTable data={data} />
      </div>
    </InvestorReport>
  );
}

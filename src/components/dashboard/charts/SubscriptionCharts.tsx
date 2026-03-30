"use client";

import { memo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { RunResult } from "@/lib/api";

import { V2GradientAreaChart } from "@/components/v2/charts/V2GradientAreaChart";
import { V2MultiLineChart } from "@/components/v2/charts/V2MultiLineChart";
import { V2StackedBarChart } from "@/components/v2/charts/V2StackedBarChart";
import { V2SingleBarChart } from "@/components/v2/charts/V2SingleBarChart";
import { V2RelativeBarChart } from "@/components/v2/charts/V2RelativeBarChart";
import { V2DonutChart } from "@/components/v2/charts/V2DonutChart";
import { V2DualAxisChart } from "@/components/v2/charts/V2DualAxisChart";
import { V2LineReferenceChart } from "@/components/v2/charts/V2LineReferenceChart";
import { PALETTE, fmtK, fmtNum } from "@/components/v2/charts/v2-chart-utils";

interface ChartsProps {
  results: Record<string, RunResult>;
  p1End: number;
  p2End: number;
}

function getCol(data: Record<string, unknown>[], col: string): number[] {
  return data.map((r) => (r[col] as number) ?? 0);
}
function getMonths(data: Record<string, unknown>[]): number[] {
  return data.map((r) => r["Month"] as number);
}

export const SubscriptionCharts = memo(function SubscriptionCharts({ results, p1End, p2End }: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const phases = [p1End, p2End];

  /* Total MRR = Weekly + Monthly + Annual */
  const totalMrrBase = getCol(base, "MRR Weekly").map((v, i) => v + getCol(base, "MRR Monthly")[i] + getCol(base, "MRR Annual")[i]);
  const totalMrrPess = getCol(pess, "MRR Weekly").map((v, i) => v + getCol(pess, "MRR Monthly")[i] + getCol(pess, "MRR Annual")[i]);
  const totalMrrOpt = getCol(opt, "MRR Weekly").map((v, i) => v + getCol(opt, "MRR Monthly")[i] + getCol(opt, "MRR Annual")[i]);

  /* Last-month MRR values for donut */
  const lastIdx = base.length - 1;
  const lastMrrWeekly = (base[lastIdx]?.["MRR Weekly"] as number) ?? 0;
  const lastMrrMonthly = (base[lastIdx]?.["MRR Monthly"] as number) ?? 0;
  const lastMrrAnnual = (base[lastIdx]?.["MRR Annual"] as number) ?? 0;

  /* Churned users (negative values) */
  const churnedUsers = getCol(base, "Total Active Users").map(
    (v, i) => -(Math.abs(v * (getCol(base, "Blended Churn")[i] ?? 0)))
  );

  return (
    <Tabs defaultValue="revenue">
      <TabsList>
        <TabsTrigger value="revenue">Revenue Overview</TabsTrigger>
        <TabsTrigger value="unit">Unit Economics</TabsTrigger>
        <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
      </TabsList>

      {/* ── Revenue Overview ─────────────────────────────────── */}
      <TabsContent value="revenue">
        {/* Hero MRR chart — full width */}
        <V2GradientAreaChart
          title="MRR by Subscription Plan"
          subtitle="Monthly Recurring Revenue with scenario comparison"
          data={totalMrrBase}
          pessimistic={totalMrrPess}
          optimistic={totalMrrOpt}
          months={months}
          phaseLines={phases}
          formatter={fmtK}
        />

        {/* 2-col row: Donut + Cash Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <V2DonutChart
            title="Revenue Breakdown"
            subtitle="Last month MRR split by plan"
            segments={[
              { label: "Annual", value: lastMrrAnnual, color: PALETTE.dkBlue },
              { label: "Monthly", value: lastMrrMonthly, color: PALETTE.ltBlue },
              { label: "Weekly", value: lastMrrWeekly, color: PALETTE.paleBlue },
            ]}
            centerLabel={fmtK(lastMrrWeekly + lastMrrMonthly + lastMrrAnnual)}
            centerSub="Total MRR"
          />

          <V2SingleBarChart
            title="Cash Balance"
            subtitle="Cash on hand across 3 scenarios"
            data={getCol(base, "Cash Balance")}
            months={months}
            color={PALETTE.blue}
            dataLabel="Cash Balance"
            formatter={fmtK}
          />
        </div>

        {/* Active Users — full width */}
        <div className="mt-4">
          <V2GradientAreaChart
            title="Active Users"
            subtitle="Total active subscribers"
            data={getCol(base, "Total Active Users")}
            pessimistic={getCol(pess, "Total Active Users")}
            optimistic={getCol(opt, "Total Active Users")}
            months={months}
            phaseLines={phases}
            formatter={fmtNum}
          />
        </div>
      </TabsContent>

      {/* ── Unit Economics ────────────────────────────────────── */}
      <TabsContent value="unit">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <V2MultiLineChart
            title="LTV / CAC Ratio"
            subtitle="Lifetime Value to Customer Acquisition Cost ratio"
            data={getCol(base, "LTV/CAC")}
            pessimistic={getCol(pess, "LTV/CAC")}
            optimistic={getCol(opt, "LTV/CAC")}
            months={months}
            phaseLines={phases}
            formatter={(v: number) => v.toFixed(1) + "x"}
            metricName="LTV/CAC"
          />

          <V2MultiLineChart
            title="ARPU"
            subtitle="Average Revenue Per User"
            data={getCol(base, "ARPU")}
            pessimistic={getCol(pess, "ARPU")}
            optimistic={getCol(opt, "ARPU")}
            months={months}
            phaseLines={phases}
            formatter={fmtK}
            metricName="ARPU"
          />

          <V2MultiLineChart
            title="CAC"
            subtitle="Customer Acquisition Cost"
            data={getCol(base, "Blended CAC")}
            pessimistic={getCol(pess, "Blended CAC")}
            optimistic={getCol(opt, "Blended CAC")}
            months={months}
            phaseLines={phases}
            formatter={fmtK}
            metricName="CAC"
          />

          <V2MultiLineChart
            title="Gross Margin %"
            subtitle="Gross Margin percentage over time"
            data={getCol(base, "Gross Margin %").map((v) => v * 100)}
            pessimistic={getCol(pess, "Gross Margin %").map((v) => v * 100)}
            optimistic={getCol(opt, "Gross Margin %").map((v) => v * 100)}
            months={months}
            phaseLines={phases}
            formatter={(v: number) => v.toFixed(1) + "%"}
            metricName="Gross Margin"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <V2RelativeBarChart
            title="New vs Churned Users"
            subtitle="Monthly new acquisitions vs churned users"
            positive={{ data: getCol(base, "New Paid Users"), label: "New Paid" }}
            negative={{ data: churnedUsers, label: "Churned" }}
            months={months}
          />

          <V2GradientAreaChart
            title="Cumulative ROAS"
            subtitle="Return on Ad Spend over time"
            data={getCol(base, "Cumulative ROAS")}
            months={months}
            phaseLines={phases}
            formatter={(v: number) => v.toFixed(2) + "x"}
          />
        </div>
      </TabsContent>

      {/* ── Profit & Loss ────────────────────────────────────── */}
      <TabsContent value="pnl">
        {/* Full-width Net Profit */}
        <V2MultiLineChart
          title="Net Profit"
          subtitle="Monthly net profit across scenarios"
          data={getCol(base, "Net Profit")}
          pessimistic={getCol(pess, "Net Profit")}
          optimistic={getCol(opt, "Net Profit")}
          months={months}
          phaseLines={phases}
          formatter={fmtK}
          metricName="Net Profit"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <V2GradientAreaChart
            title="Cumulative Profit"
            subtitle="Running total profit/loss"
            data={getCol(base, "Cumulative Net Profit")}
            pessimistic={getCol(pess, "Cumulative Net Profit")}
            optimistic={getCol(opt, "Cumulative Net Profit")}
            months={months}
            phaseLines={phases}
            formatter={fmtK}
          />

          <V2StackedBarChart
            title="Revenue vs Costs"
            subtitle="Total revenue vs total costs breakdown"
            segments={[
              { label: "Revenue", data: getCol(base, "Total Gross Revenue"), color: PALETTE.green },
              { label: "OpEx", data: getCol(base, "Total Expenses"), color: PALETTE.red },
              { label: "Ad Spend", data: getCol(base, "Ad Budget"), color: PALETTE.amber },
            ]}
            months={months}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <V2LineReferenceChart
            title="ROI %"
            subtitle="Cumulative Return on Investment"
            data={getCol(base, "ROI %")}
            reference={0}
            referenceLabel="Break-even"
            months={months}
            color={PALETTE.blue}
            unit="%"
            metricLabel="ROI"
            goodAbove={true}
            formatter={(v: number) => v.toFixed(1) + "%"}
          />

          <V2DualAxisChart
            title="Burn Rate & Runway"
            subtitle="Monthly burn rate and remaining runway in months"
            leftData={getCol(base, "Burn Rate")}
            rightData={getCol(base, "Runway (Months)")}
            months={months}
            leftLabel="Burn Rate ($)"
            rightLabel="Runway (months)"
            leftColor={PALETTE.red}
            rightColor={PALETTE.teal}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4 max-w-lg">
          <V2MultiLineChart
            title="LTV"
            subtitle="Customer Lifetime Value"
            data={getCol(base, "LTV")}
            pessimistic={getCol(pess, "LTV")}
            optimistic={getCol(opt, "LTV")}
            months={months}
            phaseLines={phases}
            formatter={fmtK}
            metricName="LTV"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
});

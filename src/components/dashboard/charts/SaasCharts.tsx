"use client";

import { memo } from "react";
import { V2GradientAreaChart } from "@/components/v2/charts/V2GradientAreaChart";
import { V2MultiLineChart } from "@/components/v2/charts/V2MultiLineChart";
import { V2StackedBarChart } from "@/components/v2/charts/V2StackedBarChart";
import { V2SingleBarChart } from "@/components/v2/charts/V2SingleBarChart";
import { V2RelativeBarChart } from "@/components/v2/charts/V2RelativeBarChart";
import { V2DonutChart } from "@/components/v2/charts/V2DonutChart";
import { V2DualAxisChart } from "@/components/v2/charts/V2DualAxisChart";
import { V2LineReferenceChart } from "@/components/v2/charts/V2LineReferenceChart";
import { PALETTE } from "@/components/v2/charts/v2-chart-utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { RunResult } from "@/lib/api";

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

export const SaasCharts = memo(function SaasCharts({ results, p1End, p2End }: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const phases = [p1End, p2End];

  const lastLeads = getCol(base, "Total Leads").at(-1) ?? 0;
  const lastDemos = getCol(base, "Demos").at(-1) ?? 0;
  const lastDeals = getCol(base, "New Deals").at(-1) ?? 0;

  return (
    <Tabs defaultValue="revenue" className="w-full">
      <TabsList>
        <TabsTrigger value="revenue">Revenue Overview</TabsTrigger>
        <TabsTrigger value="unit">Unit Economics</TabsTrigger>
        <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
      </TabsList>

      {/* ── Revenue Overview ── */}
      <TabsContent value="revenue" className="space-y-4">
        <V2GradientAreaChart
          title="ARR"
          subtitle="Annual Recurring Revenue across scenarios"
          data={getCol(base, "ARR")}
          pessimistic={getCol(pess, "ARR")}
          optimistic={getCol(opt, "ARR")}
          months={months}
          phaseLines={phases}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <V2DonutChart
            title="Pipeline Funnel"
            subtitle="Last-month lead distribution"
            segments={[
              { label: "Leads", value: lastLeads, color: PALETTE.blue },
              { label: "Demos", value: lastDemos, color: PALETTE.green },
              { label: "Deals", value: lastDeals, color: PALETTE.amber },
            ]}
          />

          <V2SingleBarChart
            title="Active Customers"
            subtitle="Number of active customer accounts"
            data={getCol(base, "Active Customers")}
            months={months}
            color={PALETTE.blue}
            dataLabel="Customers"
          />

          <V2GradientAreaChart
            title="Active Seats"
            subtitle="Total active seats across all customers"
            data={getCol(base, "Active Seats")}
            months={months}
            phaseLines={phases}
          />
        </div>

        <V2StackedBarChart
          title="Pipeline: Leads / Demos / Deals"
          subtitle="Monthly sales funnel"
          segments={[
            { label: "Leads", data: getCol(base, "Total Leads"), color: PALETTE.blue },
            { label: "Demos", data: getCol(base, "Demos"), color: PALETTE.green },
            { label: "Deals", data: getCol(base, "New Deals"), color: PALETTE.amber },
          ]}
          months={months}
        />
      </TabsContent>

      {/* ── Unit Economics ── */}
      <TabsContent value="unit" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2MultiLineChart
            title="CAC"
            subtitle="Customer Acquisition Cost"
            data={getCol(base, "CAC")}
            pessimistic={getCol(pess, "CAC")}
            optimistic={getCol(opt, "CAC")}
            months={months}
            phaseLines={phases}
            metricName="CAC"
          />

          <V2MultiLineChart
            title="LTV / CAC"
            subtitle="Lifetime Value to Acquisition Cost ratio"
            data={getCol(base, "LTV/CAC")}
            pessimistic={getCol(pess, "LTV/CAC")}
            optimistic={getCol(opt, "LTV/CAC")}
            months={months}
            phaseLines={phases}
            metricName="LTV/CAC"
            formatter={(v: number) => v.toFixed(1) + "\u00d7"}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2GradientAreaChart
            title="ARPA"
            subtitle="Average Revenue Per Account"
            data={getCol(base, "ARPA")}
            months={months}
            phaseLines={phases}
          />

          <V2LineReferenceChart
            title="NRR %"
            subtitle="Net Revenue Retention (100% baseline)"
            data={getCol(base, "NRR %")}
            reference={100}
            referenceLabel="100% baseline"
            months={months}
            color={PALETTE.blue}
            unit="%"
            metricLabel="NRR"
            goodAbove={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <V2RelativeBarChart
            title="New vs Churned Customers"
            subtitle="Monthly new deals vs churned accounts"
            positive={{ data: getCol(base, "New Deals"), label: "New Deals" }}
            negative={{ data: getCol(base, "Churned Customers").map((v) => -v), label: "Churned Customers" }}
            months={months}
          />

          <V2LineReferenceChart
            title="GRR %"
            subtitle="Gross Revenue Retention"
            data={getCol(base, "GRR %")}
            reference={100}
            referenceLabel="100% baseline"
            months={months}
            color={PALETTE.teal}
            unit="%"
            metricLabel="GRR"
            goodAbove={true}
          />

          <V2LineReferenceChart
            title="Quick Ratio"
            subtitle="(New + Expansion MRR) / (Contraction + Churned MRR)"
            data={getCol(base, "Quick Ratio")}
            reference={4}
            referenceLabel="4.0 target"
            months={months}
            color={PALETTE.amber}
            unit={"\u00d7"}
            metricLabel="Quick Ratio"
            goodAbove={true}
          />
        </div>
      </TabsContent>

      {/* ── Profit & Loss ── */}
      <TabsContent value="pnl" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2MultiLineChart
            title="Net Profit"
            subtitle="Monthly net profit across scenarios"
            data={getCol(base, "Net Profit")}
            pessimistic={getCol(pess, "Net Profit")}
            optimistic={getCol(opt, "Net Profit")}
            months={months}
            phaseLines={phases}
            metricName="Net Profit"
          />

          <V2GradientAreaChart
            title="Cumulative Net Profit"
            subtitle="Running total of net profit"
            data={getCol(base, "Cumulative Net Profit")}
            pessimistic={getCol(pess, "Cumulative Net Profit")}
            optimistic={getCol(opt, "Cumulative Net Profit")}
            months={months}
            phaseLines={phases}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2LineReferenceChart
            title="Rule of 40"
            subtitle="Revenue Growth% + EBITDA Margin% (40% baseline)"
            data={getCol(base, "Rule of 40")}
            reference={40}
            referenceLabel="40% baseline"
            months={months}
            color={PALETTE.amber}
            unit=""
            metricLabel="Rule of 40"
            goodAbove={true}
          />

          <V2LineReferenceChart
            title="Magic Number"
            subtitle="Net New ARR (Q) / S&M (prior Q) — 1.0 baseline"
            data={getCol(base, "Magic Number")}
            reference={1}
            referenceLabel="1.0 baseline"
            months={months}
            color={PALETTE.purple}
            unit=""
            metricLabel="Magic Number"
            goodAbove={true}
          />
        </div>

        <V2DualAxisChart
          title="Burn Rate & Runway"
          subtitle="Monthly burn rate and remaining runway"
          leftData={getCol(base, "Burn Rate")}
          rightData={getCol(base, "Runway (Months)")}
          months={months}
          leftLabel="Burn Rate ($)"
          rightLabel="Runway (months)"
          leftColor={PALETTE.red}
          rightColor={PALETTE.blue}
        />
      </TabsContent>
    </Tabs>
  );
});

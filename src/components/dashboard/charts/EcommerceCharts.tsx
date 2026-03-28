"use client";

import { memo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { V2GradientAreaChart } from "@/components/v2/charts/V2GradientAreaChart";
import { V2MultiLineChart } from "@/components/v2/charts/V2MultiLineChart";
import { V2StackedBarChart } from "@/components/v2/charts/V2StackedBarChart";
import { V2SingleBarChart } from "@/components/v2/charts/V2SingleBarChart";
import { V2DonutChart } from "@/components/v2/charts/V2DonutChart";
import { V2DualAxisChart } from "@/components/v2/charts/V2DualAxisChart";
import { PALETTE } from "@/components/v2/charts/v2-chart-utils";
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

const fmtDollar = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
      ? `$${(v / 1_000).toFixed(0)}K`
      : `$${v.toFixed(0)}`;

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

export const EcommerceCharts = memo(function EcommerceCharts({
  results,
  p1End,
  p2End,
}: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const phases = [p1End, p2End];

  const lastIdx = base.length - 1;
  const lastPaidClicks = (base[lastIdx]["Paid Clicks"] as number) ?? 0;
  const lastOrganicPurchases =
    (base[lastIdx]["Organic Purchases"] as number) ?? 0;

  return (
    <Tabs defaultValue="revenue" className="space-y-4">
      <TabsList>
        <TabsTrigger value="revenue">Revenue Overview</TabsTrigger>
        <TabsTrigger value="unit">Unit Economics</TabsTrigger>
        <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
      </TabsList>

      {/* ── Revenue Overview ───────────────────────────────────── */}
      <TabsContent value="revenue" className="space-y-4">
        <V2GradientAreaChart
          title="Gross Revenue"
          subtitle="Total gross revenue with scenario projections"
          data={getCol(base, "Gross Revenue")}
          pessimistic={getCol(pess, "Gross Revenue")}
          optimistic={getCol(opt, "Gross Revenue")}
          months={months}
          phaseLines={phases}
          formatter={fmtDollar}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2DonutChart
            title="Traffic Split"
            subtitle="Paid vs Organic — last month"
            segments={[
              {
                label: "Paid Clicks",
                value: lastPaidClicks,
                color: PALETTE.blue,
              },
              {
                label: "Organic Purchases",
                value: lastOrganicPurchases,
                color: PALETTE.green,
              },
            ]}
            centerLabel={String(lastPaidClicks + lastOrganicPurchases)}
            centerSub="Total"
          />

          <V2SingleBarChart
            title="Total Orders"
            subtitle="Monthly order volume"
            data={getCol(base, "Total Orders")}
            months={months}
            color={PALETTE.blue}
            dataLabel="Orders"
          />
        </div>

        <V2SingleBarChart
          title="Cash Balance"
          subtitle="Cash on hand"
          data={getCol(base, "Cash Balance")}
          months={months}
          color={PALETTE.ltBlue}
          dataLabel="Cash"
          formatter={fmtDollar}
        />
      </TabsContent>

      {/* ── Unit Economics ─────────────────────────────────────── */}
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
            formatter={fmtDollar}
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
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2GradientAreaChart
            title="ROAS"
            subtitle="Return on Ad Spend"
            data={getCol(base, "ROAS")}
            months={months}
            phaseLines={phases}
          />

          <V2GradientAreaChart
            title="AOV Trend"
            subtitle="Average Order Value (effective)"
            data={getCol(base, "AOV")}
            months={months}
            phaseLines={phases}
            formatter={fmtDollar}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2StackedBarChart
            title="New vs Returning Customers"
            subtitle="Customer acquisition breakdown"
            segments={[
              {
                label: "New Customers",
                data: getCol(base, "New Customers"),
                color: PALETTE.blue,
              },
              {
                label: "Returning Orders",
                data: getCol(base, "Returning Orders"),
                color: PALETTE.green,
              },
            ]}
            months={months}
          />

          <V2StackedBarChart
            title="Traffic Sources"
            subtitle="Paid vs Organic traffic over time"
            segments={[
              {
                label: "Paid Clicks",
                data: getCol(base, "Paid Clicks"),
                color: PALETTE.blue,
              },
              {
                label: "Organic Purchases",
                data: getCol(base, "Organic Purchases"),
                color: PALETTE.green,
              },
            ]}
            months={months}
          />
        </div>
      </TabsContent>

      {/* ── P&L ───────────────────────────────────────────────── */}
      <TabsContent value="pnl" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2MultiLineChart
            title="Net Profit"
            subtitle="Net profit across scenarios"
            data={getCol(base, "Net Profit")}
            pessimistic={getCol(pess, "Net Profit")}
            optimistic={getCol(opt, "Net Profit")}
            months={months}
            phaseLines={phases}
            formatter={fmtDollar}
            metricName="Net Profit"
          />

          <V2GradientAreaChart
            title="Cumulative Profit"
            subtitle="Running total profit"
            data={getCol(base, "Cumulative Net Profit")}
            pessimistic={getCol(pess, "Cumulative Net Profit")}
            optimistic={getCol(opt, "Cumulative Net Profit")}
            months={months}
            phaseLines={phases}
            formatter={fmtDollar}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <V2GradientAreaChart
            title="Gross Margin %"
            subtitle="Gross margin percentage over time"
            data={getCol(base, "Gross Margin %").map((v) => v * 100)}
            months={months}
            phaseLines={phases}
            formatter={fmtPct}
          />

          <V2DualAxisChart
            title="Burn Rate & Runway"
            subtitle="Monthly burn and remaining runway"
            leftData={getCol(base, "Burn Rate")}
            rightData={getCol(base, "Runway (Months)")}
            months={months}
            leftLabel="Burn Rate ($)"
            rightLabel="Runway (months)"
            leftColor={PALETTE.red}
            rightColor={PALETTE.amber}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
});

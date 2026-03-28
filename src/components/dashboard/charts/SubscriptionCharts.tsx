"use client";

import { memo } from "react";
import { PlotlyChart, phaseLines, gradientArea, scenarioLines, CHART_COLORS, DONUT_COLORS } from "@/components/v2/charts/PlotlyChart";
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

export const SubscriptionCharts = memo(function SubscriptionCharts({ results, p1End, p2End }: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const shapes = phaseLines(p1End, p2End);

  /* Last-month MRR values for donut */
  const lastIdx = base.length - 1;
  const lastMrrWeekly = (base[lastIdx]?.["MRR Weekly"] as number) ?? 0;
  const lastMrrMonthly = (base[lastIdx]?.["MRR Monthly"] as number) ?? 0;
  const lastMrrAnnual = (base[lastIdx]?.["MRR Annual"] as number) ?? 0;

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
        <PlotlyChart
          title="MRR by Subscription Plan"
          description="Monthly Recurring Revenue with scenario comparison"
          size="hero"
          data={[
            gradientArea(months, getCol(base, "MRR Weekly"), "Weekly", CHART_COLORS.primary, CHART_COLORS.primaryLight) as Plotly.Data,
            gradientArea(months, getCol(base, "MRR Monthly"), "Monthly", CHART_COLORS.green, CHART_COLORS.greenLight) as Plotly.Data,
            gradientArea(months, getCol(base, "MRR Annual"), "Annual", CHART_COLORS.amber, CHART_COLORS.amberLight) as Plotly.Data,
            ...scenarioLines(months, getCol(base, "MRR Weekly").map((v, i) => v + getCol(base, "MRR Monthly")[i] + getCol(base, "MRR Annual")[i]), getCol(pess, "MRR Weekly").map((v, i) => v + getCol(pess, "MRR Monthly")[i] + getCol(pess, "MRR Annual")[i]), getCol(opt, "MRR Weekly").map((v, i) => v + getCol(opt, "MRR Monthly")[i] + getCol(opt, "MRR Annual")[i]), "Total MRR (Base)") as Plotly.Data[],
          ]}
          layout={{ shapes }}
        />

        {/* 3-col row: Donut, Cash Balance, Active Users */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <PlotlyChart
            title="Revenue Breakdown"
            description="Last month MRR split by plan"
            size="medium"
            data={[
              {
                values: [lastMrrWeekly, lastMrrMonthly, lastMrrAnnual],
                labels: ["Weekly", "Monthly", "Annual"],
                type: "pie",
                hole: 0.65,
                marker: { colors: DONUT_COLORS },
                textinfo: "percent",
                textfont: { size: 11, color: "#1C1D21" },
                hoverinfo: "label+value+percent",
              } as Plotly.Data,
            ]}
            layout={{ showlegend: true }}
          />

          <PlotlyChart
            title="Cash Balance"
            description="Cash on hand across 3 scenarios"
            size="medium"
            data={[
              {
                x: months,
                y: getCol(base, "Cash Balance"),
                type: "bar",
                name: "Base",
                marker: { color: CHART_COLORS.primaryLight },
              } as Plotly.Data,
              ...scenarioLines(months, getCol(base, "Cash Balance"), getCol(pess, "Cash Balance"), getCol(opt, "Cash Balance"), "Base (line)") as Plotly.Data[],
            ]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="Active Users"
            description="Total active subscribers"
            size="medium"
            data={[
              gradientArea(months, getCol(base, "Total Active Users"), "Base", CHART_COLORS.teal, CHART_COLORS.tealLight) as Plotly.Data,
              {
                x: months,
                y: getCol(pess, "Total Active Users"),
                mode: "lines",
                name: "Pessimistic",
                line: { dash: "dot", color: CHART_COLORS.red, width: 1.5 },
              } as Plotly.Data,
              {
                x: months,
                y: getCol(opt, "Total Active Users"),
                mode: "lines",
                name: "Optimistic",
                line: { dash: "dash", color: CHART_COLORS.green, width: 1.5 },
              } as Plotly.Data,
            ]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>

      {/* ── Unit Economics ────────────────────────────────────── */}
      <TabsContent value="unit">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="LTV / CAC Ratio"
            description="Lifetime Value to Customer Acquisition Cost ratio"
            size="medium"
            data={scenarioLines(months, getCol(base, "LTV/CAC"), getCol(pess, "LTV/CAC"), getCol(opt, "LTV/CAC")) as Plotly.Data[]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="ARPU"
            description="Average Revenue Per User"
            size="medium"
            data={scenarioLines(months, getCol(base, "ARPU"), getCol(pess, "ARPU"), getCol(opt, "ARPU")) as Plotly.Data[]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="CAC"
            description="Customer Acquisition Cost"
            size="medium"
            data={scenarioLines(months, getCol(base, "Blended CAC"), getCol(pess, "Blended CAC"), getCol(opt, "Blended CAC")) as Plotly.Data[]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="Gross Margin %"
            description="Gross Margin percentage over time"
            size="medium"
            data={scenarioLines(
              months,
              getCol(base, "Gross Margin %").map((v) => v * 100),
              getCol(pess, "Gross Margin %").map((v) => v * 100),
              getCol(opt, "Gross Margin %").map((v) => v * 100),
            ) as Plotly.Data[]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <PlotlyChart
            title="New vs Churned Users"
            description="Monthly new acquisitions vs churned users"
            size="medium"
            data={[
              {
                x: months,
                y: getCol(base, "New Paid Users"),
                type: "bar",
                name: "New Paid",
                marker: { color: CHART_COLORS.green },
              } as Plotly.Data,
              {
                x: months,
                y: getCol(base, "Total Active Users").map((v, i) => -(v * (getCol(base, "Blended Churn")[i] ?? 0))),
                type: "bar",
                name: "Churned",
                marker: { color: CHART_COLORS.red },
              } as Plotly.Data,
            ]}
            layout={{ barmode: "relative", shapes }}
          />

          <PlotlyChart
            title="Cumulative ROAS"
            description="Return on Ad Spend over time"
            size="medium"
            data={[
              gradientArea(months, getCol(base, "Cumulative ROAS"), "ROAS", CHART_COLORS.amber, CHART_COLORS.amberLight) as Plotly.Data,
            ]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>

      {/* ── Profit & Loss ────────────────────────────────────── */}
      <TabsContent value="pnl">
        {/* Full-width Net Profit */}
        <PlotlyChart
          title="Net Profit"
          description="Monthly net profit across scenarios"
          size="medium"
          data={scenarioLines(months, getCol(base, "Net Profit"), getCol(pess, "Net Profit"), getCol(opt, "Net Profit")) as Plotly.Data[]}
          layout={{ shapes }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <PlotlyChart
            title="Cumulative Profit"
            description="Running total profit/loss"
            size="medium"
            data={[
              gradientArea(months, getCol(base, "Cumulative Net Profit"), "Base", CHART_COLORS.primary, CHART_COLORS.primaryLight) as Plotly.Data,
              {
                x: months,
                y: getCol(pess, "Cumulative Net Profit"),
                mode: "lines",
                name: "Pessimistic",
                line: { dash: "dot", color: CHART_COLORS.red, width: 1.5 },
              } as Plotly.Data,
              {
                x: months,
                y: getCol(opt, "Cumulative Net Profit"),
                mode: "lines",
                name: "Optimistic",
                line: { dash: "dash", color: CHART_COLORS.green, width: 1.5 },
              } as Plotly.Data,
            ]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="Revenue vs Costs"
            description="Total revenue vs total costs breakdown"
            size="medium"
            data={[
              {
                x: months,
                y: getCol(base, "Total Gross Revenue"),
                type: "bar",
                name: "Revenue",
                marker: { color: CHART_COLORS.green },
              } as Plotly.Data,
              {
                x: months,
                y: getCol(base, "Total Expenses"),
                type: "bar",
                name: "OpEx",
                marker: { color: CHART_COLORS.red },
              } as Plotly.Data,
              {
                x: months,
                y: getCol(base, "Ad Budget"),
                type: "bar",
                name: "Ad Spend",
                marker: { color: CHART_COLORS.amber },
              } as Plotly.Data,
            ]}
            layout={{ barmode: "stack", shapes }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <PlotlyChart
            title="ROI %"
            description="Cumulative Return on Investment"
            size="small"
            data={[
              {
                x: months,
                y: getCol(base, "ROI %"),
                mode: "lines",
                name: "ROI %",
                line: { color: CHART_COLORS.purple, width: 2.5, shape: "spline" as const },
              } as Plotly.Data,
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />

          <PlotlyChart
            title="Burn Rate & Runway"
            description="Monthly burn rate and remaining runway in months"
            size="small"
            data={[
              {
                x: months,
                y: getCol(base, "Burn Rate"),
                mode: "lines",
                name: "Burn Rate ($)",
                line: { color: CHART_COLORS.red, width: 2 },
              } as Plotly.Data,
              {
                x: months,
                y: getCol(base, "Runway (Months)"),
                mode: "lines",
                name: "Runway (months)",
                yaxis: "y2",
                line: { color: CHART_COLORS.teal, width: 2, dash: "dash" },
              } as Plotly.Data,
            ]}
            layout={{
              shapes,
              yaxis: { title: "Burn Rate ($)" },
              yaxis2: { title: "Months", overlaying: "y", side: "right" },
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4 max-w-lg">
          <PlotlyChart
            title="LTV"
            description="Customer Lifetime Value"
            size="small"
            data={scenarioLines(months, getCol(base, "LTV"), getCol(pess, "LTV"), getCol(opt, "LTV")) as Plotly.Data[]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
});

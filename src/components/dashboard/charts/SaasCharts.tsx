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

export const SaasCharts = memo(function SaasCharts({ results, p1End, p2End }: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const shapes = phaseLines(p1End, p2End);

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

      <TabsContent value="revenue" className="space-y-4">
        <PlotlyChart
          title="ARR"
          description="Annual Recurring Revenue across scenarios"
          size="hero"
          data={[
            gradientArea(months, getCol(base, "ARR"), "Base", CHART_COLORS.primary, CHART_COLORS.primaryLight) as Plotly.Data,
            ...scenarioLines(months, getCol(base, "ARR"), getCol(pess, "ARR"), getCol(opt, "ARR")).slice(1) as Plotly.Data[],
          ]}
          layout={{ shapes }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlotlyChart
            title="Pipeline Funnel"
            description="Last-month lead distribution"
            size="medium"
            data={[
              {
                values: [lastLeads, lastDemos, lastDeals],
                labels: ["Leads", "Demos", "Deals"],
                type: "pie",
                hole: 0.65,
                marker: { colors: DONUT_COLORS },
                textinfo: "percent",
                textfont: { size: 11, color: "#1C1D21" },
                hoverinfo: "label+value+percent",
              } as Plotly.Data,
            ]}
          />

          <PlotlyChart
            title="Active Customers"
            description="Number of active customer accounts"
            size="medium"
            data={[
              {
                x: months,
                y: getCol(base, "Active Customers"),
                type: "bar",
                name: "Base",
                marker: { color: CHART_COLORS.primary },
              } as Plotly.Data,
              ...scenarioLines(months, getCol(base, "Active Customers"), getCol(pess, "Active Customers"), getCol(opt, "Active Customers")).slice(1) as Plotly.Data[],
            ]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="Active Seats"
            description="Total active seats across all customers"
            size="medium"
            data={[
              gradientArea(months, getCol(base, "Active Seats"), "Base", CHART_COLORS.teal, CHART_COLORS.tealLight) as Plotly.Data,
            ]}
            layout={{ shapes }}
          />
        </div>

        <PlotlyChart
          title="Pipeline: Leads / Demos / Deals"
          description="Monthly sales funnel"
          size="medium"
          data={[
            {
              x: months,
              y: getCol(base, "Total Leads"),
              type: "bar",
              name: "Leads",
              marker: { color: CHART_COLORS.primary },
            } as Plotly.Data,
            {
              x: months,
              y: getCol(base, "Demos"),
              type: "bar",
              name: "Demos",
              marker: { color: CHART_COLORS.green },
            } as Plotly.Data,
            {
              x: months,
              y: getCol(base, "New Deals"),
              type: "bar",
              name: "Deals",
              marker: { color: CHART_COLORS.amber },
            } as Plotly.Data,
          ]}
          layout={{ barmode: "group", shapes }}
        />
      </TabsContent>

      <TabsContent value="unit" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlotlyChart
            title="CAC"
            description="Customer Acquisition Cost"
            size="medium"
            data={scenarioLines(months, getCol(base, "CAC"), getCol(pess, "CAC"), getCol(opt, "CAC")) as Plotly.Data[]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="LTV / CAC"
            description="Lifetime Value to Acquisition Cost ratio"
            size="medium"
            data={scenarioLines(months, getCol(base, "LTV/CAC"), getCol(pess, "LTV/CAC"), getCol(opt, "LTV/CAC")) as Plotly.Data[]}
            layout={{ shapes }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlotlyChart
            title="ARPA"
            description="Average Revenue Per Account"
            size="medium"
            data={[
              {
                x: months,
                y: getCol(base, "ARPA"),
                mode: "lines",
                name: "ARPA",
                line: { color: CHART_COLORS.purple, width: 2.5, shape: "spline" },
              } as Plotly.Data,
            ]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="NRR %"
            description="Net Revenue Retention (100% baseline)"
            size="medium"
            data={[
              {
                x: months,
                y: getCol(base, "NRR %"),
                mode: "lines",
                name: "NRR %",
                line: { color: CHART_COLORS.primary, width: 2.5, shape: "spline" },
              } as Plotly.Data,
              {
                x: months,
                y: months.map(() => 100),
                mode: "lines",
                name: "100% baseline",
                line: { dash: "dash", color: CHART_COLORS.muted, width: 1 },
              } as Plotly.Data,
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlotlyChart
            title="New vs Churned Customers"
            description="Monthly new deals vs churned accounts"
            size="small"
            data={[
              {
                x: months,
                y: getCol(base, "New Deals"),
                type: "bar",
                name: "New Deals",
                marker: { color: CHART_COLORS.green },
              } as Plotly.Data,
              {
                x: months,
                y: getCol(base, "Churned Customers").map((v) => -v),
                type: "bar",
                name: "Churned",
                marker: { color: CHART_COLORS.red },
              } as Plotly.Data,
            ]}
            layout={{ barmode: "relative", shapes }}
          />

          <PlotlyChart
            title="GRR %"
            description="Gross Revenue Retention"
            size="small"
            data={[
              {
                x: months,
                y: getCol(base, "GRR %"),
                mode: "lines",
                name: "GRR %",
                line: { color: CHART_COLORS.teal, width: 2.5, shape: "spline" },
              } as Plotly.Data,
              {
                x: months,
                y: months.map(() => 100),
                mode: "lines",
                name: "100% baseline",
                line: { dash: "dash", color: CHART_COLORS.muted, width: 1 },
              } as Plotly.Data,
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />

          <PlotlyChart
            title="Quick Ratio"
            description="(New + Expansion MRR) / (Contraction + Churned MRR)"
            size="small"
            data={[
              {
                x: months,
                y: getCol(base, "Quick Ratio"),
                mode: "lines",
                name: "Quick Ratio",
                line: { color: CHART_COLORS.amber, width: 2.5, shape: "spline" },
              } as Plotly.Data,
            ]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>

      <TabsContent value="pnl" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlotlyChart
            title="Net Profit"
            description="Monthly net profit across scenarios"
            size="medium"
            data={[
              {
                x: months,
                y: getCol(base, "Net Profit"),
                type: "bar",
                name: "Base",
                marker: { color: CHART_COLORS.primary },
              } as Plotly.Data,
              ...scenarioLines(months, getCol(base, "Net Profit"), getCol(pess, "Net Profit"), getCol(opt, "Net Profit")).slice(1) as Plotly.Data[],
            ]}
            layout={{ shapes }}
          />

          <PlotlyChart
            title="Cumulative Net Profit"
            description="Running total of net profit"
            size="medium"
            data={[
              gradientArea(months, getCol(base, "Cumulative Net Profit"), "Base", CHART_COLORS.green, CHART_COLORS.greenLight) as Plotly.Data,
              ...scenarioLines(months, getCol(base, "Cumulative Net Profit"), getCol(pess, "Cumulative Net Profit"), getCol(opt, "Cumulative Net Profit")).slice(1) as Plotly.Data[],
            ]}
            layout={{ shapes }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlotlyChart
            title="Rule of 40"
            description="Revenue Growth% + EBITDA Margin% (40% baseline)"
            size="small"
            data={[
              {
                x: months,
                y: getCol(base, "Rule of 40"),
                mode: "lines",
                name: "Rule of 40",
                line: { color: CHART_COLORS.amber, width: 2.5, shape: "spline" },
              } as Plotly.Data,
              {
                x: months,
                y: months.map(() => 40),
                mode: "lines",
                name: "40% baseline",
                line: { dash: "dash", color: CHART_COLORS.muted, width: 1 },
              } as Plotly.Data,
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />

          <PlotlyChart
            title="Magic Number"
            description="Net New ARR (Q) / S&M (prior Q) — 1.0 baseline"
            size="small"
            data={[
              {
                x: months,
                y: getCol(base, "Magic Number"),
                mode: "lines",
                name: "Magic Number",
                line: { color: CHART_COLORS.purple, width: 2.5, shape: "spline" },
              } as Plotly.Data,
              {
                x: months,
                y: months.map(() => 1),
                mode: "lines",
                name: "1.0 baseline",
                line: { dash: "dash", color: CHART_COLORS.muted, width: 1 },
              } as Plotly.Data,
            ]}
            layout={{ shapes }}
          />
        </div>

        <PlotlyChart
          title="Burn Rate & Runway"
          description="Monthly burn rate and remaining runway"
          size="small"
          data={[
            {
              x: months,
              y: getCol(base, "Burn Rate"),
              mode: "lines",
              name: "Burn Rate ($)",
              line: { color: CHART_COLORS.red, width: 2.5, shape: "spline" },
            } as Plotly.Data,
            {
              x: months,
              y: getCol(base, "Runway (Months)"),
              mode: "lines",
              name: "Runway (months)",
              yaxis: "y2",
              line: { color: CHART_COLORS.primary, width: 2.5, shape: "spline" },
            } as Plotly.Data,
          ]}
          layout={{
            shapes,
            yaxis: { title: "Burn Rate ($)" },
            yaxis2: { title: "Months", overlaying: "y", side: "right" },
          }}
        />
      </TabsContent>
    </Tabs>
  );
});

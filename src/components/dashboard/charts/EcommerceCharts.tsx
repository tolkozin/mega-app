"use client";

import { PlotlyChart, phaseLines, gradientArea, scenarioLines, CHART_COLORS, DONUT_COLORS } from "./PlotlyChart";
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

export function EcommerceCharts({ results, p1End, p2End }: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const shapes = phaseLines(p1End, p2End);

  const lastIdx = base.length - 1;
  const lastPaidClicks = (base[lastIdx]["Paid Clicks"] as number) ?? 0;
  const lastOrganicVisitors = (base[lastIdx]["Organic Visitors"] as number) ?? 0;

  return (
    <div className="space-y-2">
      {/* ── Revenue Overview ── */}
      <h3 className="text-base font-bold text-[#1C1D21] mt-8 mb-3">Revenue Overview</h3>

      <PlotlyChart
        title="Gross Revenue"
        description="Total gross revenue with scenario projections"
        size="hero"
        data={[
          gradientArea(months, getCol(base, "Gross Revenue"), "Base", CHART_COLORS.primary, CHART_COLORS.primaryLight) as Plotly.Data,
          ...scenarioLines(months, getCol(base, "Gross Revenue"), getCol(pess, "Gross Revenue"), getCol(opt, "Gross Revenue")).slice(1) as Plotly.Data[],
        ]}
        layout={{ shapes }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlotlyChart
          title="Traffic Split"
          description="Paid vs Organic — last month"
          size="medium"
          data={[
            {
              values: [lastPaidClicks, lastOrganicVisitors],
              labels: ["Paid Traffic", "Organic Traffic"],
              type: "pie",
              hole: 0.65,
              marker: { colors: [CHART_COLORS.primary, CHART_COLORS.green] },
              textinfo: "percent",
              textfont: { size: 11, color: "#1C1D21" },
              hoverinfo: "label+value+percent",
            } as Plotly.Data,
          ]}
          layout={{}}
        />
        <PlotlyChart
          title="Total Orders"
          description="Monthly order volume"
          size="medium"
          data={[
            {
              x: months,
              y: getCol(base, "Total Orders"),
              type: "bar",
              name: "Orders",
              marker: { color: CHART_COLORS.primary, opacity: 0.85 },
            } as Plotly.Data,
          ]}
          layout={{ shapes }}
        />
        <PlotlyChart
          title="Cash Balance"
          description="Cash on hand across scenarios"
          size="medium"
          data={[
            {
              x: months,
              y: getCol(base, "Cash Balance"),
              type: "bar",
              name: "Base",
              marker: { color: CHART_COLORS.primaryLight },
            } as Plotly.Data,
            ...scenarioLines(months, getCol(base, "Cash Balance"), getCol(pess, "Cash Balance"), getCol(opt, "Cash Balance")) as Plotly.Data[],
          ]}
          layout={{ shapes }}
        />
      </div>

      {/* ── Unit Economics ── */}
      <h3 className="text-base font-bold text-[#1C1D21] mt-8 mb-3">Unit Economics</h3>

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
          title="ROAS"
          description="Return on Ad Spend"
          size="medium"
          data={[
            gradientArea(months, getCol(base, "ROAS"), "ROAS", CHART_COLORS.green, CHART_COLORS.greenLight) as Plotly.Data,
          ]}
          layout={{ shapes }}
        />
        <PlotlyChart
          title="AOV Trend"
          description="Average Order Value (effective)"
          size="medium"
          data={[
            {
              x: months,
              y: getCol(base, "Effective AOV"),
              mode: "lines",
              name: "AOV",
              line: { color: CHART_COLORS.amber, width: 2.5, shape: "spline" },
            } as Plotly.Data,
          ]}
          layout={{ shapes }}
        />
      </div>

      {/* ── Profit & Loss ── */}
      <h3 className="text-base font-bold text-[#1C1D21] mt-8 mb-3">Profit &amp; Loss</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlotlyChart
          title="Net Profit"
          description="Net profit across scenarios"
          size="medium"
          data={scenarioLines(months, getCol(base, "Net Profit"), getCol(pess, "Net Profit"), getCol(opt, "Net Profit")) as Plotly.Data[]}
          layout={{ shapes }}
        />
        <PlotlyChart
          title="Cumulative Profit"
          description="Running total profit"
          size="medium"
          data={[
            gradientArea(months, getCol(base, "Cumulative Profit"), "Base", CHART_COLORS.purple, CHART_COLORS.purpleLight) as Plotly.Data,
            {
              x: months,
              y: getCol(pess, "Cumulative Profit"),
              mode: "lines",
              name: "Pessimistic",
              line: { dash: "dot", color: CHART_COLORS.red, width: 1.5 },
            } as Plotly.Data,
          ]}
          layout={{ shapes }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlotlyChart
          title="Gross Margin %"
          description="Gross margin percentage over time"
          size="small"
          data={[
            {
              x: months,
              y: getCol(base, "Gross Margin %").map((v) => v * 100),
              mode: "lines",
              name: "Gross Margin",
              line: { color: CHART_COLORS.teal, width: 2.5, shape: "spline" },
            } as Plotly.Data,
          ]}
          layout={{ shapes, yaxis: { title: "%" } }}
        />
        <PlotlyChart
          title="Burn Rate & Runway"
          description="Monthly burn and remaining runway"
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
              line: { color: CHART_COLORS.amber, width: 2, dash: "dash" },
            } as Plotly.Data,
          ]}
          layout={{
            shapes,
            yaxis: { title: "Burn Rate ($)" },
            yaxis2: { title: "Months", overlaying: "y", side: "right" },
          }}
        />
      </div>

      {/* ── Customer Analysis ── */}
      <h3 className="text-base font-bold text-[#1C1D21] mt-8 mb-3">Customer Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlotlyChart
          title="New vs Returning Customers"
          description="Customer acquisition breakdown"
          size="medium"
          data={[
            {
              x: months,
              y: getCol(base, "New Customers"),
              type: "bar",
              name: "New",
              marker: { color: CHART_COLORS.primary },
            } as Plotly.Data,
            {
              x: months,
              y: getCol(base, "Returning Customers"),
              type: "bar",
              name: "Returning",
              marker: { color: CHART_COLORS.green },
            } as Plotly.Data,
          ]}
          layout={{ barmode: "group", shapes }}
        />
        <PlotlyChart
          title="Traffic Sources"
          description="Paid vs Organic traffic over time"
          size="medium"
          data={[
            {
              x: months,
              y: getCol(base, "Paid Clicks"),
              mode: "lines",
              stackgroup: "traffic",
              name: "Paid",
              fillcolor: CHART_COLORS.primaryLight,
              line: { color: CHART_COLORS.primary, width: 1.5 },
            } as Plotly.Data,
            {
              x: months,
              y: getCol(base, "Organic Visitors"),
              mode: "lines",
              stackgroup: "traffic",
              name: "Organic",
              fillcolor: CHART_COLORS.greenLight,
              line: { color: CHART_COLORS.green, width: 1.5 },
            } as Plotly.Data,
          ]}
          layout={{ shapes }}
        />
      </div>
    </div>
  );
}

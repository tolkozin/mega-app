"use client";

import { PlotlyChart, phaseLines } from "./PlotlyChart";
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

export function SaasCharts({ results, p1End, p2End }: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const shapes = phaseLines(p1End, p2End);

  return (
    <Tabs defaultValue="growth">
      <TabsList>
        <TabsTrigger value="growth">Growth & ARR</TabsTrigger>
        <TabsTrigger value="unit">Unit Economics</TabsTrigger>
        <TabsTrigger value="pnl">P&L & Efficiency</TabsTrigger>
        <TabsTrigger value="pipeline">Pipeline & Retention</TabsTrigger>
      </TabsList>

      <TabsContent value="growth">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="ARR"
            description="Annual Recurring Revenue across scenarios"
            data={[
              { x: months, y: getCol(base, "ARR"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "ARR"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "ARR"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Active Customers"
            description="Number of active customer accounts"
            data={[
              { x: months, y: getCol(base, "Active Customers"), type: "bar", name: "Base" },
              { x: months, y: getCol(pess, "Active Customers"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Active Customers"), mode: "lines", line: { dash: "dash" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="New vs Churned Customers"
            description="Monthly new deals vs churned accounts"
            data={[
              { x: months, y: getCol(base, "New Deals"), type: "bar", name: "New Deals", marker: { color: "#22c55e" } },
              { x: months, y: getCol(base, "Churned Customers").map((v) => -v), type: "bar", name: "Churned", marker: { color: "#ef4444" } },
            ]}
            layout={{ barmode: "relative", shapes }}
          />
          <PlotlyChart
            title="Active Seats"
            description="Total active seats across all customers"
            data={[
              { x: months, y: getCol(base, "Active Seats"), mode: "lines", name: "Base", fill: "tozeroy" },
              { x: months, y: getCol(pess, "Active Seats"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Active Seats"), mode: "lines", line: { dash: "dash" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>

      <TabsContent value="unit">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="CAC"
            description="Customer Acquisition Cost"
            data={[
              { x: months, y: getCol(base, "CAC"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "CAC"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="LTV / CAC"
            description="Lifetime Value to Acquisition Cost ratio"
            data={[
              { x: months, y: getCol(base, "LTV/CAC"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "LTV/CAC"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="ARPA"
            description="Average Revenue Per Account"
            data={[
              { x: months, y: getCol(base, "ARPA"), mode: "lines", name: "ARPA" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="NRR %"
            description="Net Revenue Retention (100% baseline)"
            data={[
              { x: months, y: getCol(base, "NRR %"), mode: "lines", name: "NRR %" },
              { x: months, y: months.map(() => 100), mode: "lines", line: { dash: "dash", color: "#888" }, name: "100% baseline" },
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />
        </div>
      </TabsContent>

      <TabsContent value="pnl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="Net Profit"
            data={[
              { x: months, y: getCol(base, "Net Profit"), type: "bar", name: "Base" },
              { x: months, y: getCol(pess, "Net Profit"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Net Profit"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Cumulative Profit"
            data={[
              { x: months, y: getCol(base, "Cumulative Net Profit"), mode: "lines", name: "Base", fill: "tozeroy" },
              { x: months, y: getCol(pess, "Cumulative Net Profit"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Rule of 40"
            description="Revenue Growth% + EBITDA Margin% (40% baseline)"
            data={[
              { x: months, y: getCol(base, "Rule of 40"), mode: "lines", name: "Rule of 40" },
              { x: months, y: months.map(() => 40), mode: "lines", line: { dash: "dash", color: "#888" }, name: "40% baseline" },
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />
          <PlotlyChart
            title="Magic Number"
            description="Net New ARR (Q) / S&M (prior Q) — 1.0 baseline"
            data={[
              { x: months, y: getCol(base, "Magic Number"), mode: "lines", name: "Magic Number" },
              { x: months, y: months.map(() => 1), mode: "lines", line: { dash: "dash", color: "#888" }, name: "1.0 baseline" },
            ]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>

      <TabsContent value="pipeline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="Pipeline: Leads / Demos / Deals"
            description="Monthly sales funnel"
            data={[
              { x: months, y: getCol(base, "Total Leads"), type: "bar", name: "Leads" },
              { x: months, y: getCol(base, "Demos"), type: "bar", name: "Demos" },
              { x: months, y: getCol(base, "New Deals"), type: "bar", name: "Deals" },
            ]}
            layout={{ barmode: "group", shapes }}
          />
          <PlotlyChart
            title="GRR %"
            description="Gross Revenue Retention"
            data={[
              { x: months, y: getCol(base, "GRR %"), mode: "lines", name: "GRR %" },
              { x: months, y: months.map(() => 100), mode: "lines", line: { dash: "dash", color: "#888" }, name: "100% baseline" },
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />
          <PlotlyChart
            title="Quick Ratio"
            description="(New + Expansion MRR) / (Contraction + Churned MRR)"
            data={[
              { x: months, y: getCol(base, "Quick Ratio"), mode: "lines", name: "Quick Ratio" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Burn Rate & Runway"
            data={[
              { x: months, y: getCol(base, "Burn Rate"), mode: "lines", name: "Burn Rate ($)" },
              { x: months, y: getCol(base, "Runway (Months)"), mode: "lines", name: "Runway (months)", yaxis: "y2" },
            ]}
            layout={{
              shapes,
              yaxis: { title: "Burn Rate ($)" },
              yaxis2: { title: "Months", overlaying: "y", side: "right" },
            }}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

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

export function SubscriptionCharts({ results, p1End, p2End }: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const shapes = phaseLines(p1End, p2End);

  return (
    <Tabs defaultValue="growth">
      <TabsList>
        <TabsTrigger value="growth">Growth & Revenue</TabsTrigger>
        <TabsTrigger value="unit">Unit Economics</TabsTrigger>
        <TabsTrigger value="pnl">P&L & Scenarios</TabsTrigger>
        <TabsTrigger value="cohorts">Cohorts & Deep Dive</TabsTrigger>
      </TabsList>

      <TabsContent value="growth">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="MRR by Subscription Plan"
            description="Monthly Recurring Revenue breakdown by plan type"
            data={[
              { x: months, y: getCol(base, "MRR Weekly"), mode: "lines", stackgroup: "one", name: "Weekly" },
              { x: months, y: getCol(base, "MRR Monthly"), mode: "lines", stackgroup: "one", name: "Monthly" },
              { x: months, y: getCol(base, "MRR Annual"), mode: "lines", stackgroup: "one", name: "Annual" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Cash Balance"
            description="Cash on hand across 3 scenarios"
            data={[
              { x: months, y: getCol(base, "Cash Balance"), type: "bar", name: "Base" },
              { x: months, y: getCol(pess, "Cash Balance"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Cash Balance"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Gross vs Net Revenue"
            description="Revenue comparison before and after commissions"
            data={[
              { x: months, y: getCol(base, "Gross Revenue Web"), type: "bar", name: "Gross Web" },
              { x: months, y: getCol(base, "Gross Revenue Store"), type: "bar", name: "Gross Store" },
              { x: months, y: getCol(base, "Net Revenue"), type: "bar", name: "Net Revenue" },
            ]}
            layout={{ barmode: "group", shapes }}
          />
          <PlotlyChart
            title="Active Users"
            description="Total active subscribers across scenarios"
            data={[
              { x: months, y: getCol(base, "Active Users"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "Active Users"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Active Users"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>

      <TabsContent value="unit">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="LTV / CAC Ratio"
            description="Lifetime Value to Customer Acquisition Cost ratio"
            data={[
              { x: months, y: getCol(base, "LTV/CAC"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "LTV/CAC"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "LTV/CAC"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="ARPU"
            description="Average Revenue Per User"
            data={[
              { x: months, y: getCol(base, "ARPU"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "ARPU"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "ARPU"), mode: "lines", line: { dash: "dash" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
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
            title="Gross Margin"
            description="Gross Margin percentage over time"
            data={[
              { x: months, y: getCol(base, "Gross Margin %").map((v) => v * 100), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "Gross Margin %").map((v) => v * 100), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />
        </div>
      </TabsContent>

      <TabsContent value="pnl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="Net Profit"
            description="Monthly net profit across scenarios"
            data={[
              { x: months, y: getCol(base, "Net Profit"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "Net Profit"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Net Profit"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Cumulative Profit"
            description="Running total profit/loss"
            data={[
              { x: months, y: getCol(base, "Cumulative Profit"), mode: "lines", name: "Base", fill: "tozeroy" },
              { x: months, y: getCol(pess, "Cumulative Profit"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Cumulative Profit"), mode: "lines", line: { dash: "dash" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Revenue vs Costs"
            description="Total revenue vs total costs breakdown"
            data={[
              { x: months, y: getCol(base, "Total Gross Revenue"), mode: "lines", name: "Revenue" },
              { x: months, y: getCol(base, "Total OpEx"), mode: "lines", name: "OpEx" },
              { x: months, y: getCol(base, "Ad Spend"), mode: "lines", name: "Ad Spend" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="ROI %"
            description="Cumulative Return on Investment"
            data={[
              { x: months, y: getCol(base, "ROI %"), mode: "lines", name: "ROI %" },
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />
        </div>
      </TabsContent>

      <TabsContent value="cohorts">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="New vs Churned Users"
            description="Monthly new acquisitions vs churned users"
            data={[
              { x: months, y: getCol(base, "New Paid"), type: "bar", name: "New Paid" },
              { x: months, y: getCol(base, "Total Churned").map((v) => -v), type: "bar", name: "Churned" },
            ]}
            layout={{ barmode: "relative", shapes }}
          />
          <PlotlyChart
            title="Cumulative ROAS"
            description="Return on Ad Spend over time"
            data={[
              { x: months, y: getCol(base, "Cumulative ROAS"), mode: "lines", name: "ROAS" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Burn Rate & Runway"
            description="Monthly burn rate and remaining runway in months"
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
          <PlotlyChart
            title="LTV"
            description="Customer Lifetime Value"
            data={[
              { x: months, y: getCol(base, "LTV"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "LTV"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "LTV"), mode: "lines", line: { dash: "dash" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

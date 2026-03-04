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

export function EcommerceCharts({ results, p1End, p2End }: ChartsProps) {
  const base = results.base.dataframe;
  const pess = results.pessimistic.dataframe;
  const opt = results.optimistic.dataframe;
  const months = getMonths(base);
  const shapes = phaseLines(p1End, p2End);

  return (
    <Tabs defaultValue="revenue">
      <TabsList>
        <TabsTrigger value="revenue">Revenue & Traffic</TabsTrigger>
        <TabsTrigger value="unit">Unit Economics</TabsTrigger>
        <TabsTrigger value="pnl">P&L & Cash</TabsTrigger>
        <TabsTrigger value="deep">Deep Dive</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="Gross Revenue"
            description="Total gross revenue across scenarios"
            data={[
              { x: months, y: getCol(base, "Gross Revenue"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "Gross Revenue"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Gross Revenue"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Total Orders"
            description="Monthly order volume"
            data={[
              { x: months, y: getCol(base, "Total Orders"), type: "bar", name: "Base" },
              { x: months, y: getCol(pess, "Total Orders"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Total Orders"), mode: "lines", line: { dash: "dash" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Traffic Sources"
            description="Paid vs Organic traffic"
            data={[
              { x: months, y: getCol(base, "Paid Clicks"), mode: "lines", stackgroup: "one", name: "Paid" },
              { x: months, y: getCol(base, "Organic Visitors"), mode: "lines", stackgroup: "one", name: "Organic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Cash Balance"
            description="Cash on hand"
            data={[
              { x: months, y: getCol(base, "Cash Balance"), type: "bar", name: "Base" },
              { x: months, y: getCol(pess, "Cash Balance"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Cash Balance"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
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
            title="ROAS"
            description="Return on Ad Spend"
            data={[
              { x: months, y: getCol(base, "ROAS"), mode: "lines", name: "Base" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="AOV Trend"
            description="Average Order Value (effective)"
            data={[
              { x: months, y: getCol(base, "Effective AOV"), mode: "lines", name: "AOV" },
            ]}
            layout={{ shapes }}
          />
        </div>
      </TabsContent>

      <TabsContent value="pnl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="Net Profit"
            data={[
              { x: months, y: getCol(base, "Net Profit"), mode: "lines", name: "Base" },
              { x: months, y: getCol(pess, "Net Profit"), mode: "lines", line: { dash: "dot", color: "red" }, name: "Pessimistic" },
              { x: months, y: getCol(opt, "Net Profit"), mode: "lines", line: { dash: "dash", color: "green" }, name: "Optimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Cumulative Profit"
            data={[
              { x: months, y: getCol(base, "Cumulative Profit"), mode: "lines", name: "Base", fill: "tozeroy" },
              { x: months, y: getCol(pess, "Cumulative Profit"), mode: "lines", line: { dash: "dot" }, name: "Pessimistic" },
            ]}
            layout={{ shapes }}
          />
          <PlotlyChart
            title="Gross Margin %"
            data={[
              { x: months, y: getCol(base, "Gross Margin %").map((v) => v * 100), mode: "lines", name: "Gross Margin" },
            ]}
            layout={{ shapes, yaxis: { title: "%" } }}
          />
        </div>
      </TabsContent>

      <TabsContent value="deep">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlotlyChart
            title="New vs Returning Customers"
            data={[
              { x: months, y: getCol(base, "New Customers"), type: "bar", name: "New" },
              { x: months, y: getCol(base, "Returning Customers"), type: "bar", name: "Returning" },
            ]}
            layout={{ barmode: "group", shapes }}
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

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getBenchmarkColor, getBenchmarkLabel } from "@/lib/benchmarks";
import { metricDescriptions } from "@/lib/metrics";
import type { RunResult } from "@/lib/api";

interface KPICardsProps {
  results: RunResult;
  milestones: Record<string, unknown>;
}

function fmtMilestone(val: unknown): string {
  if (val === null || val === undefined) return "\u2014";
  return `Month ${val}`;
}

const borderColorMap = {
  green: "border-l-4 border-l-[#14A660]",
  yellow: "border-l-4 border-l-[#F4A93E]",
  red: "border-l-4 border-l-[#E54545]",
};

function MetricCard({ label, value, help, metricKey, metricValue }: {
  label: string; value: string; help?: string; metricKey?: string; metricValue?: number;
}) {
  const color = metricKey && metricValue !== undefined ? getBenchmarkColor(metricKey, metricValue) : null;
  const benchLabel = metricKey ? getBenchmarkLabel(metricKey) : null;
  const desc = metricKey ? metricDescriptions[metricKey]?.description : undefined;
  const tooltip = [help, desc, benchLabel ? `Benchmark: ${benchLabel}` : null].filter(Boolean).join(" | ");

  return (
    <Card title={tooltip || undefined} className={color ? borderColorMap[color] : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function SaasMilestones({ milestones }: { milestones: Record<string, unknown> }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Key Milestones</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Break-Even (P&L)" value={fmtMilestone(milestones.break_even_month)} help="Month when Net Profit > 0" />
        <MetricCard label="Cumulative BE" value={fmtMilestone(milestones.cumulative_break_even)} help="Month when cumulative profit > 0" />
        <MetricCard label="CF Positive" value={fmtMilestone(milestones.cf_positive_month)} help="Month when cash flow > 0" />
        <MetricCard label="Runway Out" value={fmtMilestone(milestones.runway_out_month)} help="Month when cash runs out" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
        <MetricCard label="50 Customers" value={fmtMilestone(milestones.customers_50)} />
        <MetricCard label="100 Customers" value={fmtMilestone(milestones.customers_100)} />
        <MetricCard label="500 Customers" value={fmtMilestone(milestones.customers_500)} />
        <MetricCard label="ARR $100K" value={fmtMilestone(milestones.arr_100000)} />
        <MetricCard label="ARR $1M" value={fmtMilestone(milestones.arr_1000000)} />
      </div>
    </div>
  );
}

export function SaasKeyMetrics({ results }: KPICardsProps) {
  const data = results.dataframe;
  if (!data.length) return null;

  const last = data[data.length - 1] as Record<string, number>;
  const totalRevenue = data.reduce((sum, r) => sum + ((r as Record<string, number>)["Gross Revenue"] ?? 0), 0);
  const totalProfit = data.reduce((sum, r) => sum + ((r as Record<string, number>)["Net Profit"] ?? 0), 0);

  const endARR = last["ARR"] ?? 0;
  const endMRR = last["Total MRR"] ?? 0;
  const customers = last["Active Customers"] ?? 0;
  const seats = last["Active Seats"] ?? 0;
  const nrr = last["NRR %"] ?? 0;
  const ltvCac = last["LTV/CAC"] ?? 0;
  const arpa = last["ARPA"] ?? 0;
  const quickRatio = last["Quick Ratio"] ?? 0;
  const rule40 = last["Rule of 40"] ?? 0;
  const magicNum = last["Magic Number"] ?? 0;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} metricKey="Gross Revenue" />
        <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} metricKey="Net Profit" />
        <MetricCard label="End ARR" value={formatCurrency(endARR)} metricKey="ARR" />
        <MetricCard label="End MRR" value={formatCurrency(endMRR)} metricKey="Total MRR" />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
        <MetricCard label="Customers" value={formatNumber(customers)} metricKey="Active Customers" />
        <MetricCard label="Seats" value={formatNumber(seats)} metricKey="Active Seats" />
        <MetricCard label="NRR" value={nrr ? `${nrr.toFixed(1)}%` : "\u2014"} metricKey="NRR %" metricValue={nrr} />
        <MetricCard label="LTV/CAC" value={isNaN(ltvCac) ? "\u2014" : `${ltvCac.toFixed(2)}x`} metricKey="LTV/CAC" metricValue={ltvCac} />
        <MetricCard label="ARPA" value={`$${arpa.toFixed(0)}`} metricKey="ARPA" />
        <MetricCard label="Quick Ratio" value={isNaN(quickRatio) ? "\u2014" : quickRatio.toFixed(2)} metricKey="Quick Ratio" metricValue={quickRatio} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
        <MetricCard label="Rule of 40" value={isNaN(rule40) ? "\u2014" : `${rule40.toFixed(1)}%`} metricKey="Rule of 40" metricValue={rule40} />
        <MetricCard label="Magic Number" value={isNaN(magicNum) ? "\u2014" : magicNum.toFixed(2)} metricKey="Magic Number" metricValue={magicNum} />
        <MetricCard label="Burn Rate" value={formatCurrency(last["Burn Rate"] ?? 0)} metricKey="Burn Rate" />
        <MetricCard label="Runway" value={last["Runway (Months)"] ? `${formatNumber(last["Runway (Months)"])} mo` : "\u221e"} metricKey="Runway (Months)" />
      </div>
    </div>
  );
}

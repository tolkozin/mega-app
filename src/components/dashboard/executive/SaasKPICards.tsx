"use client";

import React, { useState } from "react";
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

function Tooltip({ text }: { text: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<"above" | "below">("above");

  React.useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.top < 8) setPos("below");
  }, []);

  if (pos === "below") {
    return (
      <div ref={ref} className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1C1D21] text-white text-[11px] leading-relaxed rounded-lg shadow-lg w-[240px] whitespace-pre-line pointer-events-none">
        {text}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-[#1C1D21]" />
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1C1D21] text-white text-[11px] leading-relaxed rounded-lg shadow-lg w-[240px] whitespace-pre-line pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#1C1D21]" />
    </div>
  );
}

function MetricCard({ label, value, help, metricKey, metricValue }: {
  label: string; value: string; help?: string; metricKey?: string; metricValue?: number;
}) {
  const [hover, setHover] = useState(false);
  const color = metricKey && metricValue !== undefined ? getBenchmarkColor(metricKey, metricValue) : null;
  const benchLabel = metricKey ? getBenchmarkLabel(metricKey) : null;
  const desc = metricKey ? metricDescriptions[metricKey]?.description : undefined;
  const parts = [help, desc, benchLabel ? `Benchmark: ${benchLabel}` : null].filter(Boolean);
  const tooltipText = parts.join("\n");

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && tooltipText && <Tooltip text={tooltipText} />}
      <Card className={`cursor-default ${color ? borderColorMap[color] : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            {tooltipText && (
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#ECECF2] text-[#8181A5] text-[8px] font-bold shrink-0">?</span>
            )}
          </div>
          <p className="text-lg font-bold">{value}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function SaasMilestones({ milestones }: { milestones: Record<string, unknown> }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Key Milestones</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Break-Even (P&L)" value={fmtMilestone(milestones.break_even_month)} help="First month when monthly Net Profit turns positive. Indicates product-market fit." />
        <MetricCard label="Cumulative BE" value={fmtMilestone(milestones.cumulative_break_even)} help="Month when total accumulated profit covers all past losses." />
        <MetricCard label="CF Positive" value={fmtMilestone(milestones.cf_positive_month)} help="Month when monthly cash inflow exceeds outflow." />
        <MetricCard label="Runway Out" value={fmtMilestone(milestones.runway_out_month)} help="Month when cash balance hits zero. Requires more funding or cost cuts." />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
        <MetricCard label="50 Customers" value={fmtMilestone(milestones.customers_50)} help="Month when paying customer count reaches 50. Early B2B traction." />
        <MetricCard label="100 Customers" value={fmtMilestone(milestones.customers_100)} help="Month when paying customers reach 100. Validates repeatable sales process." />
        <MetricCard label="500 Customers" value={fmtMilestone(milestones.customers_500)} help="Month when paying customers reach 500. Strong product-market fit." />
        <MetricCard label="ARR $100K" value={fmtMilestone(milestones.arr_100000)} help="Month when Annual Recurring Revenue reaches $100K." />
        <MetricCard label="ARR $1M" value={fmtMilestone(milestones.arr_1000000)} help="Month when ARR reaches $1M. Series A-ready revenue milestone." />
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
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} help="Sum of all gross revenue across the entire forecast." metricKey="Gross Revenue" />
        <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} help="Sum of all monthly net profits." metricKey="Net Profit" />
        <MetricCard label="End ARR" value={formatCurrency(endARR)} help="Annual Recurring Revenue at forecast end (MRR x 12)." metricKey="ARR" />
        <MetricCard label="End MRR" value={formatCurrency(endMRR)} help="Monthly Recurring Revenue at the last month." metricKey="Total MRR" />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
        <MetricCard label="Customers" value={formatNumber(customers)} help="Number of active paying customer accounts." metricKey="Active Customers" />
        <MetricCard label="Seats" value={formatNumber(seats)} help="Total active seats across all customer accounts." metricKey="Active Seats" />
        <MetricCard label="NRR" value={nrr ? `${nrr.toFixed(1)}%` : "\u2014"} help="Net Revenue Retention — measures expansion vs churn. >100% means existing customers grow." metricKey="NRR %" metricValue={nrr} />
        <MetricCard label="LTV/CAC" value={isNaN(ltvCac) ? "\u2014" : `${ltvCac.toFixed(2)}x`} help="Customer Lifetime Value / Acquisition Cost. >3x is healthy for SaaS." metricKey="LTV/CAC" metricValue={ltvCac} />
        <MetricCard label="ARPA" value={`$${arpa.toFixed(0)}`} help="Average Revenue Per Account per month." metricKey="ARPA" />
        <MetricCard label="Quick Ratio" value={isNaN(quickRatio) ? "\u2014" : quickRatio.toFixed(2)} help="(New MRR + Expansion) / (Churn + Contraction). >4 is excellent, >1 means net growth." metricKey="Quick Ratio" metricValue={quickRatio} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
        <MetricCard label="Rule of 40" value={isNaN(rule40) ? "\u2014" : `${rule40.toFixed(1)}%`} help="Revenue growth % + profit margin %. >40% indicates a healthy SaaS business." metricKey="Rule of 40" metricValue={rule40} />
        <MetricCard label="Magic Number" value={isNaN(magicNum) ? "\u2014" : magicNum.toFixed(2)} help="Net new ARR / S&M spend. >1 means efficient growth, time to invest more in sales." metricKey="Magic Number" metricValue={magicNum} />
        <MetricCard label="Burn Rate" value={formatCurrency(last["Burn Rate"] ?? 0)} help="Monthly cash burn at forecast end." metricKey="Burn Rate" />
        <MetricCard label="Runway" value={last["Runway (Months)"] ? `${formatNumber(last["Runway (Months)"])} mo` : "\u221e"} help="Months of cash remaining at current burn rate." metricKey="Runway (Months)" />
      </div>
    </div>
  );
}

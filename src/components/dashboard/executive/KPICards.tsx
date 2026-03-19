"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
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

const valueColorMap = {
  green: "text-[#14A660]",
  yellow: "text-[#F4A93E]",
  red: "text-[#E54545]",
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

function MetricCard({ label, value, help, metricKey, metricValue, large }: {
  label: string; value: string; help?: string; metricKey?: string; metricValue?: number; large?: boolean;
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
          <p className={`${large ? "text-xl font-black" : "text-lg font-bold"} ${color ? valueColorMap[color] : "text-[#1C1D21]"}`}>{value}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function Milestones({ milestones }: { milestones: Record<string, unknown> }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Key Milestones</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Break-Even (P&L)" value={fmtMilestone(milestones.break_even_month)} help="First month when monthly Net Profit turns positive. Earlier is better — indicates product-market fit." />
        <MetricCard label="Cumulative BE" value={fmtMilestone(milestones.cumulative_break_even)} help="Month when total accumulated profit covers all past losses. Shows when you've fully recovered initial burn." />
        <MetricCard label="CF Positive" value={fmtMilestone(milestones.cf_positive_month)} help="Month when monthly cash inflow exceeds outflow. Critical for survival — you stop burning cash." />
        <MetricCard label="Investment Payback" value={fmtMilestone(milestones.investment_payback_month)} help="Month when cumulative profit fully repays the initial investment. Key milestone for investors." />
        <MetricCard label="Runway Out" value={fmtMilestone(milestones.runway_out_month)} help="Month when cash balance hits zero. If shown, you need more funding or cost cuts before this date." />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <MetricCard label="1K Users" value={fmtMilestone(milestones.users_1000)} help="Month when active users reach 1,000. Early traction milestone." />
        <MetricCard label="10K Users" value={fmtMilestone(milestones.users_10000)} help="Month when active users reach 10,000. Validates scalability." />
        <MetricCard label="MRR $10K" value={fmtMilestone(milestones.mrr_10000)} help="Month when Monthly Recurring Revenue reaches $10K. Meaningful revenue milestone." />
        <MetricCard label="MRR $100K" value={fmtMilestone(milestones.mrr_100000)} help="Month when MRR reaches $100K ($1.2M ARR). Series A-ready revenue level." />
      </div>
    </div>
  );
}

export function KeyMetrics({ results }: KPICardsProps) {
  const data = results.dataframe;
  if (!data.length) return null;

  const last = data[data.length - 1] as Record<string, number>;
  const totalRevenue = data.reduce((sum, r) => sum + ((r as Record<string, number>)["Total Gross Revenue"] ?? 0), 0);
  const totalProfit = data.reduce((sum, r) => sum + ((r as Record<string, number>)["Net Profit"] ?? 0), 0);

  const endMRR = last["Total MRR"] ?? 0;
  const avgLtvCac = data.reduce((sum, r) => sum + ((r as Record<string, number>)["LTV/CAC"] ?? 0), 0) / data.length;
  const roi = last["ROI %"] ?? 0;
  const roas = last["Cumulative ROAS"] ?? 0;
  const arpu = last["ARPU"] ?? 0;
  const gm = last["Gross Margin %"] ?? 0;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} help="Sum of all gross revenue across the entire forecast period." metricKey="Total Gross Revenue" large />
        <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} help="Sum of all monthly net profits (revenue minus all costs and taxes)." metricKey="Net Profit" large />
        <MetricCard label="End MRR" value={formatCurrency(endMRR)} help="Monthly Recurring Revenue at the last month of the forecast." metricKey="Total MRR" large />
        <MetricCard label="Avg LTV/CAC" value={`${avgLtvCac.toFixed(2)}x`} help="Average Lifetime Value to Customer Acquisition Cost ratio across all months." metricKey="LTV/CAC" metricValue={avgLtvCac} large />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
        <MetricCard label="ROI" value={`${formatNumber(roi)}%`} help="Return on Investment at the end of the forecast period." metricKey="ROI %" />
        <MetricCard label="ROAS" value={`${roas.toFixed(1)}x`} help="Cumulative Return on Ad Spend. Revenue generated per $1 of ad spend." metricKey="Cumulative ROAS" metricValue={roas} />
        <MetricCard label="ARPU" value={`$${arpu.toFixed(2)}`} help="Average Revenue Per User per month at forecast end." metricKey="ARPU" />
        <MetricCard label="Gross Margin" value={gm ? formatPercent(gm * 100) : "\u2014"} help="Revenue minus COGS as % of revenue. Shows production efficiency." metricKey="Gross Margin %" metricValue={gm * 100} />
        <MetricCard label="Burn Rate" value={formatCurrency(last["Burn Rate"] ?? 0)} help="Monthly cash burn (expenses minus revenue when negative). Lower is better." metricKey="Burn Rate" />
        <MetricCard label="Runway" value={last["Runway (Months)"] ? `${formatNumber(last["Runway (Months)"])} mo` : "\u221e"} help="Months of cash remaining at current burn rate. Infinite if profitable." metricKey="Runway (Months)" />
      </div>
    </div>
  );
}

export function EcomKeyMetrics({ results }: KPICardsProps) {
  const data = results.dataframe;
  if (!data.length) return null;

  const last = data[data.length - 1] as Record<string, number>;
  const totalRevenue = data.reduce((sum, r) => sum + ((r as Record<string, number>)["Gross Revenue"] ?? 0), 0);
  const totalProfit = data.reduce((sum, r) => sum + ((r as Record<string, number>)["Net Profit"] ?? 0), 0);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} help="Sum of all gross revenue across the entire forecast." metricKey="Gross Revenue" large />
        <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} help="Sum of all monthly net profits." metricKey="Net Profit" large />
        <MetricCard label="CAC" value={`$${(last["CAC"] ?? 0).toFixed(2)}`} help="Customer Acquisition Cost — total ad spend divided by new customers acquired." metricKey="CAC" large />
        <MetricCard label="LTV/CAC" value={`${(last["LTV/CAC"] ?? 0).toFixed(2)}x`} help="Customer Lifetime Value divided by Acquisition Cost. Should be >3x for healthy unit economics." metricKey="LTV/CAC" metricValue={last["LTV/CAC"]} large />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
        <MetricCard label="ROAS" value={`${(last["ROAS"] ?? 0).toFixed(1)}x`} help="Return on Ad Spend — revenue per $1 of advertising." metricKey="ROAS" metricValue={last["ROAS"]} />
        <MetricCard label="AOV" value={`$${(last["AOV"] ?? 0).toFixed(2)}`} help="Average Order Value at the end of the forecast." metricKey="AOV" />
        <MetricCard label="Gross Margin" value={last["Gross Margin %"] ? formatPercent(last["Gross Margin %"]) : "\u2014"} help="Revenue minus COGS as % of revenue." metricKey="Gross Margin %" metricValue={last["Gross Margin %"]} />
        <MetricCard label="ROI" value={`${formatNumber(last["ROI %"] ?? 0)}%`} help="Return on Investment at forecast end." metricKey="ROI %" />
        <MetricCard label="Burn Rate" value={formatCurrency(last["Burn Rate"] ?? 0)} help="Monthly cash burn at forecast end." metricKey="Burn Rate" />
        <MetricCard label="Runway" value={last["Runway (Months)"] ? `${formatNumber(last["Runway (Months)"])} mo` : "\u221e"} help="Months of cash remaining at current burn rate." metricKey="Runway (Months)" />
      </div>
    </div>
  );
}

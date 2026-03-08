"use client";

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

export function Milestones({ milestones }: { milestones: Record<string, unknown> }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Key Milestones</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Break-Even (P&L)" value={fmtMilestone(milestones.break_even_month)} help="Month when Net Profit > 0" />
        <MetricCard label="Cumulative BE" value={fmtMilestone(milestones.cumulative_break_even)} help="Month when cumulative profit > 0" />
        <MetricCard label="CF Positive" value={fmtMilestone(milestones.cf_positive_month)} help="Month when cash flow > 0" />
        <MetricCard label="Investment Payback" value={fmtMilestone(milestones.investment_payback_month)} help="Month when cumulative profit covers investments" />
        <MetricCard label="Runway Out" value={fmtMilestone(milestones.runway_out_month)} help="Month when cash runs out" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <MetricCard label="1K Users" value={fmtMilestone(milestones.users_1000)} />
        <MetricCard label="10K Users" value={fmtMilestone(milestones.users_10000)} />
        <MetricCard label="MRR $10K" value={fmtMilestone(milestones.mrr_10000)} />
        <MetricCard label="MRR $100K" value={fmtMilestone(milestones.mrr_100000)} />
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
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} metricKey="Total Gross Revenue" />
        <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} metricKey="Net Profit" />
        <MetricCard label="End MRR" value={formatCurrency(endMRR)} metricKey="Total MRR" />
        <MetricCard label="Avg LTV/CAC" value={`${avgLtvCac.toFixed(2)}x`} metricKey="LTV/CAC" metricValue={avgLtvCac} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
        <MetricCard label="ROI" value={`${formatNumber(roi)}%`} metricKey="ROI %" />
        <MetricCard label="ROAS" value={`${roas.toFixed(1)}x`} metricKey="Cumulative ROAS" metricValue={roas} />
        <MetricCard label="ARPU" value={`$${arpu.toFixed(2)}`} metricKey="ARPU" />
        <MetricCard label="Gross Margin" value={gm ? formatPercent(gm * 100) : "\u2014"} metricKey="Gross Margin %" metricValue={gm * 100} />
        <MetricCard label="Burn Rate" value={formatCurrency(last["Burn Rate"] ?? 0)} metricKey="Burn Rate" />
        <MetricCard label="Runway" value={last["Runway (Months)"] ? `${formatNumber(last["Runway (Months)"])} mo` : "\u221e"} metricKey="Runway (Months)" />
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
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} metricKey="Gross Revenue" />
        <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} metricKey="Net Profit" />
        <MetricCard label="CAC" value={`$${(last["CAC"] ?? 0).toFixed(2)}`} metricKey="CAC" />
        <MetricCard label="LTV/CAC" value={`${(last["LTV/CAC"] ?? 0).toFixed(2)}x`} metricKey="LTV/CAC" metricValue={last["LTV/CAC"]} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
        <MetricCard label="ROAS" value={`${(last["ROAS"] ?? 0).toFixed(1)}x`} metricKey="ROAS" metricValue={last["ROAS"]} />
        <MetricCard label="AOV" value={`$${(last["AOV"] ?? 0).toFixed(2)}`} metricKey="AOV" />
        <MetricCard label="Gross Margin" value={last["Gross Margin %"] ? formatPercent(last["Gross Margin %"]) : "\u2014"} metricKey="Gross Margin %" metricValue={last["Gross Margin %"]} />
        <MetricCard label="ROI" value={`${formatNumber(last["ROI %"] ?? 0)}%`} metricKey="ROI %" />
        <MetricCard label="Burn Rate" value={formatCurrency(last["Burn Rate"] ?? 0)} metricKey="Burn Rate" />
        <MetricCard label="Runway" value={last["Runway (Months)"] ? `${formatNumber(last["Runway (Months)"])} mo` : "\u221e"} metricKey="Runway (Months)" />
      </div>
    </div>
  );
}

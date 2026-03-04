"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import type { RunResult } from "@/lib/api";

interface KPICardsProps {
  results: RunResult;
  milestones: Record<string, unknown>;
}

function fmtMilestone(val: unknown): string {
  if (val === null || val === undefined) return "—";
  return `Month ${val}`;
}

function MetricCard({ label, value, help }: { label: string; value: string; help?: string }) {
  return (
    <Card title={help}>
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
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} />
        <MetricCard label="End MRR" value={formatCurrency(endMRR)} />
        <MetricCard label="Avg LTV/CAC" value={`${avgLtvCac.toFixed(2)}x`} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
        <MetricCard label="ROI" value={`${formatNumber(roi)}%`} />
        <MetricCard label="ROAS" value={`${roas.toFixed(1)}x`} />
        <MetricCard label="ARPU" value={`$${arpu.toFixed(2)}`} />
        <MetricCard label="Gross Margin" value={gm ? formatPercent(gm * 100) : "—"} />
        <MetricCard label="Burn Rate" value={formatCurrency(last["Burn Rate"] ?? 0)} />
        <MetricCard label="Runway" value={last["Runway (Months)"] ? `${formatNumber(last["Runway (Months)"])} mo` : "∞"} />
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
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <MetricCard label="Net Profit" value={formatCurrency(totalProfit)} />
        <MetricCard label="CAC" value={`$${(last["CAC"] ?? 0).toFixed(2)}`} />
        <MetricCard label="LTV/CAC" value={`${(last["LTV/CAC"] ?? 0).toFixed(2)}x`} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
        <MetricCard label="ROAS" value={`${(last["ROAS"] ?? 0).toFixed(1)}x`} />
        <MetricCard label="AOV" value={`$${(last["Effective AOV"] ?? 0).toFixed(2)}`} />
        <MetricCard label="Gross Margin" value={last["Gross Margin %"] ? formatPercent((last["Gross Margin %"] ?? 0) * 100) : "—"} />
        <MetricCard label="ROI" value={`${formatNumber(last["ROI %"] ?? 0)}%`} />
        <MetricCard label="Burn Rate" value={formatCurrency(last["Burn Rate"] ?? 0)} />
        <MetricCard label="Runway" value={last["Runway (Months)"] ? `${formatNumber(last["Runway (Months)"])} mo` : "∞"} />
      </div>
    </div>
  );
}

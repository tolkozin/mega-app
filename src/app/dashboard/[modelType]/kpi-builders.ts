import type { BaseEngine } from "@/lib/model-registry";
import type { KPICardProps, HealthStatus } from "@/components/v2/charts/V2KPIMetricCard";
import { fmtK } from "@/components/v2/charts/v2-chart-utils";

export type DataRow = Record<string, number | string | undefined>;

function isNumeric(v: unknown): boolean {
  if (typeof v === "number") return true;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return true;
  return false;
}

function findCol(row: DataRow, ...candidates: string[]): string | null {
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(row).find((k) => k.toLowerCase() === lc);
    if (match && isNumeric(row[match])) return match;
  }
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(row).find((k) => k.toLowerCase() === lc);
    if (match) return match;
  }
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(row).find((k) => k.toLowerCase().includes(lc) && isNumeric(row[k]));
    if (match) return match;
  }
  return null;
}

function numVal(row: DataRow, col: string | null): number {
  if (!col) return 0;
  const v = row[col];
  if (typeof v === "number") return v;
  if (typeof v === "string") { const n = Number(v); return isNaN(n) ? 0 : n; }
  return 0;
}

interface KPIDef {
  label: string;
  columns: string[];
  format: "currency" | "pct" | "number" | "ratio" | "months";
  healthGood?: (v: number) => boolean;
  healthBad?: (v: number) => boolean;
  description?: string;
  sumPeriod?: boolean;
}

const SUB_KPIS: KPIDef[] = [
  { label: "Total Revenue", columns: ["Total Gross Revenue", "Gross Revenue"], format: "currency", description: "Cumulative gross revenue for the selected period", sumPeriod: true },
  { label: "Net Profit", columns: ["Net Profit"], format: "currency", healthGood: (v) => v > 0, healthBad: (v) => v < -5000, description: "Total net profit for the selected period", sumPeriod: true },
  { label: "End MRR", columns: ["Total MRR", "MRR"], format: "currency", healthGood: (v) => v > 0, description: "Monthly recurring revenue at end of period" },
  { label: "LTV/CAC", columns: ["LTV/CAC"], format: "ratio", healthGood: (v) => v >= 3, healthBad: (v) => v < 1, description: "Customer lifetime value to acquisition cost ratio (3x+ is healthy)" },
  { label: "ROI", columns: ["ROI %", "ROI"], format: "pct", healthGood: (v) => v > 0, healthBad: (v) => v < -20, description: "Return on total investment" },
  { label: "ROAS", columns: ["Cumulative ROAS", "ROAS"], format: "ratio", healthGood: (v) => v >= 2, healthBad: (v) => v < 1, description: "Return on ad spend" },
  { label: "ARPU", columns: ["ARPU"], format: "currency", description: "Average revenue per user per month" },
  { label: "Gross Margin", columns: ["Gross Margin", "Gross Profit"], format: "currency", description: "Total gross margin for the selected period", sumPeriod: true },
  { label: "Burn Rate", columns: ["Burn Rate"], format: "currency", healthGood: (v) => v <= 0, healthBad: (v) => v > 20000, description: "Monthly cash consumption rate" },
  { label: "Runway", columns: ["Runway (Months)", "Runway"], format: "months", healthGood: (v) => v >= 12, healthBad: (v) => v < 6, description: "Months of cash remaining at current burn" },
];

const ECOM_KPIS: KPIDef[] = [
  { label: "Gross Revenue", columns: ["Gross Revenue"], format: "currency", description: "Total gross revenue for the selected period", sumPeriod: true },
  { label: "Net Profit", columns: ["Net Profit"], format: "currency", healthGood: (v) => v > 0, healthBad: (v) => v < -5000, description: "Total net profit for the selected period", sumPeriod: true },
  { label: "AOV", columns: ["AOV", "Avg Order Value"], format: "currency", description: "Average order value" },
  { label: "CAC", columns: ["CAC"], format: "currency", healthBad: (v) => v > 100, description: "Cost to acquire one customer" },
  { label: "LTV", columns: ["LTV"], format: "currency", healthGood: (v) => v > 0, description: "Customer lifetime value" },
  { label: "LTV/CAC", columns: ["LTV/CAC"], format: "ratio", healthGood: (v) => v >= 3, healthBad: (v) => v < 1, description: "Lifetime value to acquisition cost ratio" },
  { label: "Total Orders", columns: ["Total Orders"], format: "number", description: "Number of orders in the period" },
  { label: "Gross Margin", columns: ["Gross Margin", "Gross Profit"], format: "currency", description: "Total gross margin for the selected period", sumPeriod: true },
  { label: "ROI", columns: ["ROI %", "ROI"], format: "pct", healthGood: (v) => v > 0, healthBad: (v) => v < -20, description: "Return on total investment" },
  { label: "ROAS", columns: ["ROAS"], format: "ratio", healthGood: (v) => v >= 2, healthBad: (v) => v < 1, description: "Return on ad spend" },
];

const SAAS_KPIS: KPIDef[] = [
  { label: "ARR", columns: ["ARR"], format: "currency", description: "Annualized recurring revenue" },
  { label: "Net Profit", columns: ["Net Profit"], format: "currency", healthGood: (v) => v > 0, healthBad: (v) => v < -5000, description: "Total net profit for the selected period", sumPeriod: true },
  { label: "NRR", columns: ["NRR %", "NRR"], format: "pct", healthGood: (v) => v >= 110, healthBad: (v) => v < 90, description: "Net revenue retention — expansion vs churn" },
  { label: "Quick Ratio", columns: ["Quick Ratio"], format: "ratio", healthGood: (v) => v >= 4, healthBad: (v) => v < 1, description: "New + expansion MRR / churned + contraction MRR" },
  { label: "Rule of 40", columns: ["Rule of 40"], format: "pct", healthGood: (v) => v >= 40, healthBad: (v) => v < 20, description: "Revenue growth % + profit margin %" },
  { label: "Magic Number", columns: ["Magic Number"], format: "ratio", healthGood: (v) => v >= 0.75, healthBad: (v) => v < 0.5, description: "New ARR / sales & marketing spend" },
  { label: "CAC", columns: ["CAC"], format: "currency", description: "Cost to acquire one customer" },
  { label: "LTV/CAC", columns: ["LTV/CAC"], format: "ratio", healthGood: (v) => v >= 3, healthBad: (v) => v < 1, description: "Lifetime value to acquisition cost" },
  { label: "Gross Margin", columns: ["Gross Margin", "Gross Profit"], format: "currency", description: "Total gross margin for the selected period", sumPeriod: true },
  { label: "Logo Churn", columns: ["Logo Churn %", "Logo Churn"], format: "pct", healthGood: (v) => v <= 3, healthBad: (v) => v >= 8, description: "Percentage of customers lost per period" },
];

const ENGINE_KPI_DEFS: Record<BaseEngine, KPIDef[]> = {
  subscription: SUB_KPIS,
  ecommerce: ECOM_KPIS,
  saas: SAAS_KPIS,
};

export function buildKPICards(df: DataRow[], engine: BaseEngine): KPICardProps[] {
  if (!df || df.length < 2) return [];
  const defs = ENGINE_KPI_DEFS[engine];
  const lastRow = df[df.length - 1];
  const prevRow = df[df.length - 2];
  const cards: KPICardProps[] = [];

  for (const def of defs) {
    const col = findCol(lastRow, ...def.columns);
    if (!col) continue;

    const val = def.sumPeriod
      ? df.reduce((sum, r) => sum + numVal(r, col), 0)
      : numVal(lastRow, col);
    const prev = def.sumPeriod
      ? df.slice(0, -1).reduce((sum, r) => sum + numVal(r, col), 0)
      : numVal(prevRow, col);
    const pctChange = prev !== 0 ? ((val - prev) / Math.abs(prev)) * 100 : 0;

    let formatted: string;
    switch (def.format) {
      case "currency": formatted = fmtK(val); break;
      case "pct": formatted = `${val.toFixed(1)}%`; break;
      case "ratio": formatted = `${val.toFixed(2)}x`; break;
      case "months": formatted = `${val.toFixed(1)}mo`; break;
      case "number": formatted = val.toLocaleString("en-US", { maximumFractionDigits: 0 }); break;
    }

    let health: HealthStatus = "neutral";
    if (def.healthGood && def.healthGood(val)) health = "good";
    else if (def.healthBad && def.healthBad(val)) health = "bad";
    else if (def.healthGood || def.healthBad) health = "caution";

    const trendStr = pctChange !== 0 ? `${pctChange > 0 ? "+" : ""}${pctChange.toFixed(1)}%` : undefined;
    const trendUp = pctChange > 0;
    const trendNeutral = pctChange === 0;

    const sparkline = df.map((r) => numVal(r, col));

    cards.push({
      label: def.label,
      value: formatted,
      trend: trendStr,
      trendUp,
      trendNeutral,
      health,
      sparkline,
      description: def.description,
    });
  }

  return cards;
}

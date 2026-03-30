/**
 * Scoring engine for Revenue Map dashboards.
 * Deterministic computations — no AI calls.
 *
 * Benchmarks are unique per modelType × engine combination.
 */

export type DataRow = Record<string, number | string | undefined>;
export type HealthStatus = "good" | "caution" | "bad" | "neutral";

/* ─── helpers ─── */

function num(row: DataRow, ...candidates: string[]): number {
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const key = Object.keys(row).find((k) => k.toLowerCase() === lc);
    if (key !== undefined) {
      const v = row[key];
      if (typeof v === "number") return v;
      if (typeof v === "string") { const n = Number(v); if (!isNaN(n)) return n; }
    }
  }
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const key = Object.keys(row).find((k) => k.toLowerCase().includes(lc));
    if (key !== undefined) {
      const v = row[key];
      if (typeof v === "number") return v;
      if (typeof v === "string") { const n = Number(v); if (!isNaN(n)) return n; }
    }
  }
  return 0;
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/* ─── Benchmark definitions per modelType × engine ─── */

interface Thresholds {
  ltvCac: { good: number; ok: number };
  churn: { good: number; ok: number; bad: number };
  runway: { good: number; ok: number };
  grossMargin: { good: number; ok: number };
  roas: { good: number; ok: number };
  nrr: { good: number; ok: number };
  quickRatio: { good: number; ok: number };
  ruleOf40: { good: number; ok: number };
  weights: { ltvCac: number; churn: number; runway: number; growth: number; profitability: number; extra1: number; extra2: number };
}

/**
 * Benchmark lookup: `"modelType:engine"` → thresholds.
 * Falls back to `":engine"` (engine-only default) if no specific combo exists.
 */
const BENCHMARKS: Record<string, Thresholds> = {
  /* ─── Subscription engine defaults ─── */
  ":subscription": {
    ltvCac: { good: 3, ok: 1.5 },
    churn: { good: 3, ok: 7, bad: 12 },
    runway: { good: 18, ok: 6 },
    grossMargin: { good: 70, ok: 50 },
    roas: { good: 3, ok: 1.5 },
    nrr: { good: 110, ok: 90 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 25, churn: 20, runway: 20, growth: 20, profitability: 15, extra1: 0, extra2: 0 },
  },

  /* ─── Ecommerce engine defaults ─── */
  ":ecommerce": {
    ltvCac: { good: 3, ok: 1.5 },
    churn: { good: 5, ok: 10, bad: 20 },
    runway: { good: 18, ok: 6 },
    grossMargin: { good: 50, ok: 30 },
    roas: { good: 4, ok: 2 },
    nrr: { good: 110, ok: 90 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 20, churn: 0, runway: 15, growth: 20, profitability: 20, extra1: 15, extra2: 10 },
  },

  /* ─── SaaS engine defaults ─── */
  ":saas": {
    ltvCac: { good: 5, ok: 3 },
    churn: { good: 3, ok: 5, bad: 8 },
    runway: { good: 18, ok: 6 },
    grossMargin: { good: 80, ok: 60 },
    roas: { good: 3, ok: 1.5 },
    nrr: { good: 120, ok: 100 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 20, churn: 0, runway: 10, growth: 15, profitability: 10, extra1: 20, extra2: 25 },
  },

  /* ─── Mobile App ─── */
  "subscription:subscription": {
    ltvCac: { good: 3, ok: 1.5 },
    churn: { good: 5, ok: 10, bad: 15 },
    runway: { good: 18, ok: 6 },
    grossMargin: { good: 70, ok: 50 },
    roas: { good: 3, ok: 1.5 },
    nrr: { good: 110, ok: 90 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 25, churn: 20, runway: 20, growth: 20, profitability: 15, extra1: 0, extra2: 0 },
  },

  /* ─── Gaming — higher tolerable churn, IAP-driven ─── */
  "gametech:subscription": {
    ltvCac: { good: 2.5, ok: 1.2 },
    churn: { good: 8, ok: 15, bad: 25 },
    runway: { good: 18, ok: 6 },
    grossMargin: { good: 75, ok: 55 },
    roas: { good: 2.5, ok: 1.3 },
    nrr: { good: 110, ok: 90 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 25, churn: 15, runway: 20, growth: 25, profitability: 15, extra1: 0, extra2: 0 },
  },

  /* ─── Food Delivery — low margins, high volume ─── */
  "foodtech:ecommerce": {
    ltvCac: { good: 2.5, ok: 1.2 },
    churn: { good: 10, ok: 20, bad: 35 },
    runway: { good: 18, ok: 6 },
    grossMargin: { good: 25, ok: 12 },
    roas: { good: 3, ok: 1.5 },
    nrr: { good: 110, ok: 90 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 20, churn: 0, runway: 15, growth: 25, profitability: 20, extra1: 10, extra2: 10 },
  },

  /* ─── Travel — seasonal, high AOV, low frequency ─── */
  "traveltech:ecommerce": {
    ltvCac: { good: 4, ok: 2 },
    churn: { good: 15, ok: 30, bad: 50 },
    runway: { good: 24, ok: 12 },
    grossMargin: { good: 35, ok: 15 },
    roas: { good: 5, ok: 2.5 },
    nrr: { good: 110, ok: 90 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 20, churn: 0, runway: 20, growth: 20, profitability: 20, extra1: 10, extra2: 10 },
  },

  /* ─── Marketplace — two-sided, take-rate economics ─── */
  "marketplace:ecommerce": {
    ltvCac: { good: 3, ok: 1.5 },
    churn: { good: 8, ok: 15, bad: 25 },
    runway: { good: 18, ok: 6 },
    grossMargin: { good: 60, ok: 35 },
    roas: { good: 4, ok: 2 },
    nrr: { good: 110, ok: 90 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 20, churn: 0, runway: 15, growth: 25, profitability: 20, extra1: 10, extra2: 10 },
  },

  /* ─── Fintech SaaS — high compliance costs, strong retention ─── */
  "fintech:saas": {
    ltvCac: { good: 6, ok: 3 },
    churn: { good: 2, ok: 4, bad: 7 },
    runway: { good: 24, ok: 12 },
    grossMargin: { good: 75, ok: 55 },
    roas: { good: 3, ok: 1.5 },
    nrr: { good: 130, ok: 110 },
    quickRatio: { good: 5, ok: 3 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 20, churn: 0, runway: 15, growth: 15, profitability: 10, extra1: 20, extra2: 20 },
  },

  /* ─── Healthtech SaaS — long sales cycles, sticky contracts ─── */
  "healthtech:saas": {
    ltvCac: { good: 5, ok: 2.5 },
    churn: { good: 2, ok: 4, bad: 7 },
    runway: { good: 24, ok: 12 },
    grossMargin: { good: 75, ok: 55 },
    roas: { good: 3, ok: 1.5 },
    nrr: { good: 125, ok: 105 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 35, ok: 15 },
    weights: { ltvCac: 20, churn: 0, runway: 15, growth: 15, profitability: 10, extra1: 20, extra2: 20 },
  },

  /* ─── Edtech SaaS — seasonal, B2B/B2C mix ─── */
  "edtech:saas": {
    ltvCac: { good: 4, ok: 2 },
    churn: { good: 4, ok: 7, bad: 12 },
    runway: { good: 18, ok: 6 },
    grossMargin: { good: 75, ok: 55 },
    roas: { good: 3, ok: 1.5 },
    nrr: { good: 115, ok: 95 },
    quickRatio: { good: 3.5, ok: 1.5 },
    ruleOf40: { good: 35, ok: 15 },
    weights: { ltvCac: 20, churn: 0, runway: 15, growth: 15, profitability: 10, extra1: 20, extra2: 20 },
  },

  /* ─── Proptech — long deal cycles, high AOV ─── */
  "proptech:ecommerce": {
    ltvCac: { good: 5, ok: 2.5 },
    churn: { good: 10, ok: 20, bad: 35 },
    runway: { good: 24, ok: 12 },
    grossMargin: { good: 45, ok: 25 },
    roas: { good: 5, ok: 2.5 },
    nrr: { good: 110, ok: 90 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 25, churn: 0, runway: 20, growth: 20, profitability: 20, extra1: 10, extra2: 5 },
  },

  /* ─── AI/ML SaaS — high compute costs, usage-based ─── */
  "ai-ml:saas": {
    ltvCac: { good: 4, ok: 2 },
    churn: { good: 4, ok: 7, bad: 12 },
    runway: { good: 24, ok: 12 },
    grossMargin: { good: 65, ok: 40 },
    roas: { good: 3, ok: 1.5 },
    nrr: { good: 130, ok: 110 },
    quickRatio: { good: 4, ok: 2 },
    ruleOf40: { good: 40, ok: 20 },
    weights: { ltvCac: 20, churn: 0, runway: 15, growth: 20, profitability: 10, extra1: 15, extra2: 20 },
  },
};

function getThresholds(modelType: string, engine: string): Thresholds {
  return BENCHMARKS[`${modelType}:${engine}`] ?? BENCHMARKS[`:${engine}`] ?? BENCHMARKS[":subscription"];
}

/* ─── Score computation ─── */

export interface ScoreResult {
  overall: number;
  health: HealthStatus;
  label: string;
  breakdown: { label: string; score: number; weight: number }[];
}

function scoreHealth(score: number): { health: HealthStatus; label: string } {
  if (score >= 60) return { health: "good", label: "Good" };
  if (score >= 35) return { health: "caution", label: "Caution" };
  return { health: "bad", label: "Bad" };
}

/** Linear interpolation score: maps value between bad→0 and good→100 */
function linearScore(value: number, good: number, bad: number, higherIsBetter: boolean): number {
  if (higherIsBetter) {
    if (value >= good) return 85 + clamp(((value - good) / (good || 1)) * 30, 0, 15);
    if (value <= bad) return clamp((value / (bad || 1)) * 35, 0, 35);
    return 35 + ((value - bad) / (good - bad)) * 50;
  }
  // Lower is better (churn, burn rate)
  if (value <= good) return 85 + clamp(((good - value) / (good || 1)) * 30, 0, 15);
  if (value >= bad) return clamp(((bad - value + bad) / (bad || 1)) * 35, 0, 35);
  return 35 + ((bad - value) / (bad - good)) * 50;
}

/** Runway=0 means infinite (profitable, no burn) → best score */
function runwayScore(runway: number, t: Thresholds): number {
  if (runway === 0) return 100;
  return clamp(linearScore(runway, t.runway.good, t.runway.ok, true), 0, 100);
}

function subscriptionScore(last: DataRow, prev: DataRow, t: Thresholds): ScoreResult {
  const ltvCac = num(last, "LTV/CAC");
  const churn = num(last, "Churn Rate", "Cancel Rate", "Logo Churn %", "Logo Churn", "Monthly Churn");
  const runway = num(last, "Runway (Months)", "Runway");
  const mrr = num(last, "Total MRR", "MRR");
  const mrrPrev = num(prev, "Total MRR", "MRR");
  const netProfit = num(last, "Net Profit");
  const mrrGrowth = pctChange(mrr, mrrPrev);

  const scores = [
    { label: "LTV/CAC Ratio", score: clamp(linearScore(ltvCac, t.ltvCac.good, t.ltvCac.ok * 0.5, true), 0, 100), weight: t.weights.ltvCac },
    { label: "Churn Rate", score: clamp(linearScore(churn, t.churn.good, t.churn.bad, false), 0, 100), weight: t.weights.churn },
    { label: "Runway", score: runwayScore(runway, t), weight: t.weights.runway },
    { label: "MRR Growth", score: clamp(mrrPrev > 0 ? linearScore(mrrGrowth, 15, -5, true) : (mrr > 0 ? 60 : 0), 0, 100), weight: t.weights.growth },
    { label: "Profitability", score: clamp(netProfit > 0 ? 100 : netProfit > -5000 ? 50 : 20, 0, 100), weight: t.weights.profitability },
  ];

  const totalWeight = scores.reduce((s, i) => s + i.weight, 0);
  const overall = totalWeight > 0
    ? Math.round(scores.reduce((s, i) => s + i.score * (i.weight / totalWeight), 0))
    : 0;
  return { overall, ...scoreHealth(overall), breakdown: scores.filter((s) => s.weight > 0) };
}

function ecommerceScore(last: DataRow, prev: DataRow, t: Thresholds): ScoreResult {
  const ltvCac = num(last, "LTV/CAC");
  const grossMargin = num(last, "Gross Margin %", "Gross Margin");
  const roas = num(last, "ROAS", "Cumulative ROAS");
  const revenue = num(last, "Gross Revenue");
  const revPrev = num(prev, "Gross Revenue");
  const netProfit = num(last, "Net Profit");
  const runway = num(last, "Runway (Months)", "Runway");
  const revGrowth = pctChange(revenue, revPrev);
  const gmPct = grossMargin > 1 ? grossMargin : grossMargin * 100;

  const scores = [
    { label: "LTV/CAC Ratio", score: clamp(linearScore(ltvCac, t.ltvCac.good, t.ltvCac.ok * 0.5, true), 0, 100), weight: t.weights.ltvCac },
    { label: "Runway", score: runwayScore(runway, t), weight: t.weights.runway },
    { label: "Revenue Growth", score: clamp(revPrev > 0 ? linearScore(revGrowth, 15, -5, true) : (revenue > 0 ? 60 : 0), 0, 100), weight: t.weights.growth },
    { label: "Profitability", score: clamp(netProfit > 0 ? 100 : netProfit > -5000 ? 50 : 20, 0, 100), weight: t.weights.profitability },
    { label: "Gross Margin", score: clamp(linearScore(gmPct, t.grossMargin.good, t.grossMargin.ok * 0.5, true), 0, 100), weight: t.weights.extra1 },
    { label: "ROAS", score: clamp(linearScore(roas, t.roas.good, t.roas.ok * 0.5, true), 0, 100), weight: t.weights.extra2 },
  ];

  const totalWeight = scores.reduce((s, i) => s + i.weight, 0);
  const overall = totalWeight > 0
    ? Math.round(scores.reduce((s, i) => s + i.score * (i.weight / totalWeight), 0))
    : 0;
  return { overall, ...scoreHealth(overall), breakdown: scores.filter((s) => s.weight > 0) };
}

function saasScore(last: DataRow, prev: DataRow, t: Thresholds): ScoreResult {
  const ltvCac = num(last, "LTV/CAC");
  const nrr = num(last, "NRR %", "NRR");
  const quickRatio = num(last, "Quick Ratio");
  const ruleOf40 = num(last, "Rule of 40");
  const arr = num(last, "ARR");
  const arrPrev = num(prev, "ARR");
  const netProfit = num(last, "Net Profit");
  const runway = num(last, "Runway (Months)", "Runway");
  const arrGrowth = pctChange(arr, arrPrev);

  const scores = [
    { label: "LTV/CAC Ratio", score: clamp(linearScore(ltvCac, t.ltvCac.good, t.ltvCac.ok * 0.5, true), 0, 100), weight: t.weights.ltvCac },
    { label: "Runway", score: runwayScore(runway, t), weight: t.weights.runway },
    { label: "ARR Growth", score: clamp(arrPrev > 0 ? linearScore(arrGrowth, 20, -5, true) : (arr > 0 ? 60 : 0), 0, 100), weight: t.weights.growth },
    { label: "Profitability", score: clamp(netProfit > 0 ? 100 : netProfit > -5000 ? 50 : 20, 0, 100), weight: t.weights.profitability },
    { label: "Net Revenue Retention", score: clamp(linearScore(nrr, t.nrr.good, t.nrr.ok * 0.8, true), 0, 100), weight: t.weights.extra1 },
    { label: "Rule of 40 + Quick Ratio", score: clamp((linearScore(ruleOf40, t.ruleOf40.good, t.ruleOf40.ok * 0.5, true) + linearScore(quickRatio, t.quickRatio.good, t.quickRatio.ok * 0.5, true)) / 2, 0, 100), weight: t.weights.extra2 },
  ];

  const totalWeight = scores.reduce((s, i) => s + i.weight, 0);
  const overall = totalWeight > 0
    ? Math.round(scores.reduce((s, i) => s + i.score * (i.weight / totalWeight), 0))
    : 0;
  return { overall, ...scoreHealth(overall), breakdown: scores.filter((s) => s.weight > 0) };
}

export function computeScores(df: DataRow[], engine: string, modelType?: string): ScoreResult {
  if (df.length < 2) return { overall: 0, health: "neutral", label: "N/A", breakdown: [] };
  const last = df[df.length - 1];
  const prev = df[df.length - 2];
  const t = getThresholds(modelType ?? "", engine);

  switch (engine) {
    case "ecommerce": return ecommerceScore(last, prev, t);
    case "saas": return saasScore(last, prev, t);
    default: return subscriptionScore(last, prev, t);
  }
}

/* ─── Insights ─── */

export interface Insight {
  type: "good" | "caution" | "bad";
  text: string;
}

export function generateInsights(df: DataRow[], engine: string, modelType?: string): Insight[] {
  if (df.length < 2) return [];
  const last = df[df.length - 1];
  const prev = df[df.length - 2];
  const t = getThresholds(modelType ?? "", engine);
  const insights: Insight[] = [];

  // LTV/CAC — use model-specific thresholds
  const ltvCac = num(last, "LTV/CAC");
  if (ltvCac >= t.ltvCac.good) insights.push({ type: "good", text: `Unit economics healthy: LTV/CAC ${ltvCac.toFixed(1)}x (target ${t.ltvCac.good}x+)` });
  else if (ltvCac >= t.ltvCac.ok) insights.push({ type: "caution", text: `LTV/CAC at ${ltvCac.toFixed(1)}x — aim for ${t.ltvCac.good}x+` });
  else if (ltvCac > 0) insights.push({ type: "bad", text: `LTV/CAC ${ltvCac.toFixed(1)}x is below healthy threshold of ${t.ltvCac.ok}x` });

  // Profitability
  const netProfit = num(last, "Net Profit");
  if (netProfit > 0) insights.push({ type: "good", text: `Profitable this month: net profit $${Math.round(netProfit).toLocaleString()}` });
  else if (netProfit > -5000) insights.push({ type: "caution", text: "Near breakeven — monitor expenses" });
  else insights.push({ type: "bad", text: `Negative net profit $${Math.round(netProfit).toLocaleString()} — review burn` });

  // Churn — subscription & saas engines, with model-specific thresholds
  if (engine === "subscription" || engine === "saas") {
    const churn = num(last, "Churn Rate", "Cancel Rate", "Logo Churn %", "Logo Churn", "Monthly Churn");
    if (churn > 0) {
      if (churn <= t.churn.good) insights.push({ type: "good", text: `Churn rate ${churn.toFixed(1)}% is within healthy range (target <${t.churn.good}%)` });
      else if (churn <= t.churn.ok) insights.push({ type: "caution", text: `Churn rate ${churn.toFixed(1)}% — consider retention strategies (target <${t.churn.good}%)` });
      else insights.push({ type: "bad", text: `Churn rate ${churn.toFixed(1)}% above industry threshold of ${t.churn.ok}%` });
    }

    const runway = num(last, "Runway (Months)", "Runway");
    if (runway > 0) {
      if (runway >= t.runway.good) insights.push({ type: "good", text: `${runway.toFixed(0)} months runway — well funded` });
      else if (runway >= 12) insights.push({ type: "caution", text: `${runway.toFixed(0)} months runway — start planning next raise` });
      else insights.push({ type: "bad", text: "Runway below 12 months — monitor burn rate" });
    }
  }

  // Ecommerce-specific
  if (engine === "ecommerce") {
    const roas = num(last, "ROAS", "Cumulative ROAS");
    if (roas >= t.roas.good) insights.push({ type: "good", text: `ROAS ${roas.toFixed(1)}x — ad spend is highly efficient (target ${t.roas.good}x+)` });
    else if (roas >= t.roas.ok) insights.push({ type: "caution", text: `ROAS ${roas.toFixed(1)}x — room for optimisation (target ${t.roas.good}x+)` });
    else if (roas > 0) insights.push({ type: "bad", text: `ROAS ${roas.toFixed(1)}x — ad spend may not be profitable` });

    const gmRaw = num(last, "Gross Margin %", "Gross Margin");
    const gm = gmRaw > 1 ? gmRaw : gmRaw * 100;
    if (gm > 0) {
      if (gm >= t.grossMargin.good) insights.push({ type: "good", text: `Gross margin ${gm.toFixed(1)}% above industry target of ${t.grossMargin.good}%` });
      else if (gm < t.grossMargin.ok) insights.push({ type: "bad", text: `Gross margin ${gm.toFixed(1)}% below healthy threshold of ${t.grossMargin.ok}%` });
    }
  }

  // SaaS-specific
  if (engine === "saas") {
    const nrr = num(last, "NRR %", "NRR");
    if (nrr >= t.nrr.good) insights.push({ type: "good", text: `NRR ${nrr.toFixed(0)}% — strong expansion revenue (target ${t.nrr.good}%+)` });
    else if (nrr >= t.nrr.ok) insights.push({ type: "caution", text: `NRR ${nrr.toFixed(0)}% — stable but limited expansion` });
    else if (nrr > 0) insights.push({ type: "bad", text: `NRR ${nrr.toFixed(0)}% — revenue contraction detected` });

    const ruleOf40 = num(last, "Rule of 40");
    if (ruleOf40 >= t.ruleOf40.good) insights.push({ type: "good", text: `Rule of 40 score: ${ruleOf40.toFixed(0)} — exceeding benchmark` });
    else if (ruleOf40 >= t.ruleOf40.ok) insights.push({ type: "caution", text: `Rule of 40 score: ${ruleOf40.toFixed(0)} — below benchmark of ${t.ruleOf40.good}` });
  }

  // Revenue growth — universal
  const revCols = engine === "saas" ? ["ARR"] : engine === "ecommerce" ? ["Gross Revenue"] : ["Total MRR", "MRR"];
  const rev = num(last, ...revCols);
  const revPrev = num(prev, ...revCols);
  const revGrowth = pctChange(rev, revPrev);
  if (revGrowth > 20) insights.push({ type: "good", text: `Revenue grew ${revGrowth.toFixed(1)}% month-over-month` });
  else if (revGrowth > 0) insights.push({ type: "caution", text: `Revenue growth slowing at ${revGrowth.toFixed(1)}% MoM` });
  else if (revGrowth < -5) insights.push({ type: "bad", text: `Revenue declined ${Math.abs(revGrowth).toFixed(1)}% — investigate cause` });

  return insights;
}

/* ─── Phase Progress ─── */

export interface PhaseInfo {
  label: string;
  startMonth: number;
  endMonth: number;
  progress: number;
  status: "done" | "active" | "upcoming";
}

export function getPhaseProgress(config: Record<string, unknown>, df: DataRow[]): PhaseInfo[] {
  const p1 = Number(config.phase1_dur ?? config.phase1Duration ?? 6);
  const p2 = Number(config.phase2_dur ?? config.phase2Duration ?? 12);
  const total = Number(config.total_months ?? config.totalMonths ?? 36);
  const currentMonth = df.length > 0 ? Number(num(df[df.length - 1], "Month")) || df.length : 0;

  const p1End = p1;
  const p2End = p1 + p2;
  const p3End = total;

  return [
    {
      label: "Phase 1",
      startMonth: 1,
      endMonth: p1End,
      progress: clamp(currentMonth / p1End, 0, 1),
      status: currentMonth > p1End ? "done" : currentMonth >= 1 ? "active" : "upcoming",
    },
    {
      label: "Phase 2",
      startMonth: p1End + 1,
      endMonth: p2End,
      progress: currentMonth <= p1End ? 0 : clamp((currentMonth - p1End) / (p2End - p1End), 0, 1),
      status: currentMonth > p2End ? "done" : currentMonth > p1End ? "active" : "upcoming",
    },
    {
      label: "Phase 3",
      startMonth: p2End + 1,
      endMonth: p3End,
      progress: currentMonth <= p2End ? 0 : clamp((currentMonth - p2End) / (p3End - p2End), 0, 1),
      status: currentMonth > p3End ? "done" : currentMonth > p2End ? "active" : "upcoming",
    },
  ];
}

/* ─── Monthly Snapshot ─── */

export interface SnapshotItem {
  label: string;
  value: string;
}

function fmt$(v: number): string {
  if (Math.abs(v) >= 1e6) return `${v < 0 ? "-" : ""}$${(Math.abs(v) / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `${v < 0 ? "-" : ""}$${(Math.abs(v) / 1e3).toFixed(1)}k`;
  return `${v < 0 ? "-$" : "$"}${Math.abs(v).toFixed(0)}`;
}

function fmtPct(v: number): string { return `${v.toFixed(1)}%`; }
function fmtNum(v: number): string { return Math.round(v).toLocaleString("en-US"); }

export function getMonthlySnapshot(df: DataRow[], engine: string): { month: number; items: SnapshotItem[] } {
  if (df.length === 0) return { month: 0, items: [] };
  const last = df[df.length - 1];
  const month = Number(num(last, "Month")) || df.length;

  const items: SnapshotItem[] = [];

  const push = (label: string, format: "currency" | "pct" | "number", ...cols: string[]) => {
    const v = num(last, ...cols);
    if (v === 0 && cols.every((c) => !Object.keys(last).some((k) => k.toLowerCase() === c.toLowerCase()))) return;
    switch (format) {
      case "currency": items.push({ label, value: fmt$(v) }); break;
      case "pct": items.push({ label, value: fmtPct(v) }); break;
      case "number": items.push({ label, value: fmtNum(v) }); break;
    }
  };

  if (engine === "subscription") {
    push("Revenue", "currency", "Total Gross Revenue", "Gross Revenue");
    push("Expenses", "currency", "Total Expenses", "Expenses");
    push("Net Profit", "currency", "Net Profit");
    push("Cash Balance", "currency", "Cash Balance", "Cash");
    push("New Users", "number", "New Users", "New Subscribers");
    push("Active Users", "number", "Active Users", "Active Subscribers", "Total Active");
    push("ARPU", "currency", "ARPU");
    push("Gross Margin", "pct", "Gross Margin %", "Gross Margin");
  } else if (engine === "ecommerce") {
    push("Revenue", "currency", "Gross Revenue");
    push("Expenses", "currency", "Total Expenses", "Expenses");
    push("Net Profit", "currency", "Net Profit");
    push("Cash Balance", "currency", "Cash Balance", "Cash");
    push("Orders", "number", "Total Orders", "Orders");
    push("AOV", "currency", "AOV", "Avg Order Value");
    push("Gross Margin", "pct", "Gross Margin %", "Gross Margin");
    push("ROAS", "number", "ROAS");
  } else {
    push("ARR", "currency", "ARR");
    push("Expenses", "currency", "Total Expenses", "Expenses");
    push("Net Profit", "currency", "Net Profit");
    push("Cash Balance", "currency", "Cash Balance", "Cash");
    push("Customers", "number", "Active Customers", "Customers");
    push("NRR", "pct", "NRR %", "NRR");
    push("Quick Ratio", "number", "Quick Ratio");
    push("Rule of 40", "number", "Rule of 40");
  }

  return { month, items };
}

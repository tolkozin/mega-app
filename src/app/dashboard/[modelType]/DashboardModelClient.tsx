"use client";

import { Suspense, useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter, notFound } from "next/navigation";
import { useConfigStore } from "@/stores/config-store";
import { useDashboard } from "@/hooks/useDashboard";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { V2Shell as AppShell } from "@/components/v2/layout/V2Shell";
import { generateInvestorPDF } from "@/lib/pdf-report";
import { startKeepAlive, stopKeepAlive } from "@/lib/api";
import { useChatStore } from "@/stores/chat-store";
import { useSurveyStore } from "@/stores/survey-store";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan } from "@/lib/plan-limits";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { getPresetConfig, getModelEngineDefaults } from "@/lib/industry-presets";
import { getModelDef, isValidProductType, getAllModels, getAvailableEngines, getEngineLabel } from "@/lib/model-registry";
import type { BaseEngine } from "@/lib/model-registry";
import { V2DateRangeBar } from "@/components/v2/layout/V2Header";
import { FadeIn } from "@/components/v2/ui/FadeIn";
import { V2DashboardHero } from "@/components/v2/dashboard/V2DashboardHero";
import { V2KPIMetricGrid } from "@/components/v2/charts/V2KPIMetricCard";
import type { KPICardProps, HealthStatus } from "@/components/v2/charts/V2KPIMetricCard";
import { fmtK } from "@/components/v2/charts/v2-chart-utils";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import type { ModelConfig, EcomConfig, SaasConfig } from "@/lib/types";

// ─── Engine-specific component imports ───
import { Sidebar } from "@/components/layout/Sidebar";
import { EcomSidebar } from "@/components/layout/EcomSidebar";
import { SaasSidebar } from "@/components/layout/SaasSidebar";

import { SubscriptionCharts } from "@/components/dashboard/charts/SubscriptionCharts";
import { EcommerceCharts } from "@/components/dashboard/charts/EcommerceCharts";
import { SaasCharts } from "@/components/dashboard/charts/SaasCharts";

// Old KPI components removed — milestones & metrics now in V2DashboardHero

import { SubscriptionReports } from "@/components/dashboard/reports/FinancialReports";
import { EcommerceReports } from "@/components/dashboard/reports/FinancialReports";
import { SaasReports } from "@/components/dashboard/reports/SaasReports";

import dynamic from "next/dynamic";

function ReportLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-[#8181A5]">
      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading report...
    </div>
  );
}

const SubscriptionInvestorReport = dynamic(() => import("@/components/dashboard/investor/SubscriptionInvestorReport").then(m => ({ default: m.SubscriptionInvestorReport })), { ssr: false, loading: ReportLoadingFallback });
const EcommerceInvestorReport = dynamic(() => import("@/components/dashboard/investor/EcommerceInvestorReport").then(m => ({ default: m.EcommerceInvestorReport })), { ssr: false, loading: ReportLoadingFallback });
const SaasInvestorReport = dynamic(() => import("@/components/dashboard/investor/SaasInvestorReport").then(m => ({ default: m.SaasInvestorReport })), { ssr: false, loading: ReportLoadingFallback });

// ─── Engine component maps ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getConfigSelector(engine: BaseEngine): (s: any) => any {
  const selectors = {
    subscription: (s: ReturnType<typeof useConfigStore.getState>) => s.subscriptionConfig,
    ecommerce: (s: ReturnType<typeof useConfigStore.getState>) => s.ecommerceConfig,
    saas: (s: ReturnType<typeof useConfigStore.getState>) => s.saasConfig,
  };
  return selectors[engine];
}

const ENGINE_SIDEBAR: Record<BaseEngine, React.ComponentType<{ projectId: string | null; onProjectCreated: (id: string) => void; monthRange?: [number, number] | null; productType?: string }>> = {
  subscription: Sidebar,
  ecommerce: EcomSidebar,
  saas: SaasSidebar,
};

// AI context key columns per engine
const AI_CONTEXT_KEYS: Record<BaseEngine, string[]> = {
  subscription: ["Month", "Product Phase", "Total MRR", "Total Gross Revenue", "Net Revenue", "Net Profit", "EBITDA", "Total Active Users", "Blended CAC", "LTV", "LTV/CAC", "ARPU", "Gross Margin %", "ROI %", "Cash Balance", "Cumulative Net Profit", "Burn Rate", "Runway (Months)", "Cumulative ROAS"],
  ecommerce: ["Month", "Gross Revenue", "Net Revenue", "Net Profit", "EBITDA", "New Customers", "Returning Customers", "Total Orders", "AOV", "CAC", "LTV", "LTV/CAC", "Gross Margin %", "ROI %", "Cash Balance", "Cumulative Net Profit", "Ad Spend", "ROAS"],
  saas: ["Month", "ARR", "MRR", "Net Revenue", "Net Profit", "EBITDA", "Total Customers", "Total Seats", "NRR %", "Logo Churn %", "CAC", "LTV", "LTV/CAC", "Gross Margin %", "ROI %", "Cash Balance", "Cumulative Net Profit", "Quick Ratio", "Rule of 40", "Magic Number"],
};

// ─── Scenario builders per engine ───

function buildSubscriptionScenario(config: Record<string, unknown>) {
  const base = {
    conv: (config.sens_conv as number) / 100,
    churn: (config.sens_churn as number) / 100,
    cpi: (config.sens_cpi as number) / 100,
    organic: (config.sens_organic as number) / 100,
  };
  const bound = (config.scenario_bound as number) / 100;
  return {
    base,
    pessimistic: { conv: base.conv - bound, churn: base.churn + bound, cpi: base.cpi + bound, organic: base.organic - bound },
    optimistic: { conv: base.conv + bound, churn: base.churn - bound, cpi: base.cpi - bound, organic: base.organic + bound },
  };
}

function buildEcommerceScenario(config: Record<string, unknown>) {
  const base = {
    conv: (config.sens_conv as number) / 100,
    cpc: (config.sens_cpc as number) / 100,
    aov: (config.sens_aov as number) / 100,
    organic: (config.sens_organic as number) / 100,
  };
  const bound = (config.scenario_bound as number) / 100;
  return {
    base,
    pessimistic: { conv: base.conv - bound, cpc: base.cpc + bound, aov: base.aov - bound, organic: base.organic - bound },
    optimistic: { conv: base.conv + bound, cpc: base.cpc - bound, aov: base.aov + bound, organic: base.organic + bound },
  };
}

function buildSaasScenario(config: Record<string, unknown>) {
  const base = {
    conv: (config.sens_conv as number) / 100,
    churn: (config.sens_churn as number) / 100,
    expansion: (config.sens_expansion as number) / 100,
    organic: (config.sens_organic as number) / 100,
  };
  const bound = (config.scenario_bound as number) / 100;
  return {
    base,
    pessimistic: { conv: base.conv - bound, churn: base.churn + bound, expansion: base.expansion - bound, organic: base.organic - bound },
    optimistic: { conv: base.conv + bound, churn: base.churn - bound, expansion: base.expansion + bound, organic: base.organic + bound },
  };
}

const SCENARIO_BUILDERS: Record<BaseEngine, (config: Record<string, unknown>) => Record<string, Record<string, number>>> = {
  subscription: buildSubscriptionScenario,
  ecommerce: buildEcommerceScenario,
  saas: buildSaasScenario,
};

// ─── KPI builder helpers ───

type DataRow = Record<string, number | string | undefined>;

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
  /** If true, value is the sum across all rows instead of last row */
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

function buildKPICards(df: DataRow[], engine: BaseEngine): KPICardProps[] {
  if (!df || df.length < 2) return [];
  const defs = ENGINE_KPI_DEFS[engine];
  const lastRow = df[df.length - 1];
  const prevRow = df[df.length - 2];
  const cards: KPICardProps[] = [];

  for (const def of defs) {
    const col = findCol(lastRow, ...def.columns);
    if (!col) continue;

    // Sum across entire period for marked KPIs, otherwise use last row
    const val = def.sumPeriod
      ? df.reduce((sum, r) => sum + numVal(r, col), 0)
      : numVal(lastRow, col);
    const prev = def.sumPeriod
      ? df.slice(0, -1).reduce((sum, r) => sum + numVal(r, col), 0)
      : numVal(prevRow, col);
    const pctChange = prev !== 0 ? ((val - prev) / Math.abs(prev)) * 100 : 0;

    // Format value
    let formatted: string;
    switch (def.format) {
      case "currency": formatted = fmtK(val); break;
      case "pct": formatted = `${val.toFixed(1)}%`; break;
      case "ratio": formatted = `${val.toFixed(2)}x`; break;
      case "months": formatted = `${val.toFixed(1)}mo`; break;
      case "number": formatted = val.toLocaleString("en-US", { maximumFractionDigits: 0 }); break;
    }

    // Health status
    let health: HealthStatus = "neutral";
    if (def.healthGood && def.healthGood(val)) health = "good";
    else if (def.healthBad && def.healthBad(val)) health = "bad";
    else if (def.healthGood || def.healthBad) health = "caution";

    // Trend
    const trendStr = pctChange !== 0 ? `${pctChange > 0 ? "+" : ""}${pctChange.toFixed(1)}%` : undefined;
    const trendUp = pctChange > 0;
    const trendNeutral = pctChange === 0;

    // Sparkline from all months
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

// ─── Render functions per engine ───

function SubscriptionContent({ results, p1End, p2End }: { results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }) {
  return (
    <>
      <FadeIn delay={0}><SubscriptionCharts results={results} p1End={p1End} p2End={p2End} /></FadeIn>
      <FadeIn delay={0.05}><SubscriptionReports results={results.base} /></FadeIn>
    </>
  );
}

function EcommerceContent({ results, p1End, p2End }: { results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }) {
  return (
    <>
      <FadeIn delay={0}><EcommerceCharts results={results} p1End={p1End} p2End={p2End} /></FadeIn>
      <FadeIn delay={0.05}><EcommerceReports results={results.base} /></FadeIn>
    </>
  );
}

function SaasContent({ results, p1End, p2End }: { results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }) {
  return (
    <>
      <FadeIn delay={0}><SaasCharts results={results} p1End={p1End} p2End={p2End} /></FadeIn>
      <FadeIn delay={0.05}><SaasReports results={results.base} /></FadeIn>
    </>
  );
}

const ENGINE_CONTENT: Record<BaseEngine, React.ComponentType<{ results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }>> = {
  subscription: SubscriptionContent,
  ecommerce: EcommerceContent,
  saas: SaasContent,
};

const ENGINE_INVESTOR: Record<BaseEngine, React.ComponentType<{ projectName: string; data: import("@/lib/api").RunResult }>> = {
  subscription: SubscriptionInvestorReport,
  ecommerce: EcommerceInvestorReport,
  saas: SaasInvestorReport,
};

// ─── Main dashboard page ───

export function DashboardModelClient() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const dashboardRouter = useRouter();
  const modelType = params.modelType as string;

  if (!isValidProductType(modelType)) {
    notFound();
  }

  const modelDef = getModelDef(modelType);
  const availableEngines = getAvailableEngines(modelType);

  // Engine from URL param or default
  const engineParam = searchParams.get("engine") as BaseEngine | null;
  const engine: BaseEngine = (engineParam && availableEngines.some((e) => e.engine === engineParam))
    ? engineParam
    : modelDef.baseEngine;

  const config = useConfigStore(getConfigSelector(engine));
  const loadSub = useConfigStore((s) => s.loadSubscriptionConfig);
  const loadEcom = useConfigStore((s) => s.loadEcommerceConfig);
  const loadSaas = useConfigStore((s) => s.loadSaasConfig);
  const { results, loading, error, debouncedRun, monthRange, setMonthRange, totalMonths } = useDashboard(modelType, engine);
  const reportRef = useRef<HTMLDivElement>(null);
  const [showInvestorReport, setShowInvestorReport] = useState(false);
  const [configHidden, setConfigHidden] = useState(false);
  const { project, setProjectId } = useCurrentProject(modelType);
  const setDashboardContext = useChatStore((s) => s.setDashboardContext);
  const openAIPanel = useChatStore((s) => s.openPanel);
  const presetsApplied = useRef(false);

  // Switch engine: load defaults and update URL
  const switchEngine = useCallback((newEngine: BaseEngine) => {
    if (newEngine === engine) return;
    const defaults = getModelEngineDefaults(modelType, newEngine);
    if (newEngine === "subscription") loadSub(defaults as ModelConfig);
    else if (newEngine === "ecommerce") loadEcom(defaults as EcomConfig);
    else loadSaas(defaults as SaasConfig);
    // Update URL with new engine
    const url = newEngine === modelDef.baseEngine
      ? `/dashboard/${modelType}`
      : `/dashboard/${modelType}?engine=${newEngine}`;
    dashboardRouter.replace(url);
  }, [engine, modelType, modelDef.baseEngine, loadSub, loadEcom, loadSaas, dashboardRouter]);

  // Keep backend warm (prevents Render free-tier cold starts)
  useEffect(() => {
    startKeepAlive();
    return () => stopKeepAlive();
  }, []);

  // Apply industry presets from survey on first visit from onboarding
  useEffect(() => {
    if (presetsApplied.current) return;
    const fromOnboarding = searchParams.get("from") === "onboarding";
    if (!fromOnboarding) return;

    const surveyData = useSurveyStore.getState().data;
    if (!surveyData.projectType || !surveyData.industry) return;

    presetsApplied.current = true;
    const preset = getPresetConfig({
      productType: surveyData.projectType,
      industry: surveyData.industry === "Other" ? "" : surveyData.industry,
      stage: surveyData.stage,
      budget: surveyData.budget === "Other" ? surveyData.budgetCustom : surveyData.budget,
      engine,
    });

    if (engine === "subscription") {
      loadSub(preset as ModelConfig);
    } else if (engine === "ecommerce") {
      loadEcom(preset as EcomConfig);
    } else {
      loadSaas(preset as SaasConfig);
    }

    // Auto-open AI assistant for onboarding users
    openAIPanel();

    // Reset survey store now that presets are applied
    useSurveyStore.getState().reset();
  }, [searchParams, engine, loadSub, loadEcom, loadSaas, openAIPanel]);

  const buildScenarioParams = useCallback(() => {
    return SCENARIO_BUILDERS[engine](JSON.parse(JSON.stringify(config)));
  }, [engine, config]);

  useEffect(() => {
    const configDict = JSON.parse(JSON.stringify(config));
    debouncedRun(configDict, buildScenarioParams());
  }, [config, debouncedRun, buildScenarioParams]);

  useEffect(() => {
    if (!results) return;
    const base = results.base;
    const keys = AI_CONTEXT_KEYS[engine];
    const rows = (base.dataframe || []).map((row: Record<string, unknown>) => {
      const slim: Record<string, unknown> = {};
      for (const k of keys) if (k in row) slim[k] = row[k];
      return slim;
    });
    const context = JSON.stringify({
      model: modelType,
      engine,
      milestones: base.milestones,
      total_months: (config as unknown as Record<string, unknown>).total_months,
      monthly_data: rows,
    });
    setDashboardContext(modelType, context);
  }, [results, config, engine, modelType, setDashboardContext]);

  const p1End = (config as unknown as Record<string, unknown>).phase1_dur as number;
  const p2End = p1End + ((config as unknown as Record<string, unknown>).phase2_dur as number);

  const SidebarComponent = ENGINE_SIDEBAR[engine];
  const ContentComponent = ENGINE_CONTENT[engine];
  const InvestorReportComponent = ENGINE_INVESTOR[engine];
  const allModels = useMemo(() => getAllModels(), []);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [engineSelectorOpen, setEngineSelectorOpen] = useState(false);
  const { profile } = useProfile();
  const planReadOnly = !isActivePlan(profile?.plan ?? "expired");
  const currentEngineLabel = getEngineLabel(modelType, engine);

  const dashboardHeaderActions = (
    <div className="hidden md:flex items-center gap-2 flex-wrap w-full">
      {/* Model selector */}
      <div className="relative inline-block" data-tour="model-selector">
        <button
          onClick={() => { setModelSelectorOpen((v) => !v); setEngineSelectorOpen(false); }}
          className="flex items-center gap-2 text-sm font-bold text-[#1C1D21] bg-white border border-[#ECECF2] rounded-lg px-3 py-1.5 hover:border-[#2163E7] transition-colors"
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: modelDef.color }} />
          <span className="truncate max-w-[120px] sm:max-w-none">{modelDef.label}</span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`shrink-0 transition-transform ${modelSelectorOpen ? "rotate-180" : ""}`}>
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
        {modelSelectorOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setModelSelectorOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#ECECF2] rounded-xl shadow-lg z-20 py-2 max-h-80 overflow-y-auto">
              {allModels.map((m) => (
                <button
                  key={m.key}
                  onClick={() => {
                    setModelSelectorOpen(false);
                    if (m.key !== modelType) dashboardRouter.push(`/dashboard/${m.key}`);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#F8F8FC] transition-colors ${m.key === modelType ? "bg-[#F8F8FC] font-bold" : ""}`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                  <span className="text-[#1C1D21]">{m.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Engine selector */}
      {availableEngines.length > 1 && (
        <div className="relative inline-block">
          <button
            onClick={() => { setEngineSelectorOpen((v) => !v); setModelSelectorOpen(false); }}
            className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] bg-[#F8F8FC] border border-[#ECECF2] rounded-lg px-2.5 py-1.5 hover:border-[#2163E7] hover:text-[#1C1D21] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="8" cy="8" r="3" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
            </svg>
            <span className="truncate max-w-[100px] sm:max-w-none">{currentEngineLabel}</span>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`shrink-0 transition-transform ${engineSelectorOpen ? "rotate-180" : ""}`}>
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {engineSelectorOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setEngineSelectorOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-[#ECECF2] rounded-xl shadow-lg z-20 py-2">
                {availableEngines.map((opt) => (
                  <button
                    key={opt.engine}
                    onClick={() => {
                      setEngineSelectorOpen(false);
                      switchEngine(opt.engine);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[#F8F8FC] transition-colors ${opt.engine === engine ? "bg-[#F8F8FC] font-semibold text-[#2163E7]" : "text-[#1C1D21]"}`}
                  >
                    {opt.engine === engine && (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#2163E7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M3 8l3.5 3.5L13 4" />
                      </svg>
                    )}
                    {opt.engine !== engine && <span className="w-3" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Date range */}
      <V2DateRangeBar
        monthRange={monthRange}
        onMonthRangeChange={setMonthRange}
        totalMonths={totalMonths}
      />

      {/* Investor Report + PDF — right-aligned */}
      {results && (
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => {
              setShowInvestorReport((v) => {
                if (!v) setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                return !v;
              });
            }}
            className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold text-white bg-[#2163E7] rounded-[8px] hover:bg-[#1650b0] transition-colors shadow-v2-sm"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="2" y="1" width="12" height="14" rx="1.5" />
              <path d="M5 5h6M5 8h6M5 11h3" />
            </svg>
            {showInvestorReport ? "Hide Report" : "Investor Report"}
          </button>
          <button
            onClick={() => {
              if (planReadOnly) { useUpgradeStore.getState().showExpiredModal(); return; }
              generateInvestorPDF(project?.name ?? `${modelDef.label} Model`, modelType, engine, results.base);
            }}
            className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold text-[#1a1a2e] bg-white border border-[#eef0f6] rounded-[8px] hover:border-[#2163E7] transition-colors shadow-v2-sm"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M8 2v8M5 7l3 3 3-3" />
              <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
            </svg>
            PDF
          </button>
        </div>
      )}
    </div>
  );

  return (
    <AppShell headerActions={dashboardHeaderActions}>
      <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-3.5rem-1rem)]">
        {/* Config sidebar + toggle button */}
        {!configHidden && (
          <div className="hidden md:block flex-shrink-0 relative">
            <SidebarComponent projectId={project?.id ?? null} onProjectCreated={setProjectId} monthRange={monthRange} productType={modelType} />
            <button
              onClick={() => setConfigHidden(true)}
              className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full z-10 w-5 h-10 bg-[#ECECF2] hover:bg-[#DDE0E9] rounded-r-lg flex items-center justify-center text-[#8181A5] hover:text-[#1C1D21] transition-colors"
              title="Hide config panel"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>
          </div>
        )}
        {configHidden && (
          <button
            onClick={() => setConfigHidden(false)}
            className="hidden md:flex flex-shrink-0 self-center w-5 h-10 bg-[#ECECF2] hover:bg-[#DDE0E9] rounded-r-lg items-center justify-center text-[#8181A5] hover:text-[#1C1D21] transition-colors"
            title="Show config panel"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        )}
        {/* Mobile sidebar (no toggle) */}
        {!configHidden && <div className="md:hidden"><SidebarComponent projectId={project?.id ?? null} onProjectCreated={setProjectId} monthRange={monthRange} productType={modelType} /></div>}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:px-4 md:pt-4 md:pb-4 space-y-3 sm:space-y-4 relative">

          {loading && !results && (
            <div className="flex items-center justify-center py-20">
              <div className="text-[#8181A5]">Running model...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          )}

          {results && (
            <>
              {/* Investor Report — right below button bar */}
              {showInvestorReport && (
                <div ref={reportRef}>
                  <InvestorReportComponent
                    projectName={project?.name ?? `${modelDef.label} Model`}
                    data={results.base}
                  />
                </div>
              )}

              {/* v2 Hero Dashboard — MRR chart, metrics, cost donut, break-even */}
              <FadeIn delay={0}>
                <V2DashboardHero
                  data={(results.base.dataframe || []) as { Month: number; [key: string]: number | string | undefined }[]}
                  milestones={results.base.milestones}
                  engine={engine}
                />
              </FadeIn>

              {/* KPI Metric Grid — secondary metrics per engine */}
              <div data-tour="kpi-metrics">
              <FadeIn delay={0.03}>
                <V2KPIMetricGrid
                  kpis={buildKPICards(
                    (results.base.dataframe || []) as DataRow[],
                    engine,
                  )}
                  columns={3}
                  initialCount={6}
                />
              </FadeIn>
              </div>

              <ContentComponent results={results} p1End={p1End} p2End={p2End} />
            </>
          )}

          {loading && results && (
            <div className="fixed bottom-4 right-4 bg-[#2163E7] text-white px-3 py-1.5 rounded-lg text-sm shadow-lg">
              Updating...
            </div>
          )}
        </div>
      </div>
      <OnboardingTour />
    </AppShell>
  );
}

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
import { V2DateRangeBar as DateRangeBar } from "@/components/v2/layout/V2Header";
import { FadeIn } from "@/components/v2/ui/FadeIn";
import type { ModelConfig, EcomConfig, SaasConfig } from "@/lib/types";

// ─── Engine-specific component imports ───
import { Sidebar } from "@/components/layout/Sidebar";
import { EcomSidebar } from "@/components/layout/EcomSidebar";
import { SaasSidebar } from "@/components/layout/SaasSidebar";

import { SubscriptionCharts } from "@/components/dashboard/charts/SubscriptionCharts";
import { EcommerceCharts } from "@/components/dashboard/charts/EcommerceCharts";
import { SaasCharts } from "@/components/dashboard/charts/SaasCharts";

import { Milestones, KeyMetrics, EcomKeyMetrics } from "@/components/dashboard/executive/KPICards";
import { SaasMilestones, SaasKeyMetrics } from "@/components/dashboard/executive/SaasKPICards";

import { SubscriptionReports } from "@/components/dashboard/reports/FinancialReports";
import { EcommerceReports } from "@/components/dashboard/reports/FinancialReports";
import { SaasReports } from "@/components/dashboard/reports/SaasReports";

import dynamic from "next/dynamic";

const SubscriptionInvestorReport = dynamic(() => import("@/components/dashboard/investor/SubscriptionInvestorReport").then(m => ({ default: m.SubscriptionInvestorReport })), { ssr: false });
const EcommerceInvestorReport = dynamic(() => import("@/components/dashboard/investor/EcommerceInvestorReport").then(m => ({ default: m.EcommerceInvestorReport })), { ssr: false });
const SaasInvestorReport = dynamic(() => import("@/components/dashboard/investor/SaasInvestorReport").then(m => ({ default: m.SaasInvestorReport })), { ssr: false });

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

const ENGINE_SIDEBAR: Record<BaseEngine, React.ComponentType<{ projectId: string | null; onProjectCreated: (id: string) => void }>> = {
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

// ─── Render functions per engine ───

function SubscriptionContent({ results, p1End, p2End }: { results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }) {
  return (
    <>
      <FadeIn delay={0}><Milestones milestones={results.base.milestones} /></FadeIn>
      <FadeIn delay={0.05}><KeyMetrics results={results.base} milestones={results.base.milestones} /></FadeIn>
      <FadeIn delay={0.1}><SubscriptionCharts results={results} p1End={p1End} p2End={p2End} /></FadeIn>
      <FadeIn delay={0.15}><SubscriptionReports results={results.base} /></FadeIn>
    </>
  );
}

function EcommerceContent({ results, p1End, p2End }: { results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }) {
  return (
    <>
      <FadeIn delay={0}><Milestones milestones={results.base.milestones} /></FadeIn>
      <FadeIn delay={0.05}><EcomKeyMetrics results={results.base} milestones={results.base.milestones} /></FadeIn>
      <FadeIn delay={0.1}><EcommerceCharts results={results} p1End={p1End} p2End={p2End} /></FadeIn>
      <FadeIn delay={0.15}><EcommerceReports results={results.base} /></FadeIn>
    </>
  );
}

function SaasContent({ results, p1End, p2End }: { results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }) {
  return (
    <>
      <FadeIn delay={0}><SaasMilestones milestones={results.base.milestones} /></FadeIn>
      <FadeIn delay={0.05}><SaasKeyMetrics results={results.base} milestones={results.base.milestones} /></FadeIn>
      <FadeIn delay={0.1}><SaasCharts results={results} p1End={p1End} p2End={p2End} /></FadeIn>
      <FadeIn delay={0.15}><SaasReports results={results.base} /></FadeIn>
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

  return (
    <AppShell monthRange={monthRange} onMonthRangeChange={setMonthRange} totalMonths={totalMonths}>
      <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)]">
        {!configHidden && <SidebarComponent projectId={project?.id ?? null} onProjectCreated={setProjectId} />}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative">
          <button
            onClick={() => setConfigHidden(!configHidden)}
            className="hidden md:flex absolute top-3 left-0 z-10 w-6 h-10 bg-[#ECECF2] hover:bg-[#DDE0E9] rounded-r-lg items-center justify-center text-[#8181A5] hover:text-[#1C1D21] transition-colors"
            title={configHidden ? "Show config panel" : "Hide config panel"}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={configHidden ? "M6 3l5 5-5 5" : "M10 3L5 8l5 5"} />
            </svg>
          </button>

          {/* Model type selector + Engine selector + Date filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Model selector */}
            <div className="relative inline-block">
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
                  {/* Engine icon */}
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

            {/* Date range (desktop only) */}
            <div className="hidden md:block">
              <DateRangeBar
                monthRange={monthRange}
                onMonthRangeChange={setMonthRange}
                totalMonths={totalMonths}
              />
            </div>
          </div>

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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowInvestorReport((v) => !v)}
                  className="text-sm px-4 py-2 bg-[#2163E7] text-white rounded-md hover:bg-[#4B6FE0]"
                >
                  {showInvestorReport ? "Hide Investor Report" : "Investor Report"}
                </button>
                <button
                  onClick={() => {
                    if (planReadOnly) {
                      useUpgradeStore.getState().showExpiredModal();
                      return;
                    }
                    generateInvestorPDF(
                      project?.name ?? `${modelDef.label} Model`,
                      modelType,
                      engine,
                      results.base,
                    );
                  }}
                  className="text-sm px-4 py-2 border rounded-md hover:bg-muted"
                >
                  Download PDF
                </button>
              </div>

              {showInvestorReport && (
                <div ref={reportRef}>
                  <InvestorReportComponent
                    projectName={project?.name ?? `${modelDef.label} Model`}
                    data={results.base}
                  />
                </div>
              )}

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
    </AppShell>
  );
}

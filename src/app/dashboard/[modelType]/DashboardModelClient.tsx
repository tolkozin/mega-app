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
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import type { ModelConfig, EcomConfig, SaasConfig } from "@/lib/types";

import { SubscriptionCharts } from "@/components/dashboard/charts/SubscriptionCharts";
import { EcommerceCharts } from "@/components/dashboard/charts/EcommerceCharts";
import { SaasCharts } from "@/components/dashboard/charts/SaasCharts";
import { SubscriptionReports } from "@/components/dashboard/reports/FinancialReports";
import { EcommerceReports } from "@/components/dashboard/reports/FinancialReports";
import { SaasReports } from "@/components/dashboard/reports/SaasReports";

import dynamic from "next/dynamic";

import { ENGINE_SIDEBAR, getConfigSelector, AI_CONTEXT_KEYS } from "./engine-maps";
import { SCENARIO_BUILDERS } from "./scenario-builders";
import { buildKPICards, type DataRow } from "./kpi-builders";
import { SummaryTab } from "@/components/dashboard/tabs/SummaryTab";

const DASHBOARD_TABS = [
  { key: "overview", label: "Overview" },
  { key: "summary", label: "Summary" },
  { key: "scores", label: "Scores" },
  { key: "market", label: "Market" },
  { key: "roadmap", label: "Roadmap" },
  { key: "tracking", label: "Tracking" },
] as const;

type DashboardTab = (typeof DASHBOARD_TABS)[number]["key"];

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

// ─── Engine content & investor report maps ───

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
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
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
          <div className="hidden md:flex flex-shrink-0">
            <SidebarComponent projectId={project?.id ?? null} onProjectCreated={setProjectId} monthRange={monthRange} productType={modelType} />
            <button
              onClick={() => setConfigHidden(true)}
              className="self-center -ml-px w-5 h-10 bg-[#ECECF2] hover:bg-[#DDE0E9] rounded-lg flex items-center justify-center text-[#8181A5] hover:text-[#1C1D21] transition-colors z-10"
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-2 space-y-3 sm:space-y-4 relative bg-[#eef0f6]">

          {/* Dashboard tab navigation */}
          {results && (
            <div className="inline-flex h-10 items-center rounded-[10px] bg-[#e6e8f0] p-1 overflow-x-auto scrollbar-hide max-w-full">
              {DASHBOARD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-[8px] px-3 py-1.5 text-[12px] font-bold transition-all ${
                    activeTab === tab.key
                      ? "bg-white text-[#1a1a2e] shadow-v2-sm"
                      : "text-[#6b7280] hover:text-[#1a1a2e]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {loading && !results && (
            <div className="flex items-center justify-center py-20">
              <div className="text-[#8181A5]">Running model...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          )}

          {results && activeTab === "overview" && (
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

          {results && activeTab === "summary" && (
            <SummaryTab
              df={(results.base.dataframe || []) as DataRow[]}
              engine={engine}
              modelType={modelType}
              config={JSON.parse(JSON.stringify(config))}
              milestones={results.base.milestones}
            />
          )}

          {results && activeTab !== "overview" && activeTab !== "summary" && (
            <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)' }}>
              <div className="text-[32px] mb-3">🚧</div>
              <p className="text-[13px] font-extrabold text-[#1a1a2e] mb-1">
                {DASHBOARD_TABS.find((t) => t.key === activeTab)?.label} — Coming Soon
              </p>
              <p className="text-[11px] text-[#9ca3af]">
                This section is under development and will be available soon.
              </p>
            </div>
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

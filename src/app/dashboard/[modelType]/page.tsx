"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useConfigStore } from "@/stores/config-store";
import { useDashboard } from "@/hooks/useDashboard";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { AppShell } from "@/components/layout/AppShell";
import { exportToPDF } from "@/lib/pdf-export";
import { useChatStore } from "@/stores/chat-store";
import { getModelDef, getBaseEngine, isValidProductType } from "@/lib/model-registry";
import type { BaseEngine } from "@/lib/model-registry";

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

import { SubscriptionInvestorReport } from "@/components/dashboard/investor/SubscriptionInvestorReport";
import { EcommerceInvestorReport } from "@/components/dashboard/investor/EcommerceInvestorReport";
import { SaasInvestorReport } from "@/components/dashboard/investor/SaasInvestorReport";

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
      <Milestones milestones={results.base.milestones} />
      <KeyMetrics results={results.base} milestones={results.base.milestones} />
      <SubscriptionCharts results={results} p1End={p1End} p2End={p2End} />
      <SubscriptionReports results={results.base} />
    </>
  );
}

function EcommerceContent({ results, p1End, p2End }: { results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }) {
  return (
    <>
      <Milestones milestones={results.base.milestones} />
      <EcomKeyMetrics results={results.base} milestones={results.base.milestones} />
      <EcommerceCharts results={results} p1End={p1End} p2End={p2End} />
      <EcommerceReports results={results.base} />
    </>
  );
}

function SaasContent({ results, p1End, p2End }: { results: Record<string, import("@/lib/api").RunResult>; p1End: number; p2End: number }) {
  return (
    <>
      <SaasMilestones milestones={results.base.milestones} />
      <SaasKeyMetrics results={results.base} milestones={results.base.milestones} />
      <SaasCharts results={results} p1End={p1End} p2End={p2End} />
      <SaasReports results={results.base} />
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

export default function DashboardPage() {
  const params = useParams();
  const modelType = params.modelType as string;

  if (!isValidProductType(modelType)) {
    notFound();
  }

  const modelDef = getModelDef(modelType);
  const engine = modelDef.baseEngine;
  const config = useConfigStore(getConfigSelector(engine));
  const { results, loading, error, debouncedRun, monthRange, setMonthRange, totalMonths } = useDashboard(modelType);
  const reportRef = useRef<HTMLDivElement>(null);
  const [showInvestorReport, setShowInvestorReport] = useState(false);
  const [configHidden, setConfigHidden] = useState(false);
  const { project, setProjectId } = useCurrentProject(modelType);
  const setDashboardContext = useChatStore((s) => s.setDashboardContext);

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

  return (
    <AppShell title={`${modelDef.label} Dashboard`} monthRange={monthRange} onMonthRangeChange={setMonthRange} totalMonths={totalMonths}>
      <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)]">
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
                  className="text-sm px-4 py-2 bg-[#5E81F4] text-white rounded-md hover:bg-[#4B6FE0]"
                >
                  {showInvestorReport ? "Hide Investor Report" : "Investor Report"}
                </button>
                {showInvestorReport && (
                  <button
                    onClick={() => exportToPDF(reportRef, `${project?.name ?? modelType}_investor_report.pdf`)}
                    className="text-sm px-4 py-2 border rounded-md hover:bg-muted"
                  >
                    Download PDF
                  </button>
                )}
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
            <div className="fixed bottom-4 right-4 bg-[#5E81F4] text-white px-3 py-1.5 rounded-lg text-sm shadow-lg">
              Updating...
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

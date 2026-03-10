"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useConfigStore } from "@/stores/config-store";
import { useDashboard } from "@/hooks/useDashboard";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { AppShell } from "@/components/layout/AppShell";
import { SaasSidebar } from "@/components/layout/SaasSidebar";
import { SaasCharts } from "@/components/dashboard/charts/SaasCharts";
import { SaasMilestones, SaasKeyMetrics } from "@/components/dashboard/executive/SaasKPICards";
import { SaasReports } from "@/components/dashboard/reports/SaasReports";
import { SaasInvestorReport } from "@/components/dashboard/investor/SaasInvestorReport";
import { exportToPDF } from "@/lib/pdf-export";

import { useChatStore } from "@/stores/chat-store";

export default function SaasDashboardPage() {
  const config = useConfigStore((s) => s.saasConfig);
  const { results, loading, error, debouncedRun, monthRange, setMonthRange, totalMonths } = useDashboard("saas");
  const reportRef = useRef<HTMLDivElement>(null);
  const [showInvestorReport, setShowInvestorReport] = useState(false);
  const { project, setProjectId } = useCurrentProject("saas");

  const buildScenarioParams = useCallback(() => {
    const base = {
      conv: config.sens_conv / 100,
      churn: config.sens_churn / 100,
      expansion: config.sens_expansion / 100,
      organic: config.sens_organic / 100,
    };
    const bound = config.scenario_bound / 100;
    return {
      base,
      pessimistic: {
        conv: base.conv - bound,
        churn: base.churn + bound,
        expansion: base.expansion - bound,
        organic: base.organic - bound,
      },
      optimistic: {
        conv: base.conv + bound,
        churn: base.churn - bound,
        expansion: base.expansion + bound,
        organic: base.organic + bound,
      },
    };
  }, [config.sens_conv, config.sens_churn, config.sens_expansion, config.sens_organic, config.scenario_bound]);

  const setDashboardContext = useChatStore((s) => s.setDashboardContext);

  useEffect(() => {
    const configDict = JSON.parse(JSON.stringify(config));
    debouncedRun(configDict, buildScenarioParams());
  }, [config, debouncedRun, buildScenarioParams]);

  useEffect(() => {
    if (!results) return;
    const base = results.base;
    const keys = ["Month", "ARR", "MRR", "Net Revenue", "Net Profit", "EBITDA", "Total Customers", "Total Seats", "NRR %", "Logo Churn %", "CAC", "LTV", "LTV/CAC", "Gross Margin %", "ROI %", "Cash Balance", "Cumulative Net Profit", "Quick Ratio", "Rule of 40", "Magic Number"];
    const rows = (base.dataframe || []).map((row: Record<string, unknown>) => {
      const slim: Record<string, unknown> = {};
      for (const k of keys) if (k in row) slim[k] = row[k];
      return slim;
    });
    const context = JSON.stringify({
      model: "saas",
      milestones: base.milestones,
      total_months: config.total_months,
      monthly_data: rows,
    });
    setDashboardContext("saas", context);
  }, [results, config.total_months, setDashboardContext]);

  const p1End = config.phase1_dur;
  const p2End = config.phase1_dur + config.phase2_dur;

  return (
    <AppShell title="SaaS Dashboard" monthRange={monthRange} onMonthRangeChange={setMonthRange} totalMonths={totalMonths}>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <SaasSidebar projectId={project?.id ?? null} onProjectCreated={setProjectId} />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                    onClick={() => exportToPDF(reportRef, `${project?.name ?? "saas"}_investor_report.pdf`)}
                    className="text-sm px-4 py-2 border rounded-md hover:bg-muted"
                  >
                    Download PDF
                  </button>
                )}
              </div>

              {showInvestorReport && (
                <div ref={reportRef}>
                  <SaasInvestorReport
                    projectName={project?.name ?? "SaaS Model"}
                    data={results.base}
                  />
                </div>
              )}

              <SaasMilestones milestones={results.base.milestones} />
              <SaasKeyMetrics results={results.base} milestones={results.base.milestones} />
              <SaasCharts results={results} p1End={p1End} p2End={p2End} />
              <SaasReports results={results.base} />
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

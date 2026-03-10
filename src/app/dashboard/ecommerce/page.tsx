"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useConfigStore } from "@/stores/config-store";
import { useDashboard } from "@/hooks/useDashboard";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { AppShell } from "@/components/layout/AppShell";
import { EcomSidebar } from "@/components/layout/EcomSidebar";
import { EcommerceCharts } from "@/components/dashboard/charts/EcommerceCharts";
import { Milestones, EcomKeyMetrics } from "@/components/dashboard/executive/KPICards";
import { EcommerceReports } from "@/components/dashboard/reports/FinancialReports";
import { EcommerceInvestorReport } from "@/components/dashboard/investor/EcommerceInvestorReport";
import { exportToPDF } from "@/lib/pdf-export";
import { exportCSV } from "@/lib/api";
import { useChatStore } from "@/stores/chat-store";

export default function EcommerceDashboardPage() {
  const config = useConfigStore((s) => s.ecommerceConfig);
  const { results, loading, error, debouncedRun, monthRange, setMonthRange, totalMonths } = useDashboard("ecommerce");
  const reportRef = useRef<HTMLDivElement>(null);
  const [showInvestorReport, setShowInvestorReport] = useState(false);
  const { project, setProjectId } = useCurrentProject("ecommerce");

  const buildScenarioParams = useCallback(() => {
    const base = {
      conv: config.sens_conv / 100,
      cpc: config.sens_cpc / 100,
      aov: config.sens_aov / 100,
      organic: config.sens_organic / 100,
    };
    const bound = config.scenario_bound / 100;
    return {
      base,
      pessimistic: {
        conv: base.conv - bound,
        cpc: base.cpc + bound,
        aov: base.aov - bound,
        organic: base.organic - bound,
      },
      optimistic: {
        conv: base.conv + bound,
        cpc: base.cpc - bound,
        aov: base.aov + bound,
        organic: base.organic + bound,
      },
    };
  }, [config.sens_conv, config.sens_cpc, config.sens_aov, config.sens_organic, config.scenario_bound]);

  const setDashboardContext = useChatStore((s) => s.setDashboardContext);

  useEffect(() => {
    const configDict = JSON.parse(JSON.stringify(config));
    debouncedRun(configDict, buildScenarioParams());
  }, [config, debouncedRun, buildScenarioParams]);

  useEffect(() => {
    if (!results) return;
    const base = results.base;
    const rows = (base.dataframe || []).slice(0, 5);
    const context = JSON.stringify({
      model: "ecommerce",
      milestones: base.milestones,
      sample_months: rows,
      total_months: config.total_months,
    });
    setDashboardContext("ecommerce", context);
  }, [results, config.total_months, setDashboardContext]);

  const handleExport = async () => {
    try {
      const blob = await exportCSV("ecommerce", JSON.parse(JSON.stringify(config)));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ecommerce_model.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  const p1End = config.phase1_dur;
  const p2End = config.phase1_dur + config.phase2_dur;

  return (
    <AppShell title="E-commerce Dashboard" monthRange={monthRange} onMonthRangeChange={setMonthRange} totalMonths={totalMonths}>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <EcomSidebar projectId={project?.id ?? null} onProjectCreated={setProjectId} />
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
                    onClick={() => exportToPDF(reportRef, `${project?.name ?? "ecommerce"}_investor_report.pdf`)}
                    className="text-sm px-4 py-2 border rounded-md hover:bg-muted"
                  >
                    Download PDF
                  </button>
                )}
              </div>

              {showInvestorReport && (
                <div ref={reportRef}>
                  <EcommerceInvestorReport
                    projectName={project?.name ?? "E-commerce Model"}
                    data={results.base}
                  />
                </div>
              )}

              <Milestones milestones={results.base.milestones} />
              <EcomKeyMetrics results={results.base} milestones={results.base.milestones} />
              <EcommerceCharts results={results} p1End={p1End} p2End={p2End} />
              <EcommerceReports results={results.base} onExport={handleExport} />
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

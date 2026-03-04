"use client";

import { useEffect, useCallback } from "react";
import { useConfigStore } from "@/stores/config-store";
import { useDashboard } from "@/hooks/useDashboard";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { EcomSidebar } from "@/components/layout/EcomSidebar";
import { EcommerceCharts } from "@/components/dashboard/charts/EcommerceCharts";
import { Milestones, EcomKeyMetrics } from "@/components/dashboard/executive/KPICards";
import { EcommerceReports } from "@/components/dashboard/reports/FinancialReports";
import { exportCSV } from "@/lib/api";

export default function EcommerceDashboardPage() {
  const config = useConfigStore((s) => s.ecommerceConfig);
  const { results, loading, error, debouncedRun } = useDashboard("ecommerce");
  const { project } = useCurrentProject("ecommerce");

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

  useEffect(() => {
    const configDict = JSON.parse(JSON.stringify(config));
    debouncedRun(configDict, buildScenarioParams());
  }, [config, debouncedRun, buildScenarioParams]);

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
    <div className="flex">
      <EcomSidebar projectId={project?.id ?? null} />
      <div className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-6 space-y-6">
        {loading && !results && (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Running model...</div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>
        )}

        {results && (
          <>
            <Milestones milestones={results.base.milestones} />
            <EcomKeyMetrics results={results.base} milestones={results.base.milestones} />
            <EcommerceCharts results={results} p1End={p1End} p2End={p2End} />
            <EcommerceReports results={results.base} onExport={handleExport} />
          </>
        )}

        {loading && results && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm shadow-lg">
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}

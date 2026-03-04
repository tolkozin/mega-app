"use client";

import { useEffect, useCallback } from "react";
import { useConfigStore } from "@/stores/config-store";
import { useDashboard } from "@/hooks/useDashboard";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { Sidebar } from "@/components/layout/Sidebar";
import { SubscriptionCharts } from "@/components/dashboard/charts/SubscriptionCharts";
import { Milestones, KeyMetrics } from "@/components/dashboard/executive/KPICards";
import { SubscriptionReports } from "@/components/dashboard/reports/FinancialReports";
import { exportCSV } from "@/lib/api";

export default function SubscriptionDashboardPage() {
  const config = useConfigStore((s) => s.subscriptionConfig);
  const { results, loading, error, debouncedRun } = useDashboard("subscription");
  const { project } = useCurrentProject("subscription");

  const buildScenarioParams = useCallback(() => {
    const base = {
      conv: config.sens_conv / 100,
      churn: config.sens_churn / 100,
      cpi: config.sens_cpi / 100,
      organic: config.sens_organic / 100,
    };
    const bound = config.scenario_bound / 100;
    return {
      base,
      pessimistic: {
        conv: base.conv - bound,
        churn: base.churn + bound,
        cpi: base.cpi + bound,
        organic: base.organic - bound,
      },
      optimistic: {
        conv: base.conv + bound,
        churn: base.churn - bound,
        cpi: base.cpi - bound,
        organic: base.organic + bound,
      },
    };
  }, [config.sens_conv, config.sens_churn, config.sens_cpi, config.sens_organic, config.scenario_bound]);

  useEffect(() => {
    const configDict = JSON.parse(JSON.stringify(config));
    debouncedRun(configDict, buildScenarioParams());
  }, [config, debouncedRun, buildScenarioParams]);

  const handleExport = async () => {
    try {
      const blob = await exportCSV("subscription", JSON.parse(JSON.stringify(config)));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscription_model.csv";
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
      <Sidebar projectId={project?.id ?? null} />
      <div className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-6 space-y-6">
        {loading && !results && (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Running model...</div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {results && (
          <>
            <Milestones milestones={results.base.milestones} />
            <KeyMetrics results={results.base} milestones={results.base.milestones} />
            <SubscriptionCharts results={results} p1End={p1End} p2End={p2End} />
            <SubscriptionReports results={results.base} onExport={handleExport} />
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

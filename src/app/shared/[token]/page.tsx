"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/hooks/useDashboard";
import { SubscriptionCharts } from "@/components/dashboard/charts/SubscriptionCharts";
import { EcommerceCharts } from "@/components/dashboard/charts/EcommerceCharts";
import { Milestones, KeyMetrics, EcomKeyMetrics } from "@/components/dashboard/executive/KPICards";
import type { Project, Scenario } from "@/lib/types";

export default function SharedDashboardPage() {
  const params = useParams();
  const token = params.token as string;
  const [project, setProject] = useState<Project | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [error, setError] = useState("");
  const [modelType, setModelType] = useState<"subscription" | "ecommerce">("subscription");

  const { results, loading, runModel } = useDashboard(modelType);

  useEffect(() => {
    const fetchShared = async () => {
      const supabase = createClient();

      const { data: proj, error: projError } = await supabase
        .from("projects")
        .select("*")
        .eq("public_token", token)
        .eq("is_public", true)
        .single();

      if (projError || !proj) {
        setError("Dashboard not found or not public");
        return;
      }

      setProject(proj);
      setModelType(proj.product_type as "subscription" | "ecommerce");

      const { data: scenarios } = await supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", proj.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (scenarios && scenarios.length > 0) {
        setScenario(scenarios[0]);
      }
    };

    fetchShared();
  }, [token]);

  const runPublicModel = useCallback(() => {
    if (!scenario) return;
    const config = JSON.parse(JSON.stringify(scenario.config)) as Record<string, unknown>;
    runModel(config);
  }, [scenario, runModel]);

  useEffect(() => {
    if (scenario) runPublicModel();
  }, [scenario, runPublicModel]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#8181A5]">{error}</p>
      </div>
    );
  }

  if (!project || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#8181A5]">Loading shared dashboard...</p>
      </div>
    );
  }

  const cfg = scenario?.config as unknown as Record<string, number> | undefined;
  const p1End = cfg?.phase1_dur ?? 3;
  const p2End = p1End + (cfg?.phase2_dur ?? 3);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1D21]">{project.name}</h1>
          <p className="text-sm text-[#8181A5]">
            Public dashboard &middot; {project.product_type} &middot; Read-only
          </p>
        </div>
      </div>

      {results && (
        <>
          <Milestones milestones={results.base.milestones} />
          {modelType === "subscription" ? (
            <>
              <KeyMetrics results={results.base} milestones={results.base.milestones} />
              <SubscriptionCharts results={results} p1End={p1End} p2End={p2End} />
            </>
          ) : (
            <>
              <EcomKeyMetrics results={results.base} milestones={results.base.milestones} />
              <EcommerceCharts results={results} p1End={p1End} p2End={p2End} />
            </>
          )}
        </>
      )}
    </div>
  );
}

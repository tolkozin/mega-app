"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useScenarios, UpgradeRequiredError } from "@/hooks/useProject";
import { useUpgradeStore } from "@/stores/upgrade-store";
import type { Project } from "@/lib/types";
import { useConfigStore } from "@/stores/config-store";
import { AppShell } from "@/components/layout/AppShell";
import { getBaseEngine } from "@/lib/model-registry";

export default function ScenariosPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { scenarios, loading, saveScenario, deleteScenario } = useScenarios(projectId);
  const subscriptionConfig = useConfigStore((s) => s.subscriptionConfig);
  const ecommerceConfig = useConfigStore((s) => s.ecommerceConfig);
  const saasConfig = useConfigStore((s) => s.saasConfig);
  const loadSub = useConfigStore((s) => s.loadSubscriptionConfig);
  const loadEcom = useConfigStore((s) => s.loadEcommerceConfig);
  const loadSaas = useConfigStore((s) => s.loadSaasConfig);

  const [project, setProject] = useState<Project | null>(null);
  const [userRole, setUserRole] = useState<"owner" | "editor" | "viewer">("owner");
  const [showSave, setShowSave] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [configType, setConfigType] = useState<string>("subscription");

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (data) {
        setProject(data as Project);
        setConfigType(data.product_type);

        // Determine role: owner or shared
        if (user && data.user_id === user.id) {
          setUserRole("owner");
        } else if (user) {
          const { data: share } = await supabase
            .from("project_shares")
            .select("role")
            .eq("project_id", projectId)
            .eq("shared_with_id", user.id)
            .single();
          setUserRole((share?.role as "viewer" | "editor") ?? "viewer");
        }
      }
    };
    fetchProject();
  }, [projectId]);

  const canEdit = userRole === "owner" || userRole === "editor";

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const engine = getBaseEngine(configType);
      const config = engine === "subscription"
        ? JSON.parse(JSON.stringify(subscriptionConfig))
        : engine === "saas"
        ? JSON.parse(JSON.stringify(saasConfig))
        : JSON.parse(JSON.stringify(ecommerceConfig));
      await saveScenario(name, notes, config);
      setName("");
      setNotes("");
      setShowSave(false);
    } catch (err) {
      if (err instanceof UpgradeRequiredError) {
        useUpgradeStore.getState().showUpgradeModal({
          feature: err.feature,
          currentPlan: err.currentPlan,
          limitValue: err.limitValue,
        });
      } else {
        alert(err instanceof Error ? err.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = (config: unknown) => {
    const cfg = config as Record<string, unknown>;
    const type = (cfg.product_type as string) || project?.product_type || "subscription";
    const engine = getBaseEngine(type);
    if (engine === "ecommerce") {
      loadEcom(cfg as unknown as import("@/lib/types").EcomConfig);
    } else if (engine === "saas") {
      loadSaas(cfg as unknown as import("@/lib/types").SaasConfig);
    } else {
      loadSub(cfg as unknown as import("@/lib/types").ModelConfig);
    }
    router.push(`/dashboard/${project?.product_type ?? type}`);
  };

  const handleDelete = async (id: string, scenarioName: string) => {
    if (!confirm(`Delete scenario "${scenarioName}"?`)) return;
    try {
      await deleteScenario(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const configTypeOptions = [
    { value: "subscription", label: "Mobile App" },
    { value: "ecommerce", label: "E-Commerce" },
    { value: "saas", label: "SaaS B2B" },
  ];

  return (
    <AppShell title="Scenarios">
      <div className="p-6 max-w-3xl">
        <Link href={`/projects/${projectId}`} className="text-sm text-[#8181A5] hover:text-[#2163E7] transition-colors mb-4 inline-flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Back to Project
        </Link>

        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#1C1D21]">{project?.name ?? "Scenarios"}</h2>
            {userRole !== "owner" && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${userRole === "editor" ? "bg-[#F4BE5E]/10 text-[#F4BE5E]" : "bg-[#ECECF2] text-[#8181A5]"}`}>
                {userRole}
              </span>
            )}
          </div>
          {canEdit ? (
            <button
              onClick={() => setShowSave(!showSave)}
              className="h-9 px-4 bg-[#2163E7] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors"
            >
              {showSave ? "Cancel" : "Save Current Config"}
            </button>
          ) : (
            <span className="text-xs text-[#8181A5] bg-[#F8F8FC] border border-[#ECECF2] px-3 py-2 rounded-lg">
              View only — you cannot create or modify scenarios
            </span>
          )}
        </div>

        {showSave && canEdit && (
          <div className="bg-white rounded-xl border border-[#ECECF2] p-5 mb-6">
            <h3 className="text-[15px] font-bold text-[#1C1D21] mb-4">Save Scenario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1C1D21] mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Scenario name"
                  className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1C1D21] mb-2">Notes</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1C1D21] mb-2">Config Type</label>
                <div className="flex gap-4">
                  {configTypeOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm text-[#1C1D21] cursor-pointer">
                      <input
                        type="radio"
                        checked={configType === opt.value}
                        onChange={() => setConfigType(opt.value)}
                        className="accent-[#2163E7]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="h-9 px-4 bg-[#2163E7] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-[#8181A5]">Loading scenarios...</p>
        ) : scenarios.length === 0 ? (
          <p className="text-[#8181A5]">No saved scenarios. Configure the model and save a scenario.</p>
        ) : (
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="bg-white rounded-xl border border-[#ECECF2] flex items-center justify-between p-4">
                <div>
                  <p className="font-bold text-[#1C1D21] text-sm">{scenario.name}</p>
                  {scenario.notes && <p className="text-sm text-[#8181A5]">{scenario.notes}</p>}
                  <p className="text-xs text-[#8181A5] mt-1">
                    {new Date(scenario.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoad(scenario.config)}
                    className="h-8 px-3 bg-[#2163E7] text-white text-xs font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors"
                  >
                    Load
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(scenario.id, scenario.name)}
                      className="h-8 px-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

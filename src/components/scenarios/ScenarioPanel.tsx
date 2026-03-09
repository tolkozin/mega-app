"use client";

import { useState } from "react";
import { useScenarios } from "@/hooks/useProject";
import { useConfigStore } from "@/stores/config-store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModelConfig, EcomConfig, SaasConfig } from "@/lib/types";

interface ScenarioPanelProps {
  projectId: string | null;
  modelType: "subscription" | "ecommerce" | "saas";
  onProjectCreated?: (projectId: string) => void;
}

const MODEL_LABELS: Record<string, string> = {
  subscription: "Subscription",
  ecommerce: "E-commerce",
  saas: "SaaS",
};

function CreateProjectForm({
  modelType,
  onCreated,
}: {
  modelType: "subscription" | "ecommerce" | "saas";
  onCreated: (projectId: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    setError("");
    setCreating(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: insertErr } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim(),
          product_type: modelType,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      if (!data) throw new Error("No data returned");

      onCreated(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-3 space-y-2">
      <p className="text-xs text-[#8181A5]">
        No {MODEL_LABELS[modelType]} project yet. Create one to save scenarios.
      </p>
      {!showForm ? (
        <Button
          size="sm"
          onClick={() => {
            setName(`My ${MODEL_LABELS[modelType]} Project`);
            setShowForm(true);
          }}
          className="w-full h-8 text-xs"
        >
          New Project
        </Button>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-8 text-sm"
          />
          {error && (
            <p className="text-xs text-[#E54545]">{error}</p>
          )}
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="flex-1 h-8 text-xs"
            >
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ScenarioPanel({ projectId, modelType, onProjectCreated }: ScenarioPanelProps) {
  const { scenarios, loading, saveScenario, deleteScenario } = useScenarios(projectId);
  const subscriptionConfig = useConfigStore((s) => s.subscriptionConfig);
  const ecommerceConfig = useConfigStore((s) => s.ecommerceConfig);
  const saasConfig = useConfigStore((s) => s.saasConfig);
  const loadSub = useConfigStore((s) => s.loadSubscriptionConfig);
  const loadEcom = useConfigStore((s) => s.loadEcommerceConfig);
  const loadSaas = useConfigStore((s) => s.loadSaasConfig);
  const resetSub = useConfigStore((s) => s.resetSubscription);
  const resetEcom = useConfigStore((s) => s.resetEcommerce);
  const resetSaas = useConfigStore((s) => s.resetSaas);

  const [showSave, setShowSave] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const config = modelType === "subscription"
        ? JSON.parse(JSON.stringify(subscriptionConfig))
        : modelType === "ecommerce"
        ? JSON.parse(JSON.stringify(ecommerceConfig))
        : JSON.parse(JSON.stringify(saasConfig));
      await saveScenario(name, notes, config);
      setName("");
      setNotes("");
      setShowSave(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save scenario");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = (id: string, config: unknown) => {
    const cfg = config as Record<string, unknown>;
    if (modelType === "saas" || cfg.product_type === "saas") {
      loadSaas(cfg as unknown as SaasConfig);
    } else if (modelType === "ecommerce" || cfg.product_type === "ecommerce") {
      loadEcom(cfg as unknown as EcomConfig);
    } else {
      loadSub(cfg as unknown as ModelConfig);
    }
    setActiveScenarioId(id);
  };

  const handleNew = () => {
    if (modelType === "subscription") resetSub();
    else if (modelType === "ecommerce") resetEcom();
    else resetSaas();
    setActiveScenarioId(null);
  };

  const handleDelete = async (id: string, scenarioName: string) => {
    if (!confirm(`Delete scenario "${scenarioName}"?`)) return;
    try {
      await deleteScenario(id);
      if (activeScenarioId === id) setActiveScenarioId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="border-t">
      <div className="p-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Scenarios</h3>
        {projectId && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleNew}
              className="h-7 text-xs"
            >
              New
            </Button>
            <Button
              size="sm"
              variant={showSave ? "outline" : "default"}
              onClick={() => setShowSave(!showSave)}
              className="h-7 text-xs"
            >
              {showSave ? "Cancel" : "Save"}
            </Button>
          </div>
        )}
      </div>

      {!projectId ? (
        <CreateProjectForm
          modelType={modelType}
          onCreated={(id) => onProjectCreated?.(id)}
        />
      ) : (
        <>
          {showSave && (
            <div className="px-3 pb-3 space-y-2">
              <Input
                placeholder="Scenario name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="w-full h-8 text-xs"
              >
                {saving ? "Saving..." : "Save Scenario"}
              </Button>
            </div>
          )}

          <div className="px-3 pb-3 space-y-1 max-h-60 overflow-y-auto">
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : scenarios.length === 0 ? (
              <p className="text-xs text-muted-foreground">No saved scenarios</p>
            ) : (
              scenarios.map((s) => {
                const isActive = activeScenarioId === s.id;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between border rounded-md p-2 text-xs hover:bg-muted/50 ${isActive ? "border-[#5E81F4] bg-[#F4F6FF]" : ""}`}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium truncate">{s.name}{isActive && <span className="text-[#5E81F4] ml-1">(active)</span>}</p>
                      {s.notes && <p className="text-muted-foreground truncate">{s.notes}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLoad(s.id, s.config)}
                        className="h-6 px-2 text-xs"
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                      >
                        Del
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

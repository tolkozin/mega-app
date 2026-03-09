"use client";

import { useState } from "react";
import { useScenarios } from "@/hooks/useProject";
import { useConfigStore } from "@/stores/config-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModelConfig, EcomConfig, SaasConfig } from "@/lib/types";

interface ScenarioPanelProps {
  projectId: string | null;
  modelType: "subscription" | "ecommerce" | "saas";
}

export function ScenarioPanel({ projectId, modelType }: ScenarioPanelProps) {
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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (!projectId) {
    return (
      <div className="p-3 text-xs text-muted-foreground">
        No project selected. Scenarios unavailable.
      </div>
    );
  }

  return (
    <div className="border-t">
      <div className="p-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Scenarios</h3>
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
      </div>

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
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useScenarios } from "@/hooks/useProject";
import { useConfigStore } from "@/stores/config-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScenariosPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { scenarios, loading, saveScenario, deleteScenario } = useScenarios(projectId);
  const subscriptionConfig = useConfigStore((s) => s.subscriptionConfig);
  const ecommerceConfig = useConfigStore((s) => s.ecommerceConfig);
  const loadSub = useConfigStore((s) => s.loadSubscriptionConfig);
  const loadEcom = useConfigStore((s) => s.loadEcommerceConfig);

  const [showSave, setShowSave] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [configType, setConfigType] = useState<"subscription" | "ecommerce">("subscription");

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const config = configType === "subscription"
        ? JSON.parse(JSON.stringify(subscriptionConfig))
        : JSON.parse(JSON.stringify(ecommerceConfig));
      await saveScenario(name, notes, config);
      setName("");
      setNotes("");
      setShowSave(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = (config: unknown) => {
    const cfg = config as Record<string, unknown>;
    if (cfg.product_type === "ecommerce") {
      loadEcom(cfg as unknown as import("@/lib/types").EcomConfig);
    } else {
      loadSub(cfg as unknown as import("@/lib/types").ModelConfig);
    }
    alert("Scenario loaded into sidebar. Go to Dashboard to see results.");
  };

  const handleDelete = async (id: string, scenarioName: string) => {
    if (!confirm(`Delete scenario "${scenarioName}"?`)) return;
    try {
      await deleteScenario(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Scenarios</h1>
        <Button onClick={() => setShowSave(!showSave)}>
          {showSave ? "Cancel" : "Save Current Config"}
        </Button>
      </div>

      {showSave && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Save Scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Scenario name" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
            </div>
            <div className="space-y-2">
              <Label>Config Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={configType === "subscription"}
                    onChange={() => setConfigType("subscription")}
                  />
                  Subscription
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={configType === "ecommerce"}
                    onChange={() => setConfigType("ecommerce")}
                  />
                  E-commerce
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading scenarios...</p>
      ) : scenarios.length === 0 ? (
        <p className="text-muted-foreground">No saved scenarios. Configure the model and save a scenario.</p>
      ) : (
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{scenario.name}</p>
                  {scenario.notes && <p className="text-sm text-muted-foreground">{scenario.notes}</p>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(scenario.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleLoad(scenario.config)}>
                    Load
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(scenario.id, scenario.name)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

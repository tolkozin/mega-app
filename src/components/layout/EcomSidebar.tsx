"use client";

import { useConfigStore } from "@/stores/config-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EcomPhaseConfig } from "@/lib/types";

function NumberField({ label, value, onChange, min, max, step, help }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; help?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min} max={max} step={step || 1}
        className="h-8 text-sm"
        title={help}
      />
    </div>
  );
}

function Accordion({ title, children, defaultOpen }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="border-b">
      <summary className="cursor-pointer py-2 px-3 text-sm font-medium hover:bg-muted/50">{title}</summary>
      <div className="px-3 pb-3 space-y-3">{children}</div>
    </details>
  );
}

function EcomPhaseSection({ phase, phaseNum }: { phase: EcomPhaseConfig; phaseNum: 1 | 2 | 3 }) {
  const setPhase = useConfigStore((s) => s.setEcommercePhase);
  const update = (partial: Partial<EcomPhaseConfig>) => setPhase(phaseNum, partial);

  return (
    <Accordion title={`Phase ${phaseNum}`}>
      <NumberField label="AOV ($)" value={phase.avg_order_value} onChange={(v) => update({ avg_order_value: v })} min={0} step={1} />
      <NumberField label="Repeat Purchase Rate (%)" value={phase.repeat_purchase_rate} onChange={(v) => update({ repeat_purchase_rate: v })} min={0} max={100} step={1} />
      <NumberField label="Orders/Returning Customer" value={phase.orders_per_returning} onChange={(v) => update({ orders_per_returning: v })} min={1} step={0.1} />
      <NumberField label="COGS (%)" value={phase.cogs_pct} onChange={(v) => update({ cogs_pct: v })} min={0} max={100} step={1} />
      <NumberField label="Return Rate (%)" value={phase.return_rate} onChange={(v) => update({ return_rate: v })} min={0} max={100} step={0.5} />
      <NumberField label="Ad Budget ($/mo)" value={phase.ad_budget} onChange={(v) => update({ ad_budget: v })} min={0} step={500} />
      <NumberField label="CPC ($)" value={phase.cpc} onChange={(v) => update({ cpc: v })} min={0.01} step={0.1} />
      <NumberField label="Click-to-Purchase (%)" value={phase.click_to_purchase} onChange={(v) => update({ click_to_purchase: v })} min={0} max={100} step={0.5} />
      <NumberField label="Organic (%)" value={phase.organic_pct} onChange={(v) => update({ organic_pct: v })} min={0} max={100} step={1} />
      <NumberField label="Discount Rate (%)" value={phase.discount_rate} onChange={(v) => update({ discount_rate: v })} min={0} max={100} step={1} />
    </Accordion>
  );
}

export function EcomSidebar() {
  const config = useConfigStore((s) => s.ecommerceConfig);
  const setConfig = useConfigStore((s) => s.setEcommerceConfig);

  return (
    <aside className="w-80 border-r bg-background overflow-y-auto h-[calc(100vh-3.5rem)] flex-shrink-0">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">E-commerce Model Config</h2>
      </div>

      <Accordion title="General" defaultOpen>
        <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={12} max={120} />
        <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} />
        <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} />
      </Accordion>

      <Accordion title="OpEx">
        <NumberField label="Base Salaries ($/mo)" value={config.salaries_base} onChange={(v) => setConfig({ salaries_base: v })} min={0} step={500} />
        <NumberField label="Salary Growth (%/mo)" value={config.salaries_growth} onChange={(v) => setConfig({ salaries_growth: v })} min={0} step={0.5} />
        <NumberField label="Misc Costs ($/mo)" value={config.misc_costs} onChange={(v) => setConfig({ misc_costs: v })} min={0} step={100} />
        <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} />
      </Accordion>

      <Accordion title="Sensitivity">
        <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} />
        <NumberField label="CPC (%)" value={config.sens_cpc} onChange={(v) => setConfig({ sens_cpc: v })} min={-100} max={100} />
        <NumberField label="AOV (%)" value={config.sens_aov} onChange={(v) => setConfig({ sens_aov: v })} min={-100} max={100} />
        <NumberField label="Organic (%)" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} />
        <NumberField label="Scenario Bound (%)" value={config.scenario_bound} onChange={(v) => setConfig({ scenario_bound: v })} min={0} max={100} />
      </Accordion>

      <Accordion title="Monte Carlo">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.mc_enabled}
            onChange={(e) => setConfig({ mc_enabled: e.target.checked })}
          />
          Enable Monte Carlo
        </label>
        {config.mc_enabled && (
          <>
            <NumberField label="Iterations" value={config.mc_iterations} onChange={(v) => setConfig({ mc_iterations: v })} min={50} max={1000} step={50} />
            <NumberField label="Variance (%)" value={config.mc_variance} onChange={(v) => setConfig({ mc_variance: v })} min={1} max={100} />
          </>
        )}
      </Accordion>

      <EcomPhaseSection phase={config.phase1} phaseNum={1} />
      <EcomPhaseSection phase={config.phase2} phaseNum={2} />
      <EcomPhaseSection phase={config.phase3} phaseNum={3} />
    </aside>
  );
}

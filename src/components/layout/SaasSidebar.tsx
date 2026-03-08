"use client";

import { useConfigStore } from "@/stores/config-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import type { SaasPhaseConfig } from "@/lib/types";

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

function SaasPhaseSection({ phase, phaseNum }: { phase: SaasPhaseConfig; phaseNum: 1 | 2 | 3 }) {
  const setPhase = useConfigStore((s) => s.setSaasPhase);
  const update = (partial: Partial<SaasPhaseConfig>) => setPhase(phaseNum, partial);

  return (
    <Accordion title={`Phase ${phaseNum}`}>
      <NumberField label="Seats per Account" value={phase.seats_per_account} onChange={(v) => update({ seats_per_account: v })} min={1} step={1} />
      <NumberField label="Price per Seat ($/mo)" value={phase.price_per_seat} onChange={(v) => update({ price_per_seat: v })} min={0} step={1} />
      <NumberField label="Annual Contract (%)" value={phase.annual_contract_pct} onChange={(v) => update({ annual_contract_pct: v })} min={0} max={100} step={5} />
      <NumberField label="Annual Discount (%)" value={phase.annual_discount} onChange={(v) => update({ annual_discount: v })} min={0} max={50} step={1} />
      <NumberField label="Ad Budget ($/mo)" value={phase.ad_budget} onChange={(v) => update({ ad_budget: v })} min={0} step={500} />
      <NumberField label="Cost per Lead ($)" value={phase.cpl} onChange={(v) => update({ cpl: v })} min={1} step={10} />
      <NumberField label="Lead-to-Demo (%)" value={phase.lead_to_demo} onChange={(v) => update({ lead_to_demo: v })} min={0} max={100} step={1} />
      <NumberField label="Demo-to-Close (%)" value={phase.demo_to_close} onChange={(v) => update({ demo_to_close: v })} min={0} max={100} step={1} />
      <NumberField label="Sales Cycle (months)" value={phase.sales_cycle_months} onChange={(v) => update({ sales_cycle_months: v })} min={0} max={12} step={1} />
      <NumberField label="Expansion Rate (%/mo)" value={phase.expansion_rate} onChange={(v) => update({ expansion_rate: v })} min={0} max={50} step={0.5} />
      <NumberField label="Contraction Rate (%/mo)" value={phase.contraction_rate} onChange={(v) => update({ contraction_rate: v })} min={0} max={50} step={0.5} />
      <NumberField label="Logo Churn Rate (%/mo)" value={phase.logo_churn_rate} onChange={(v) => update({ logo_churn_rate: v })} min={0} max={50} step={0.5} />
      <NumberField label="COGS per Seat ($/mo)" value={phase.cogs_per_seat} onChange={(v) => update({ cogs_per_seat: v })} min={0} step={1} />
      <NumberField label="Organic Leads (%)" value={phase.organic_leads_pct} onChange={(v) => update({ organic_leads_pct: v })} min={0} max={100} step={1} />
    </Accordion>
  );
}

export function SaasSidebar({ projectId }: { projectId: string | null }) {
  const config = useConfigStore((s) => s.saasConfig);
  const setConfig = useConfigStore((s) => s.setSaasConfig);

  return (
    <aside className="w-80 border-r bg-background overflow-y-auto h-[calc(100vh-3.5rem)] flex-shrink-0">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">B2B SaaS Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType="saas" />

      <Accordion title="General" defaultOpen>
        <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={12} max={120} />
        <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} />
        <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} />
        <NumberField label="Investment ($)" value={config.investment} onChange={(v) => setConfig({ investment: v })} min={0} step={10000} />
        <NumberField label="Initial Customers" value={config.initial_customers} onChange={(v) => setConfig({ initial_customers: v })} min={0} step={1} />
        <NumberField label="Initial Seats" value={config.initial_seats} onChange={(v) => setConfig({ initial_seats: v })} min={0} step={1} />
      </Accordion>

      <Accordion title="OpEx">
        <NumberField label="Base Salaries ($/mo)" value={config.salaries_base} onChange={(v) => setConfig({ salaries_base: v })} min={0} step={500} />
        <NumberField label="Salary Growth (%/mo)" value={config.salaries_growth} onChange={(v) => setConfig({ salaries_growth: v })} min={0} step={0.5} />
        <NumberField label="Misc Costs ($/mo)" value={config.misc_costs} onChange={(v) => setConfig({ misc_costs: v })} min={0} step={100} />
        <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} />
      </Accordion>

      <Accordion title="Sensitivity">
        <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} />
        <NumberField label="Churn (%)" value={config.sens_churn} onChange={(v) => setConfig({ sens_churn: v })} min={-100} max={100} />
        <NumberField label="Expansion (%)" value={config.sens_expansion} onChange={(v) => setConfig({ sens_expansion: v })} min={-100} max={100} />
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

      <SaasPhaseSection phase={config.phase1} phaseNum={1} />
      <SaasPhaseSection phase={config.phase2} phaseNum={2} />
      <SaasPhaseSection phase={config.phase3} phaseNum={3} />
    </aside>
  );
}

"use client";

import { useConfigStore } from "@/stores/config-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import type { PhaseConfig } from "@/lib/types";

function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <span title={tooltip} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#ECECF2] text-[#8181A5] text-[9px] font-bold cursor-help ml-1">i</span>
  );
}

function NumberField({ label, value, onChange, min, max, step, help }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; help?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}{help && <InfoIcon tooltip={help} />}</Label>
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

function PhaseSection({ phase, phaseNum }: { phase: PhaseConfig; phaseNum: 1 | 2 | 3 }) {
  const setPhase = useConfigStore((s) => s.setSubscriptionPhase);
  const update = (partial: Partial<PhaseConfig>) => setPhase(phaseNum, partial);

  return (
    <Accordion title={`Phase ${phaseNum}`}>
      <NumberField label="Investment ($)" value={phase.investment} onChange={(v) => update({ investment: v })} min={0} step={1000} />
      <NumberField label="Monthly Salary ($)" value={phase.monthly_salary} onChange={(v) => update({ monthly_salary: v })} min={0} step={500} />
      <NumberField label="Misc Costs ($/mo)" value={phase.misc_total} onChange={(v) => update({ misc_total: v })} min={0} step={100} />
      <NumberField label="Ad Budget ($/mo)" value={phase.ad_budget} onChange={(v) => update({ ad_budget: v })} min={0} step={500} />
      <NumberField label="CPI ($)" value={phase.cpi} onChange={(v) => update({ cpi: v })} min={0.01} step={0.5} />
      <NumberField label="Conv Trial (%)" value={phase.conv_trial} onChange={(v) => update({ conv_trial: v })} min={0} max={100} step={1} />
      <NumberField label="Conv Paid (%)" value={phase.conv_paid} onChange={(v) => update({ conv_paid: v })} min={0} max={100} step={1} />
      <NumberField label="Churn Mult" value={phase.churn_mult} onChange={(v) => update({ churn_mult: v })} min={0} step={0.1} />

      <div className="pt-2 text-xs font-medium text-muted-foreground">Ad Growth</div>
      <Select
        value={phase.ad_growth_mode}
        onChange={(e) => update({ ad_growth_mode: e.target.value as PhaseConfig["ad_growth_mode"] })}
        options={[
          { value: "Percentage (%)", label: "Percentage (%)" },
          { value: "Absolute ($)", label: "Absolute ($)" },
        ]}
        className="h-8 text-sm"
      />
      {phase.ad_growth_mode === "Percentage (%)" ? (
        <NumberField label="Growth (%/mo)" value={phase.ad_growth_pct} onChange={(v) => update({ ad_growth_pct: v })} step={0.5} />
      ) : (
        <NumberField label="Growth ($/mo)" value={phase.ad_growth_abs} onChange={(v) => update({ ad_growth_abs: v })} step={100} />
      )}
      <NumberField label="CPI Degradation (%/mo)" value={phase.cpi_degradation} onChange={(v) => update({ cpi_degradation: v })} min={0} step={0.5} />

      <div className="pt-2 text-xs font-medium text-muted-foreground">Organic</div>
      <Select
        value={phase.organic_growth_mode}
        onChange={(e) => update({ organic_growth_mode: e.target.value as PhaseConfig["organic_growth_mode"] })}
        options={[
          { value: "Percentage (%)", label: "Percentage (%)" },
          { value: "Absolute ($)", label: "Absolute ($)" },
        ]}
        className="h-8 text-sm"
      />
      {phase.organic_growth_mode === "Percentage (%)" ? (
        <NumberField label="Organic Growth (%/mo)" value={phase.organic_growth_pct} onChange={(v) => update({ organic_growth_pct: v })} step={1} />
      ) : (
        <NumberField label="Organic Growth (abs/mo)" value={phase.organic_growth_abs} onChange={(v) => update({ organic_growth_abs: v })} step={10} />
      )}
      <NumberField label="Organic Conv Trial (%)" value={phase.organic_conv_trial} onChange={(v) => update({ organic_conv_trial: v })} min={0} max={100} step={1} />
      <NumberField label="Organic Conv Paid (%)" value={phase.organic_conv_paid} onChange={(v) => update({ organic_conv_paid: v })} min={0} max={100} step={1} />
      <NumberField label="Organic Spend ($/mo)" value={phase.organic_spend} onChange={(v) => update({ organic_spend: v })} min={0} step={100} />

      <div className="pt-2 text-xs font-medium text-muted-foreground">Pricing</div>
      <NumberField label="Weekly ($)" value={phase.price_weekly} onChange={(v) => update({ price_weekly: v })} min={0} step={0.99} />
      <NumberField label="Monthly ($)" value={phase.price_monthly} onChange={(v) => update({ price_monthly: v })} min={0} step={0.99} />
      <NumberField label="Annual ($)" value={phase.price_annual} onChange={(v) => update({ price_annual: v })} min={0} step={0.99} />

      <div className="pt-2 text-xs font-medium text-muted-foreground">Plan Mix</div>
      <NumberField label="Weekly (%)" value={phase.mix_weekly * 100} onChange={(v) => update({ mix_weekly: v / 100 })} min={0} max={100} step={1} />
      <NumberField label="Monthly (%)" value={phase.mix_monthly * 100} onChange={(v) => update({ mix_monthly: v / 100 })} min={0} max={100} step={1} />
      <NumberField label="Annual (%)" value={phase.mix_annual * 100} onChange={(v) => update({ mix_annual: v / 100 })} min={0} max={100} step={1} />

      <NumberField label="COGS (%)" value={phase.cogs * 100} onChange={(v) => update({ cogs: v / 100 })} min={0} max={100} step={1} />
    </Accordion>
  );
}

export function Sidebar({ projectId }: { projectId: string | null }) {
  const config = useConfigStore((s) => s.subscriptionConfig);
  const setConfig = useConfigStore((s) => s.setSubscriptionConfig);

  return (
    <aside className="w-80 border-r bg-background overflow-y-auto h-[calc(100vh-3.5rem)] flex-shrink-0">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">Subscription Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType="subscription" />

      <Accordion title="General" defaultOpen>
        <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={12} max={120} />
        <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} />
        <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} />
        <NumberField label="Starting Organic" value={config.starting_organic} onChange={(v) => setConfig({ starting_organic: v })} min={0} />
      </Accordion>

      <Accordion title="Sensitivity">
        <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} />
        <NumberField label="Churn (%)" value={config.sens_churn} onChange={(v) => setConfig({ sens_churn: v })} min={-100} max={100} />
        <NumberField label="CPI (%)" value={config.sens_cpi} onChange={(v) => setConfig({ sens_cpi: v })} min={-100} max={100} />
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

      <Accordion title="Taxes & Fees">
        <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} />
        <NumberField label="Store Split (%)" value={config.store_split} onChange={(v) => setConfig({ store_split: v })} min={0} max={100} />
        <NumberField label="App Store Commission (%)" value={config.app_store_comm} onChange={(v) => setConfig({ app_store_comm: v })} min={0} max={50} step={0.5} />
        <NumberField label="Web Commission (%)" value={config.web_comm_pct} onChange={(v) => setConfig({ web_comm_pct: v })} min={0} max={20} step={0.1} />
        <NumberField label="Web Fixed Fee ($)" value={config.web_comm_fixed} onChange={(v) => setConfig({ web_comm_fixed: v })} min={0} step={0.1} />
        <NumberField label="Bank Fee (%)" value={config.bank_fee} onChange={(v) => setConfig({ bank_fee: v })} min={0} max={10} step={0.1} />
      </Accordion>

      <Accordion title="Retention & Churn">
        <NumberField label="Weekly Cancel Rate (%)" value={config.weekly_cancel_rate} onChange={(v) => setConfig({ weekly_cancel_rate: v })} min={0} max={100} step={0.5} />
        <NumberField label="Monthly Churn Rate (%)" value={config.monthly_churn_rate} onChange={(v) => setConfig({ monthly_churn_rate: v })} min={0} max={100} step={0.5} />
        <NumberField label="Annual Non-Renewal (%)" value={config.annual_non_renewal} onChange={(v) => setConfig({ annual_non_renewal: v })} min={0} max={100} step={1} />
        <NumberField label="Trial Days" value={config.trial_days} onChange={(v) => setConfig({ trial_days: v })} min={0} max={90} />
        <NumberField label="Refund Rate (%)" value={config.refund_rate} onChange={(v) => setConfig({ refund_rate: v })} min={0} max={50} step={0.5} />
        <NumberField label="Upgrade Rate (%)" value={config.upgrade_rate} onChange={(v) => setConfig({ upgrade_rate: v })} min={0} max={50} step={0.5} />
        <NumberField label="Downgrade Rate (%)" value={config.downgrade_rate} onChange={(v) => setConfig({ downgrade_rate: v })} min={0} max={50} step={0.5} />
      </Accordion>

      <PhaseSection phase={config.phase1} phaseNum={1} />
      <PhaseSection phase={config.phase2} phaseNum={2} />
      <PhaseSection phase={config.phase3} phaseNum={3} />
    </aside>
  );
}

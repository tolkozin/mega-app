"use client";

import React, { useState } from "react";
import { useConfigStore } from "@/stores/config-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import { MobileConfigDrawer } from "./MobileConfigDrawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { SaasPhaseConfig } from "@/lib/types";

function InfoIcon({ tooltip }: { tooltip: string }) {
  const [hover, setHover] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [above, setAbove] = useState(true);

  const handleEnter = () => {
    setHover(true);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAbove(rect.top > 120);
    }
  };

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#ECECF2] text-[#8181A5] text-[9px] font-bold cursor-help ml-1"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHover(false)}
    >
      ?
      {hover && (
        <span className={`absolute z-[100] ${above ? "bottom-full mb-2" : "top-full mt-2"} left-0 px-2.5 py-1.5 bg-[#1C1D21] text-white text-[10px] leading-relaxed rounded-lg shadow-lg w-[200px] whitespace-normal pointer-events-none`}>
          {tooltip}
          <span className={`absolute ${above ? "top-full" : "bottom-full"} left-4 w-0 h-0 border-l-4 border-r-4 ${above ? "border-t-4 border-t-[#1C1D21]" : "border-b-4 border-b-[#1C1D21]"} border-l-transparent border-r-transparent`} />
        </span>
      )}
    </span>
  );
}

function NumberField({ label, value, onChange, min, max, step, help }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; help?: string;
}) {
  const [display, setDisplay] = useState(value === 0 ? "" : String(value));
  const [focused, setFocused] = useState(false);

  React.useEffect(() => {
    if (!focused) setDisplay(value === 0 ? "" : String(value));
  }, [value, focused]);

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}{help && <InfoIcon tooltip={help} />}</Label>
      <Input
        type="number"
        value={display}
        onChange={(e) => {
          setDisplay(e.target.value);
          onChange(e.target.value === "" ? 0 : Number(e.target.value));
        }}
        onFocus={() => {
          setFocused(true);
          if (value === 0) setDisplay("");
        }}
        onBlur={() => {
          setFocused(false);
          if (display === "" || display === "0") setDisplay("");
        }}
        placeholder="0"
        min={min} max={max} step={step || 1}
        className="h-8 text-sm placeholder:text-[#C4C4D4]"
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
      <NumberField label="Investment ($)" value={phase.investment} onChange={(v) => update({ investment: v })} min={0} step={10000} help="Capital invested during this phase" />
      <NumberField label="Seats per Account" value={phase.seats_per_account} onChange={(v) => update({ seats_per_account: v })} min={1} step={1} help="Average number of seats (users) per customer account" />
      <NumberField label="Price per Seat ($/mo)" value={phase.price_per_seat} onChange={(v) => update({ price_per_seat: v })} min={0} step={1} help="Monthly price charged per seat/user" />
      <NumberField label="Annual Contract (%)" value={phase.annual_contract_pct} onChange={(v) => update({ annual_contract_pct: v })} min={0} max={100} step={5} help="% of new deals signed as annual contracts (vs monthly)" />
      <NumberField label="Annual Discount (%)" value={phase.annual_discount} onChange={(v) => update({ annual_discount: v })} min={0} max={50} step={1} help="Discount offered on annual plans vs monthly pricing" />
      <NumberField label="Ad Budget ($/mo)" value={phase.ad_budget} onChange={(v) => update({ ad_budget: v })} min={0} step={500} help="Monthly spend on paid advertising (LinkedIn, Google, etc.)" />
      <NumberField label="Cost per Lead ($)" value={phase.cpl} onChange={(v) => update({ cpl: v })} min={1} step={10} help="Average cost to acquire one marketing-qualified lead" />
      <NumberField label="Lead-to-Demo (%)" value={phase.lead_to_demo} onChange={(v) => update({ lead_to_demo: v })} min={0} max={100} step={1} help="% of leads that book a product demo" />
      <NumberField label="Demo-to-Close (%)" value={phase.demo_to_close} onChange={(v) => update({ demo_to_close: v })} min={0} max={100} step={1} help="% of demos that convert to paying customers" />
      <NumberField label="Sales Cycle (months)" value={phase.sales_cycle_months} onChange={(v) => update({ sales_cycle_months: v })} min={0} max={12} step={1} help="Average months from lead to closed deal. Delays revenue recognition" />
      <NumberField label="Expansion Rate (%/mo)" value={phase.expansion_rate} onChange={(v) => update({ expansion_rate: v })} min={0} max={50} step={0.5} help="Monthly % of existing MRR that expands (upsells, more seats)" />
      <NumberField label="Contraction Rate (%/mo)" value={phase.contraction_rate} onChange={(v) => update({ contraction_rate: v })} min={0} max={50} step={0.5} help="Monthly % of existing MRR lost to downgrades (fewer seats, lower plan)" />
      <NumberField label="Logo Churn Rate (%/mo)" value={phase.logo_churn_rate} onChange={(v) => update({ logo_churn_rate: v })} min={0} max={50} step={0.5} help="Monthly % of customers that fully cancel. Removes all their MRR" />
      <NumberField label="COGS per Seat ($/mo)" value={phase.cogs_per_seat} onChange={(v) => update({ cogs_per_seat: v })} min={0} step={1} help="Hosting, support, and infrastructure cost per active seat" />
      <NumberField label="Organic Leads (%)" value={phase.organic_leads_pct} onChange={(v) => update({ organic_leads_pct: v })} min={0} max={100} step={1} help="% of total leads from organic sources (SEO, referrals, word-of-mouth)" />
      <NumberField label="Monthly Salary ($)" value={phase.monthly_salary} onChange={(v) => update({ monthly_salary: v })} min={0} step={500} help="Total team salary per month during this phase" />
    </Accordion>
  );
}

export function SaasSidebar({ projectId, onProjectCreated }: { projectId: string | null; onProjectCreated?: (id: string) => void }) {
  const config = useConfigStore((s) => s.saasConfig);
  const setConfig = useConfigStore((s) => s.setSaasConfig);
  const isMobile = useIsMobile();

  const content = (
    <>
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">B2B SaaS Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType="saas" onProjectCreated={onProjectCreated} />

      <Accordion title="General" defaultOpen>
        <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={12} max={120} help="Total forecast horizon in months" />
        <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (MVP / first customers). Phase 3 = total - P1 - P2" />
        <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (scaling). Phase 3 = total - P1 - P2" />
        <NumberField label="Initial Customers" value={config.initial_customers} onChange={(v) => setConfig({ initial_customers: v })} min={0} step={1} help="Number of paying customers at model start (month 0)" />
        <NumberField label="Initial Seats" value={config.initial_seats} onChange={(v) => setConfig({ initial_seats: v })} min={0} step={1} help="Total active seats at model start (across all initial customers)" />
      </Accordion>

      <Accordion title="OpEx">
        <NumberField label="Misc Costs ($/mo)" value={config.misc_costs} onChange={(v) => setConfig({ misc_costs: v })} min={0} step={100} help="Office, tools, SaaS subscriptions, legal, and other overhead" />
        <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate applied to gross revenue" />
      </Accordion>

      <Accordion title="Sensitivity">
        <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Adjust demo-to-close rate. Positive = better conversion" />
        <NumberField label="Churn (%)" value={config.sens_churn} onChange={(v) => setConfig({ sens_churn: v })} min={-100} max={100} help="Adjust logo churn rate. Positive = more churn (worse)" />
        <NumberField label="Expansion (%)" value={config.sens_expansion} onChange={(v) => setConfig({ sens_expansion: v })} min={-100} max={100} help="Adjust expansion rate. Positive = more upsell/expansion" />
        <NumberField label="Organic (%)" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Adjust organic leads share. Positive = more organic" />
        <NumberField label="Scenario Bound (%)" value={config.scenario_bound} onChange={(v) => setConfig({ scenario_bound: v })} min={0} max={100} help="Spread for optimistic/pessimistic scenarios around base case" />
      </Accordion>

      <Accordion title="Monte Carlo">
        <p className="text-[10px] text-[#8181A5] leading-relaxed mb-2">
          Monte Carlo simulation runs hundreds of randomized iterations of your model, varying key inputs within a defined range, to produce a probability distribution of outcomes instead of a single forecast.
        </p>
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
            <NumberField label="Iterations" value={config.mc_iterations} onChange={(v) => setConfig({ mc_iterations: v })} min={50} max={1000} step={50} help="Number of random simulations. More = smoother distribution" />
            <NumberField label="Variance (%)" value={config.mc_variance} onChange={(v) => setConfig({ mc_variance: v })} min={1} max={100} help="Max random deviation from base parameters per iteration" />
          </>
        )}
      </Accordion>

      <SaasPhaseSection phase={config.phase1} phaseNum={1} />
      <SaasPhaseSection phase={config.phase2} phaseNum={2} />
      <SaasPhaseSection phase={config.phase3} phaseNum={3} />
    </>
  );

  if (isMobile) {
    return <MobileConfigDrawer>{content}</MobileConfigDrawer>;
  }

  return (
    <aside className="w-80 border-r bg-background overflow-y-auto h-[calc(100vh-3.5rem)] flex-shrink-0">
      {content}
    </aside>
  );
}

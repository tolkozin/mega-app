"use client";

import React, { useState, useCallback } from "react";
import { useConfigStore } from "@/stores/config-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import { MobileConfigDrawer } from "./MobileConfigDrawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan } from "@/lib/plan-limits";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { PhaseCostItems, SAAS_CATEGORIES } from "./PhaseCostItems";
import {
  AnimatedAccordion,
  ToggleSwitch,
  PhaseTimeline,
  PhaseSummaryCard,
  RetentionFunnel,
  PhasePresets,
  InlineWarning,
} from "./ConfigWidgets";
import type { CostItem } from "@/stores/cost-items-store";
import type { SaasPhaseConfig } from "@/lib/types";

const PHASE_COLORS: [string, string, string] = ["#2275ed", "#85abf2", "#e8f0ff"];

function InfoIcon({ tooltip }: { tooltip: string }) {
  const [show, setShow] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [above, setAbove] = useState(true);
  const [alignRight, setAlignRight] = useState(false);

  const handleToggle = () => {
    if (!show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAbove(rect.top > 120);
      setAlignRight(rect.left > window.innerWidth / 2);
    }
    setShow((v) => !v);
  };

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center justify-center w-[13px] h-[13px] rounded-full border border-[#e0e3ed] bg-[#f8f9fc] text-[#9ca3af] text-[7px] font-bold cursor-help ml-1 hover:text-[#2163E7] hover:border-[#2163E7]/30 transition-colors"
      onMouseEnter={() => handleToggle()}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => { e.stopPropagation(); handleToggle(); }}
    >
      i
      {show && (
        <span className={`absolute z-[100] ${above ? "bottom-full mb-2" : "top-full mt-2"} ${alignRight ? "right-0" : "left-0"} px-3 py-2 bg-[#1a1a2e] text-white text-[10px] leading-relaxed rounded-[10px] shadow-lg w-[220px] max-w-[calc(100vw-3rem)] whitespace-normal pointer-events-none font-medium`}>
          {tooltip}
          <span className={`absolute ${above ? "top-full" : "bottom-full"} ${alignRight ? "right-4" : "left-4"} w-0 h-0 border-l-4 border-r-4 ${above ? "border-t-4 border-t-[#1a1a2e]" : "border-b-4 border-b-[#1a1a2e]"} border-l-transparent border-r-transparent`} />
        </span>
      )}
    </span>
  );
}

function NumberField({ label, value, onChange, min, max, step, help, slider }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; help?: string; slider?: boolean;
}) {
  const [display, setDisplay] = useState(value === 0 ? "" : String(value));
  const [focused, setFocused] = useState(false);

  React.useEffect(() => {
    if (!focused) setDisplay(value === 0 ? "" : String(value));
  }, [value, focused]);

  const sliderMin = min ?? 0;
  const sliderMax = max ?? 100;
  const pct = Math.max(0, Math.min(100, ((value - sliderMin) / (sliderMax - sliderMin)) * 100));

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
      {slider && min != null && max != null && (
        <div className="pt-1 px-[7px]">
          <div className="flex items-center justify-between mb-1 -mx-[7px]">
            <span className="text-[10.5px] text-[#c4c9d8] tabular-nums">{min}</span>
            <span className="text-[10.5px] text-[#c4c9d8] tabular-nums">{max}</span>
          </div>
          <div className="relative h-[4px] rounded-full bg-[#eef0f6]">
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7BA3F0, #2163E7)" }}
            />
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={step || 1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute top-1/2 -left-[7px] w-[calc(100%+14px)] -translate-y-1/2 opacity-0 cursor-pointer h-5 m-0"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-[#2163E7] border-[2.5px] border-white pointer-events-none"
              style={{ left: `${pct}%`, boxShadow: "0 2px 6px rgba(33,99,231,0.35)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const SAAS_CONSERVATIVE: Partial<SaasPhaseConfig> = {
  price_per_seat: 15, seats_per_account: 3, lead_to_demo: 10,
  demo_to_close: 15, logo_churn_rate: 4, expansion_rate: 1, cpl: 80,
};
const SAAS_MODERATE: Partial<SaasPhaseConfig> = {
  price_per_seat: 25, seats_per_account: 5, lead_to_demo: 20,
  demo_to_close: 25, logo_churn_rate: 2.5, expansion_rate: 3, cpl: 50,
};
const SAAS_AGGRESSIVE: Partial<SaasPhaseConfig> = {
  price_per_seat: 45, seats_per_account: 8, lead_to_demo: 35,
  demo_to_close: 40, logo_churn_rate: 1.5, expansion_rate: 5, cpl: 30,
};

function SaasPhaseSection({ phase, phaseNum }: { phase: SaasPhaseConfig; phaseNum: 1 | 2 | 3 }) {
  const setPhase = useConfigStore((s) => s.setSaasPhase);
  const update = (partial: Partial<SaasPhaseConfig>) => setPhase(phaseNum, partial);

  const costDefaults: CostItem[] = [
    { id: `inv-${phaseNum}`, label: "Investment", amount: phase.investment, category: "Investment" },
    { id: `sal-${phaseNum}`, label: "Team Salary", amount: phase.monthly_salary, category: "Personnel" },
    { id: `ads-${phaseNum}`, label: "Ad Budget", amount: phase.ad_budget, category: "Marketing" },
  ];

  const handleCostSync = useCallback((totals: Record<string, number>) => {
    update({
      investment: totals.Investment ?? 0,
      monthly_salary: totals.Personnel ?? 0,
      ad_budget: totals.Marketing ?? 0,
    });
  }, [phaseNum]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalCosts = phase.investment + phase.monthly_salary + phase.ad_budget;
  const netChurn = phase.logo_churn_rate + phase.contraction_rate - phase.expansion_rate;

  const handlePreset = (preset: "conservative" | "moderate" | "aggressive") => {
    const values = preset === "conservative" ? SAAS_CONSERVATIVE
      : preset === "moderate" ? SAAS_MODERATE
      : SAAS_AGGRESSIVE;
    update(values);
  };

  return (
    <AnimatedAccordion title={`Phase ${phaseNum}`} color={PHASE_COLORS[phaseNum - 1]}>
      <div className="px-3 pb-3 space-y-3">
        <PhaseSummaryCard items={[
          { label: "Monthly Costs", value: `$${totalCosts.toLocaleString()}` },
          { label: "Price/Seat", value: `$${phase.price_per_seat}` },
          { label: "Demo Close", value: `${phase.demo_to_close}%`, color: phase.demo_to_close > 20 ? "#10B981" : "#F59E0B" },
          { label: "Net Churn", value: `${netChurn.toFixed(1)}%`, color: netChurn > 0 ? "#EF4444" : "#10B981" },
        ]} />

        <div>
          <p className="text-[10px] text-[#8181A5] mb-1.5">Quick Presets</p>
          <PhasePresets onApply={handlePreset} />
        </div>

        <div className="pt-1 pb-1 text-xs font-medium text-muted-foreground">Cost Items</div>
        <PhaseCostItems
          storeKey={`saas-${phaseNum}`}
          defaults={costDefaults}
          categories={SAAS_CATEGORIES}
          onSync={handleCostSync}
        />

        <NumberField label="Seats per Account" value={phase.seats_per_account} onChange={(v) => update({ seats_per_account: v })} min={1} step={1} help="Average number of seats (users) per customer account" />
        <NumberField label="Price per Seat ($/mo)" value={phase.price_per_seat} onChange={(v) => update({ price_per_seat: v })} min={0} step={1} help="Monthly price charged per seat/user" />
        <NumberField label="Annual Contract (%)" value={phase.annual_contract_pct} onChange={(v) => update({ annual_contract_pct: v })} min={0} max={100} step={5} help="% of new deals signed as annual contracts (vs monthly)" />
        <NumberField label="Annual Discount (%)" value={phase.annual_discount} onChange={(v) => update({ annual_discount: v })} min={0} max={50} step={1} help="Discount offered on annual plans vs monthly pricing" />
        <NumberField label="Cost per Lead ($)" value={phase.cpl} onChange={(v) => update({ cpl: v })} min={1} step={10} help="Average cost to acquire one marketing-qualified lead" />

        <RetentionFunnel steps={[
          { label: "Leads → Demo", value: phase.lead_to_demo, color: "#BDD0F8" },
          { label: "Demo → Close", value: phase.demo_to_close, color: "#7BA3F0" },
          { label: "Retention", value: Math.max(0, 100 - phase.logo_churn_rate), color: "#2163E7" },
        ]} />

        <NumberField label="Lead-to-Demo (%)" value={phase.lead_to_demo} onChange={(v) => update({ lead_to_demo: v })} min={0} max={100} step={1} help="% of leads that book a product demo" />
        <NumberField label="Demo-to-Close (%)" value={phase.demo_to_close} onChange={(v) => update({ demo_to_close: v })} min={0} max={100} step={1} help="% of demos that convert to paying customers" />
        <NumberField label="Sales Cycle (months)" value={phase.sales_cycle_months} onChange={(v) => update({ sales_cycle_months: v })} min={0} max={12} step={1} help="Average months from lead to closed deal. Delays revenue recognition" />
        <NumberField label="Expansion Rate (%/mo)" value={phase.expansion_rate} onChange={(v) => update({ expansion_rate: v })} min={0} max={50} step={0.5} help="Monthly % of existing MRR that expands (upsells, more seats)" />
        <NumberField label="Contraction Rate (%/mo)" value={phase.contraction_rate} onChange={(v) => update({ contraction_rate: v })} min={0} max={50} step={0.5} help="Monthly % of existing MRR lost to downgrades (fewer seats, lower plan)" />
        <NumberField label="Logo Churn Rate (%/mo)" value={phase.logo_churn_rate} onChange={(v) => update({ logo_churn_rate: v })} min={0} max={50} step={0.5} help="Monthly % of customers that fully cancel. Removes all their MRR" />
        {phase.logo_churn_rate > 5 && (
          <InlineWarning message={`${phase.logo_churn_rate}% monthly churn = ${Math.round((1 - Math.pow(1 - phase.logo_churn_rate / 100, 12)) * 100)}% annual — consider retention strategies`} />
        )}
        <NumberField label="COGS per Seat ($/mo)" value={phase.cogs_per_seat} onChange={(v) => update({ cogs_per_seat: v })} min={0} step={1} help="Hosting, support, and infrastructure cost per active seat" />
        <NumberField label="Organic Leads (%)" value={phase.organic_leads_pct} onChange={(v) => update({ organic_leads_pct: v })} min={0} max={100} step={1} help="% of total leads from organic sources (SEO, referrals, word-of-mouth)" slider />
      </div>
    </AnimatedAccordion>
  );
}

export function SaasSidebar({ projectId, onProjectCreated }: { projectId: string | null; onProjectCreated?: (id: string) => void }) {
  const config = useConfigStore((s) => s.saasConfig);
  const setConfig = useConfigStore((s) => s.setSaasConfig);
  const isMobile = useIsMobile();
  const { profile } = useProfile();
  const readOnly = !isActivePlan(profile?.plan ?? "expired");

  const content = (
    <div className="relative">
      {readOnly && (
        <div
          className="absolute inset-0 z-10 cursor-not-allowed"
          onClick={() => useUpgradeStore.getState().showExpiredModal()}
        />
      )}
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">B2B SaaS Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType="saas" onProjectCreated={onProjectCreated} />

      <div className="px-3 py-2">
        <PhaseTimeline
          phase1Dur={config.phase1_dur}
          phase2Dur={config.phase2_dur}
          totalMonths={config.total_months}
          colors={PHASE_COLORS}
        />
      </div>

      <div className="px-3 space-y-3 py-2">
        <AnimatedAccordion title="General" defaultOpen>
          <div className="space-y-3">
            <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={6} max={120} help="Total forecast horizon in months" slider />
            <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (MVP / first customers). Phase 3 = total - P1 - P2" slider />
            <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (scaling). Phase 3 = total - P1 - P2" slider />
            {config.total_months - config.phase1_dur - config.phase2_dur < 1 && (
              <InlineWarning message="Phase 3 has no months — increase total or reduce P1/P2" type="error" />
            )}
            <NumberField label="Initial Customers" value={config.initial_customers} onChange={(v) => setConfig({ initial_customers: v })} min={0} step={1} help="Number of paying customers at model start (month 0)" />
            <NumberField label="Initial Seats" value={config.initial_seats} onChange={(v) => setConfig({ initial_seats: v })} min={0} step={1} help="Total active seats at model start (across all initial customers)" />
          </div>
        </AnimatedAccordion>

        <AnimatedAccordion title="OpEx">
          <div className="space-y-3">
            <NumberField label="Misc Costs ($/mo)" value={config.misc_costs} onChange={(v) => setConfig({ misc_costs: v })} min={0} step={100} help="Office, tools, SaaS subscriptions, legal, and other overhead" />
            <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate applied to gross revenue" />
          </div>
        </AnimatedAccordion>

        <AnimatedAccordion title="Sensitivity">
          <div className="space-y-3">
            <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Adjust demo-to-close rate. Positive = better conversion" slider />
            <NumberField label="Churn (%)" value={config.sens_churn} onChange={(v) => setConfig({ sens_churn: v })} min={-100} max={100} help="Adjust logo churn rate. Positive = more churn (worse)" slider />
            <NumberField label="Expansion (%)" value={config.sens_expansion} onChange={(v) => setConfig({ sens_expansion: v })} min={-100} max={100} help="Adjust expansion rate. Positive = more upsell/expansion" slider />
            <NumberField label="Organic (%)" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Adjust organic leads share. Positive = more organic" slider />
            <NumberField label="Scenario Bound (%)" value={config.scenario_bound} onChange={(v) => setConfig({ scenario_bound: v })} min={0} max={100} help="Spread for optimistic/pessimistic scenarios around base case" slider />
          </div>
        </AnimatedAccordion>

        <AnimatedAccordion title="Monte Carlo">
          <div className="space-y-3">
            <p className="text-[10px] text-[#8181A5] leading-relaxed">
              Monte Carlo simulation runs hundreds of randomized iterations of your model, varying key inputs within a defined range, to produce a probability distribution of outcomes instead of a single forecast.
            </p>
            <ToggleSwitch
              checked={config.mc_enabled}
              onChange={(v) => setConfig({ mc_enabled: v })}
              label="Enable Monte Carlo"
            />
            {config.mc_enabled && (
              <>
                <NumberField label="Iterations" value={config.mc_iterations} onChange={(v) => setConfig({ mc_iterations: v })} min={50} max={1000} step={50} help="Number of random simulations. More = smoother distribution" />
                <NumberField label="Variance (%)" value={config.mc_variance} onChange={(v) => setConfig({ mc_variance: v })} min={1} max={100} help="Max random deviation from base parameters per iteration" />
              </>
            )}
          </div>
        </AnimatedAccordion>

        <SaasPhaseSection phase={config.phase1} phaseNum={1} />
        <SaasPhaseSection phase={config.phase2} phaseNum={2} />
        <SaasPhaseSection phase={config.phase3} phaseNum={3} />
      </div>
    </div>
  );

  if (isMobile) {
    return <MobileConfigDrawer>{content}</MobileConfigDrawer>;
  }

  return (
    <aside className="w-[360px] border-r bg-background overflow-y-auto h-[calc(100vh-3.5rem)] flex-shrink-0">
      {content}
    </aside>
  );
}

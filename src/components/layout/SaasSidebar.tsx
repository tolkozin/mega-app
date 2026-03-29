"use client";

import React, { useCallback } from "react";
import { useConfigStore } from "@/stores/config-store";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import { MobileConfigDrawer } from "./MobileConfigDrawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan } from "@/lib/plan-limits";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { PhaseCostItems, SAAS_CATEGORIES } from "./PhaseCostItems";
import {
  AnimatedAccordion,
  SegmentedControl,
  ToggleSwitch,
  PhaseTimeline,
  RetentionFunnel,
  PhasePresets,
  InlineWarning,
  NumberField,
  TripleField,
  SliderField,
} from "./ConfigWidgets";
import type { CostItem } from "@/stores/cost-items-store";
import type { SaasPhaseConfig } from "@/lib/types";

const PHASE_COLORS: [string, string, string] = ["#2163E7", "#7BA3F0", "#BDD0F8"];

const MODE_OPTIONS = [
  { value: "simple", label: "Simple" },
  { value: "advanced", label: "Advanced" },
];

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

export function SaasSidebar({ projectId, onProjectCreated, monthRange, productType }: {
  projectId: string | null;
  onProjectCreated?: (id: string) => void;
  monthRange?: [number, number] | null;
  productType?: string;
}) {
  const config = useConfigStore((s) => s.saasConfig);
  const setConfig = useConfigStore((s) => s.setSaasConfig);
  const setPhase = useConfigStore((s) => s.setSaasPhase);
  const setPhaseAll = useConfigStore((s) => s.setSaasPhaseAll);
  const perPhase = useConfigStore((s) => s.customizePerPhase);
  const setPerPhase = useConfigStore((s) => s.setCustomizePerPhase);
  const mode = useConfigStore((s) => s.sidebarMode);
  const setMode = useConfigStore((s) => s.setSidebarMode);
  const isMobile = useIsMobile();
  const { profile } = useProfile();
  const readOnly = !isActivePlan(profile?.plan ?? "expired");

  const p1 = config.phase1;
  const p2 = config.phase2;
  const p3 = config.phase3;
  const isAdv = mode === "advanced";

  const handlePreset = (preset: "conservative" | "moderate" | "aggressive") => {
    const values = preset === "conservative" ? SAAS_CONSERVATIVE
      : preset === "moderate" ? SAAS_MODERATE
      : SAAS_AGGRESSIVE;
    setPhaseAll(values);
  };

  const costDefaultsForPhase = (phase: SaasPhaseConfig, num: number): CostItem[] => [
    { id: `inv-${num}`, label: "Investment", amount: phase.investment, category: "Investment" },
    { id: `sal-${num}`, label: "Team Salary", amount: phase.monthly_salary, category: "Personnel" },
    { id: `ads-${num}`, label: "Ad Budget", amount: phase.ad_budget, category: "Marketing" },
  ];

  const handleCostSyncAll = useCallback((totals: Record<string, number>) => {
    setPhaseAll({
      investment: totals.Investment ?? 0,
      monthly_salary: totals.Personnel ?? 0,
      ad_budget: totals.Marketing ?? 0,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const makeCostSync = useCallback((phaseNum: 1 | 2 | 3) => (totals: Record<string, number>) => {
    setPhase(phaseNum, {
      investment: totals.Investment ?? 0,
      monthly_salary: totals.Personnel ?? 0,
      ad_budget: totals.Marketing ?? 0,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const content = (
    <div className="relative">
      {readOnly && (
        <div
          className="absolute inset-0 z-10 cursor-not-allowed"
          onClick={() => useUpgradeStore.getState().showExpiredModal()}
        />
      )}
      <div className="mx-3 mt-3 mb-2 rounded-2xl bg-white border border-[#eef0f6] px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h2 className="font-extrabold text-sm text-[#1a1a2e] font-[Lato,sans-serif]">B2B SaaS Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType={productType ?? "saas"} onProjectCreated={onProjectCreated} />

      <div className="px-3 py-2">
        <PhaseTimeline
          phase1Dur={config.phase1_dur}
          phase2Dur={config.phase2_dur}
          totalMonths={monthRange ? monthRange[1] - monthRange[0] + 1 : config.total_months}
          colors={PHASE_COLORS}
        />
      </div>

      <div className="px-3 space-y-3 py-2">
        {/* Mode Toggle */}
        <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={(v) => setMode(v as "simple" | "advanced")} />

        {isAdv && (
          <div className="flex items-center justify-between py-1">
            <ToggleSwitch checked={perPhase} onChange={setPerPhase} label="Customize per phase" />
          </div>
        )}

        {/* Global Presets */}
        <div>
          <p className="text-[10px] text-[#8181A5] mb-1.5">Quick Presets</p>
          <PhasePresets onApply={handlePreset} />
        </div>

        {/* General */}
        <AnimatedAccordion title="General">
          <div className="space-y-3">
            <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (MVP / first customers). Phase 3 = remaining." />
            <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (scaling). Phase 3 = remaining." />
            <NumberField label="Initial Customers" value={config.initial_customers} onChange={(v) => setConfig({ initial_customers: v })} min={0} step={1} help="Paying customers at model start (month 0)" />
            <NumberField label="Initial Seats" value={config.initial_seats} onChange={(v) => setConfig({ initial_seats: v })} min={0} step={1} help="Total active seats at start (across all initial customers)" />
          </div>
        </AnimatedAccordion>

        {/* Acquisition */}
        <AnimatedAccordion title="Acquisition">
          <div className="space-y-3">
            <TripleField label="Cost per Lead ($)" help="Cost to acquire one MQL. B2B SaaS: $30–200." values={[p1.cpl, p2.cpl, p3.cpl]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { cpl: v })} onChangeAll={(v) => setPhaseAll({ cpl: v })} min={1} step={10} />
            {isAdv && (
              <TripleField label="Organic Leads (%)" help="% of leads from organic sources — SEO, referrals, content." values={[p1.organic_leads_pct, p2.organic_leads_pct, p3.organic_leads_pct]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { organic_leads_pct: v })} onChangeAll={(v) => setPhaseAll({ organic_leads_pct: v })} min={0} max={100} step={1} />
            )}
          </div>
        </AnimatedAccordion>

        {/* Conversion */}
        <AnimatedAccordion title="Conversion">
          <div className="space-y-3">
            <RetentionFunnel steps={[
              { label: "Leads → Demo", value: p1.lead_to_demo, color: "#BDD0F8" },
              { label: "Demo → Close", value: p1.demo_to_close, color: "#7BA3F0" },
              { label: "Retention", value: Math.max(0, 100 - p1.logo_churn_rate), color: "#2163E7" },
            ]} />
            <TripleField label="Lead-to-Demo (%)" help="% of leads that book a demo. Good: 15–30%." values={[p1.lead_to_demo, p2.lead_to_demo, p3.lead_to_demo]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { lead_to_demo: v })} onChangeAll={(v) => setPhaseAll({ lead_to_demo: v })} min={0} max={100} step={1} />
            <TripleField label="Demo-to-Close (%)" help="% of demos that convert to paying customers. Good: 20–40%." values={[p1.demo_to_close, p2.demo_to_close, p3.demo_to_close]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { demo_to_close: v })} onChangeAll={(v) => setPhaseAll({ demo_to_close: v })} min={0} max={100} step={1} />

            {isAdv && (
              <>
                <TripleField label="Sales Cycle (months)" help="Time from lead to signed deal. SMB: 1–2, Mid-market: 2–4, Enterprise: 3–9." values={[p1.sales_cycle_months, p2.sales_cycle_months, p3.sales_cycle_months]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { sales_cycle_months: v })} onChangeAll={(v) => setPhaseAll({ sales_cycle_months: v })} min={0} max={12} step={1} />
                <TripleField label="Expansion Rate (%/mo)" help="Monthly % MRR growth from upsells/seat additions. Best: 3–5%/mo." values={[p1.expansion_rate, p2.expansion_rate, p3.expansion_rate]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { expansion_rate: v })} onChangeAll={(v) => setPhaseAll({ expansion_rate: v })} min={0} max={50} step={0.5} />
                <TripleField label="Contraction Rate (%/mo)" help="Monthly % MRR lost to downgrades. Typical: 0.5–2%/mo." values={[p1.contraction_rate, p2.contraction_rate, p3.contraction_rate]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { contraction_rate: v })} onChangeAll={(v) => setPhaseAll({ contraction_rate: v })} min={0} max={50} step={0.5} />
                <TripleField label="Logo Churn Rate (%/mo)" help="Monthly % of customers that fully cancel. Good: <2%." values={[p1.logo_churn_rate, p2.logo_churn_rate, p3.logo_churn_rate]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { logo_churn_rate: v })} onChangeAll={(v) => setPhaseAll({ logo_churn_rate: v })} min={0} max={50} step={0.5} />
                {p1.logo_churn_rate > 5 && (
                  <InlineWarning message={`${p1.logo_churn_rate}% monthly churn = ${Math.round((1 - Math.pow(1 - p1.logo_churn_rate / 100, 12)) * 100)}% annual — consider retention strategies`} />
                )}
              </>
            )}
          </div>
        </AnimatedAccordion>

        {/* Pricing & Revenue */}
        <AnimatedAccordion title="Pricing & Revenue">
          <div className="space-y-3">
            <TripleField label="Seats per Account" help="Avg seats per customer. Affects ARPA." values={[p1.seats_per_account, p2.seats_per_account, p3.seats_per_account]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { seats_per_account: v })} onChangeAll={(v) => setPhaseAll({ seats_per_account: v })} min={1} step={1} />
            <TripleField label="Price per Seat ($/mo)" help="Monthly price per seat. B2B SaaS: $10–100." values={[p1.price_per_seat, p2.price_per_seat, p3.price_per_seat]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { price_per_seat: v })} onChangeAll={(v) => setPhaseAll({ price_per_seat: v })} min={0} step={1} />
            <TripleField label="Annual Contract (%)" help="% of deals on annual contracts. Enterprise: 60–80%." values={[p1.annual_contract_pct, p2.annual_contract_pct, p3.annual_contract_pct]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { annual_contract_pct: v })} onChangeAll={(v) => setPhaseAll({ annual_contract_pct: v })} min={0} max={100} step={5} />
            <TripleField label="Annual Discount (%)" help="Discount for annual vs monthly billing. Typical: 15–20%." values={[p1.annual_discount, p2.annual_discount, p3.annual_discount]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { annual_discount: v })} onChangeAll={(v) => setPhaseAll({ annual_discount: v })} min={0} max={50} step={1} />
          </div>
        </AnimatedAccordion>

        {/* Costs */}
        <AnimatedAccordion title="Costs">
          <div className="space-y-3">
            {isAdv && perPhase ? (
              <>
                {([1, 2, 3] as const).map((num) => (
                  <AnimatedAccordion key={num} title={`Phase ${num}`} color={PHASE_COLORS[num - 1]}>
                    <div className="space-y-3">
                      <PhaseCostItems
                        storeKey={`saas-${num}`}
                        defaults={costDefaultsForPhase(config[`phase${num}`], num)}
                        categories={SAAS_CATEGORIES}
                        onSync={makeCostSync(num)}
                      />
                    </div>
                  </AnimatedAccordion>
                ))}
              </>
            ) : (
              <PhaseCostItems
                storeKey="saas-1"
                defaults={costDefaultsForPhase(p1, 1)}
                categories={SAAS_CATEGORIES}
                onSync={handleCostSyncAll}
              />
            )}
            <TripleField label="COGS per Seat ($/mo)" help="Monthly cost per seat — hosting, support. Typical: $2–15." values={[p1.cogs_per_seat, p2.cogs_per_seat, p3.cogs_per_seat]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { cogs_per_seat: v })} onChangeAll={(v) => setPhaseAll({ cogs_per_seat: v })} min={0} step={1} />
          </div>
        </AnimatedAccordion>

        {/* Advanced-only sections */}
        {isAdv && (
          <>
            <AnimatedAccordion title="OpEx">
              <div className="space-y-3">
                <NumberField label="Misc Costs ($/mo)" value={config.misc_costs} onChange={(v) => setConfig({ misc_costs: v })} min={0} step={100} help="Office, tools, legal, and other overhead" />
                <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate on gross revenue" />
              </div>
            </AnimatedAccordion>

            <AnimatedAccordion title="Sensitivity">
              <div className="space-y-3">
                <p className="text-[10px] text-[#8181A5] leading-relaxed">
                  Shift key metrics up or down to see how they affect your revenue and profit forecasts.
                </p>
                <SliderField label="Conversion" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Shifts demo-to-close rate. +20% means 20% more leads become paying customers — directly increases MRR. Negative simulates a harder sales cycle." />
                <SliderField label="Churn" value={config.sens_churn} onChange={(v) => setConfig({ sens_churn: v })} min={-100} max={100} help="Shifts monthly logo churn. +20% means 20% more customers cancel each month — reduces ARR and LTV. Negative = better retention." />
                <SliderField label="Expansion" value={config.sens_expansion} onChange={(v) => setConfig({ sens_expansion: v })} min={-100} max={100} help="Shifts net revenue expansion (upsells, seat growth). +20% means existing customers spend 20% more — boosts NRR above 100%. Negative = less upsell." />
                <SliderField label="Organic" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Shifts organic (inbound) leads share. +20% means more leads come from content/SEO — reduces CAC. Negative = more reliance on paid channels." />
                <SliderField label="Scenario Bound" value={config.scenario_bound} onChange={(v) => setConfig({ scenario_bound: v })} min={0} max={100} help="Controls the spread between optimistic and pessimistic scenarios. Higher = wider range of possible outcomes on charts. 20% means best/worst case differ by 20% from the base." />
              </div>
            </AnimatedAccordion>

            <AnimatedAccordion title="Monte Carlo">
              <div className="space-y-3">
                <p className="text-[10px] text-[#8181A5] leading-relaxed">
                  Runs randomized iterations to produce a probability distribution of outcomes.
                </p>
                <ToggleSwitch checked={config.mc_enabled} onChange={(v) => setConfig({ mc_enabled: v })} label="Enable Monte Carlo" />
                {config.mc_enabled && (
                  <>
                    <NumberField label="Iterations" value={config.mc_iterations} onChange={(v) => setConfig({ mc_iterations: v })} min={50} max={1000} step={50} help="Number of simulation runs. 200–500 is good." />
                    <NumberField label="Variance (%)" value={config.mc_variance} onChange={(v) => setConfig({ mc_variance: v })} min={1} max={100} help="Max random deviation per iteration" />
                  </>
                )}
              </div>
            </AnimatedAccordion>
          </>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return <MobileConfigDrawer>{content}</MobileConfigDrawer>;
  }

  return (
    <aside className="w-[360px] bg-[#f8f9fc] overflow-y-auto h-[calc(100dvh-3.5rem-1rem)] flex-shrink-0 m-2 rounded-2xl border border-[#eef0f6] shadow-[0_1px_4px_rgba(0,0,0,0.04)]" data-tour="config-sidebar">
      {content}
    </aside>
  );
}

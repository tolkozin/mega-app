"use client";

import React, { useCallback } from "react";
import { useConfigStore } from "@/stores/config-store";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import { MobileConfigDrawer } from "./MobileConfigDrawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan } from "@/lib/plan-limits";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { PhaseCostItems, SUB_CATEGORIES } from "./PhaseCostItems";
import {
  AnimatedAccordion,
  SegmentedControl,
  ToggleSwitch,
  PlanMixBar,
  PhaseTimeline,
  RetentionFunnel,
  PhasePresets,
  InlineWarning,
  NumberField,
  TripleField,
  SliderField,
} from "./ConfigWidgets";
import type { CostItem } from "@/stores/cost-items-store";
import type { PhaseConfig } from "@/lib/types";

const PHASE_COLORS: [string, string, string] = ["#2163E7", "#7BA3F0", "#BDD0F8"];

const GROWTH_MODE_OPTIONS = [
  { value: "Percentage (%)", label: "% Growth" },
  { value: "Absolute ($)", label: "$ Growth" },
];

const MODE_OPTIONS = [
  { value: "simple", label: "Simple" },
  { value: "advanced", label: "Advanced" },
];

const CONSERVATIVE_PRESET: Partial<PhaseConfig> = {
  cpi: 3.0, conv_trial: 15, conv_paid: 8, churn_mult: 1.2,
  ad_growth_pct: 3, cpi_degradation: 1.5, organic_growth_pct: 5,
  organic_conv_trial: 12, organic_conv_paid: 6,
};
const MODERATE_PRESET: Partial<PhaseConfig> = {
  cpi: 2.0, conv_trial: 25, conv_paid: 15, churn_mult: 1.0,
  ad_growth_pct: 8, cpi_degradation: 1.0, organic_growth_pct: 10,
  organic_conv_trial: 20, organic_conv_paid: 12,
};
const AGGRESSIVE_PRESET: Partial<PhaseConfig> = {
  cpi: 1.2, conv_trial: 40, conv_paid: 25, churn_mult: 0.8,
  ad_growth_pct: 15, cpi_degradation: 0.5, organic_growth_pct: 20,
  organic_conv_trial: 30, organic_conv_paid: 20,
};

export function Sidebar({ projectId, onProjectCreated, monthRange, productType }: {
  projectId: string | null;
  onProjectCreated?: (id: string) => void;
  monthRange?: [number, number] | null;
  productType?: string;
}) {
  const config = useConfigStore((s) => s.subscriptionConfig);
  const setConfig = useConfigStore((s) => s.setSubscriptionConfig);
  const setPhase = useConfigStore((s) => s.setSubscriptionPhase);
  const setPhaseAll = useConfigStore((s) => s.setSubscriptionPhaseAll);
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
    const values = preset === "conservative" ? CONSERVATIVE_PRESET
      : preset === "moderate" ? MODERATE_PRESET
      : AGGRESSIVE_PRESET;
    setPhaseAll(values);
  };

  const mixSum = Math.round((p1.mix_weekly + p1.mix_monthly + p1.mix_annual) * 100);

  /* ── Cost Items (unified: show P1, sync all; per-phase: 3 sets) ── */
  const costDefaultsForPhase = (phase: PhaseConfig, num: number): CostItem[] => [
    { id: `inv-${num}`, label: "Investment", amount: phase.investment, category: "Investment" },
    { id: `sal-${num}`, label: "Team Salary", amount: phase.monthly_salary, category: "Personnel" },
    { id: `misc-${num}`, label: "Misc Costs", amount: phase.misc_total, category: "Operations" },
    { id: `ads-${num}`, label: "Ad Budget", amount: phase.ad_budget, category: "Marketing" },
    { id: `org-${num}`, label: "Organic Spend", amount: phase.organic_spend, category: "Organic" },
  ];

  const handleCostSyncAll = useCallback((totals: Record<string, number>) => {
    const partial: Partial<PhaseConfig> = {
      investment: totals.Investment ?? 0,
      monthly_salary: totals.Personnel ?? 0,
      misc_total: totals.Operations ?? 0,
      ad_budget: totals.Marketing ?? 0,
      organic_spend: totals.Organic ?? 0,
    };
    setPhaseAll(partial);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const makeCostSync = useCallback((phaseNum: 1 | 2 | 3) => (totals: Record<string, number>) => {
    setPhase(phaseNum, {
      investment: totals.Investment ?? 0,
      monthly_salary: totals.Personnel ?? 0,
      misc_total: totals.Operations ?? 0,
      ad_budget: totals.Marketing ?? 0,
      organic_spend: totals.Organic ?? 0,
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
        <h2 className="font-extrabold text-sm text-[#1a1a2e] font-[Lato,sans-serif]">Subscription Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType={productType ?? "subscription"} onProjectCreated={onProjectCreated} />

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

        {/* Per Phase Toggle (Advanced only) */}
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
            <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (launch). Phase 3 = remaining months." />
            <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (growth). Phase 3 = remaining months." />
            <NumberField label="Starting Organic" value={config.starting_organic} onChange={(v) => setConfig({ starting_organic: v })} min={0} help="Organic (non-paid) installs per month at start" />
          </div>
        </AnimatedAccordion>

        {/* Acquisition */}
        <AnimatedAccordion title="Acquisition">
          <div className="space-y-3">
            <TripleField label="CPI ($)" help="Cost Per Install — average cost per new app install. Industry: $1–5." values={[p1.cpi, p2.cpi, p3.cpi]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { cpi: v })} onChangeAll={(v) => setPhaseAll({ cpi: v })} min={0.01} step={0.5} />

            {isAdv && (
              <>
                <TripleField label="CPI Degradation (%/mo)" help="Monthly % increase in CPI as audience saturates. 0 = stable, 1–3% typical." values={[p1.cpi_degradation, p2.cpi_degradation, p3.cpi_degradation]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { cpi_degradation: v })} onChangeAll={(v) => setPhaseAll({ cpi_degradation: v })} min={0} max={10} step={0.5} />

                <div className="pt-1 text-[11px] font-medium text-muted-foreground">Ad Growth</div>
                <SegmentedControl options={GROWTH_MODE_OPTIONS} value={p1.ad_growth_mode} onChange={(v) => setPhaseAll({ ad_growth_mode: v as PhaseConfig["ad_growth_mode"] })} />
                {p1.ad_growth_mode === "Percentage (%)" ? (
                  <TripleField label="Growth (%/mo)" help="Monthly % increase in ad budget" values={[p1.ad_growth_pct, p2.ad_growth_pct, p3.ad_growth_pct]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { ad_growth_pct: v })} onChangeAll={(v) => setPhaseAll({ ad_growth_pct: v })} step={0.5} />
                ) : (
                  <TripleField label="Growth ($/mo)" help="Fixed $ increase in ad budget each month" values={[p1.ad_growth_abs, p2.ad_growth_abs, p3.ad_growth_abs]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { ad_growth_abs: v })} onChangeAll={(v) => setPhaseAll({ ad_growth_abs: v })} step={100} />
                )}

                <div className="pt-1 text-[11px] font-medium text-muted-foreground">Organic Growth</div>
                <SegmentedControl options={GROWTH_MODE_OPTIONS} value={p1.organic_growth_mode} onChange={(v) => setPhaseAll({ organic_growth_mode: v as PhaseConfig["organic_growth_mode"] })} />
                {p1.organic_growth_mode === "Percentage (%)" ? (
                  <TripleField label="Organic Growth (%/mo)" help="Monthly % growth of organic installs" values={[p1.organic_growth_pct, p2.organic_growth_pct, p3.organic_growth_pct]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { organic_growth_pct: v })} onChangeAll={(v) => setPhaseAll({ organic_growth_pct: v })} step={1} />
                ) : (
                  <TripleField label="Organic Growth (abs/mo)" help="Fixed additional organic installs each month" values={[p1.organic_growth_abs, p2.organic_growth_abs, p3.organic_growth_abs]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { organic_growth_abs: v })} onChangeAll={(v) => setPhaseAll({ organic_growth_abs: v })} step={10} />
                )}
              </>
            )}
          </div>
        </AnimatedAccordion>

        {/* Conversion */}
        <AnimatedAccordion title="Conversion">
          <div className="space-y-3">
            <TripleField label="Conv Trial (%)" help="% of paid installs that start a free trial. Good: 20–40%." values={[p1.conv_trial, p2.conv_trial, p3.conv_trial]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { conv_trial: v })} onChangeAll={(v) => setPhaseAll({ conv_trial: v })} min={0} max={100} step={1} />
            <TripleField label="Conv Paid (%)" help="% of trial users that convert to paid. Good: 10–25%." values={[p1.conv_paid, p2.conv_paid, p3.conv_paid]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { conv_paid: v })} onChangeAll={(v) => setPhaseAll({ conv_paid: v })} min={0} max={100} step={1} />

            {isAdv && (
              <>
                <TripleField label="Churn Multiplier" help="Scales base churn. 1.0 = default, 0.5 = half, 2.0 = double." values={[p1.churn_mult, p2.churn_mult, p3.churn_mult]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { churn_mult: v })} onChangeAll={(v) => setPhaseAll({ churn_mult: v })} min={0} step={0.1} />
                <TripleField label="Organic Conv Trial (%)" help="% of organic installs that start a trial" values={[p1.organic_conv_trial, p2.organic_conv_trial, p3.organic_conv_trial]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { organic_conv_trial: v })} onChangeAll={(v) => setPhaseAll({ organic_conv_trial: v })} min={0} max={100} step={1} />
                <TripleField label="Organic Conv Paid (%)" help="% of organic trial users that convert to paid" values={[p1.organic_conv_paid, p2.organic_conv_paid, p3.organic_conv_paid]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { organic_conv_paid: v })} onChangeAll={(v) => setPhaseAll({ organic_conv_paid: v })} min={0} max={100} step={1} />
              </>
            )}
          </div>
        </AnimatedAccordion>

        {/* Pricing & Revenue */}
        <AnimatedAccordion title="Pricing & Revenue">
          <div className="space-y-3">
            <TripleField label="Weekly ($)" help="Weekly subscription price" values={[p1.price_weekly, p2.price_weekly, p3.price_weekly]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { price_weekly: v })} onChangeAll={(v) => setPhaseAll({ price_weekly: v })} min={0} step={0.99} />
            <TripleField label="Monthly ($)" help="Monthly subscription price" values={[p1.price_monthly, p2.price_monthly, p3.price_monthly]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { price_monthly: v })} onChangeAll={(v) => setPhaseAll({ price_monthly: v })} min={0} step={0.99} />
            <TripleField label="Annual ($)" help="Annual subscription price" values={[p1.price_annual, p2.price_annual, p3.price_annual]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { price_annual: v })} onChangeAll={(v) => setPhaseAll({ price_annual: v })} min={0} step={0.99} />

            {isAdv && (
              <>
                <div className="pt-1 text-[11px] font-medium text-muted-foreground">Plan Mix</div>
                <TripleField label="Weekly (%)" help="% choosing weekly plan. All should sum to 100%." values={[Math.round(p1.mix_weekly * 100), Math.round(p2.mix_weekly * 100), Math.round(p3.mix_weekly * 100)]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { mix_weekly: v / 100 })} onChangeAll={(v) => setPhaseAll({ mix_weekly: v / 100 })} min={0} max={100} step={1} />
                <TripleField label="Monthly (%)" help="% choosing monthly plan" values={[Math.round(p1.mix_monthly * 100), Math.round(p2.mix_monthly * 100), Math.round(p3.mix_monthly * 100)]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { mix_monthly: v / 100 })} onChangeAll={(v) => setPhaseAll({ mix_monthly: v / 100 })} min={0} max={100} step={1} />
                <TripleField label="Annual (%)" help="% choosing annual plan" values={[Math.round(p1.mix_annual * 100), Math.round(p2.mix_annual * 100), Math.round(p3.mix_annual * 100)]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { mix_annual: v / 100 })} onChangeAll={(v) => setPhaseAll({ mix_annual: v / 100 })} min={0} max={100} step={1} />
                <PlanMixBar weekly={Math.round(p1.mix_weekly * 100)} monthly={Math.round(p1.mix_monthly * 100)} annual={Math.round(p1.mix_annual * 100)} />
                {mixSum !== 100 && <InlineWarning message={`Plan mix sums to ${mixSum}% — should be 100%`} type="error" />}
              </>
            )}
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
                        storeKey={`sub-${num}`}
                        defaults={costDefaultsForPhase(config[`phase${num}`], num)}
                        categories={SUB_CATEGORIES}
                        onSync={makeCostSync(num)}
                      />
                    </div>
                  </AnimatedAccordion>
                ))}
              </>
            ) : (
              <PhaseCostItems
                storeKey="sub-1"
                defaults={costDefaultsForPhase(p1, 1)}
                categories={SUB_CATEGORIES}
                onSync={handleCostSyncAll}
              />
            )}
            <TripleField label="COGS (%)" help="Cost of Goods Sold as % of revenue. SaaS/app: 15–30%." values={[Math.round(p1.cogs * 100), Math.round(p2.cogs * 100), Math.round(p3.cogs * 100)]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { cogs: v / 100 })} onChangeAll={(v) => setPhaseAll({ cogs: v / 100 })} min={0} max={100} step={1} />
          </div>
        </AnimatedAccordion>

        {/* Advanced-only sections */}
        {isAdv && (
          <>
            <AnimatedAccordion title="Retention & Churn">
              <div className="space-y-3">
                <RetentionFunnel steps={[
                  { label: "Weekly Retention", value: Math.max(0, 100 - config.weekly_cancel_rate), color: "#BDD0F8" },
                  { label: "Monthly Retention", value: Math.max(0, 100 - config.monthly_churn_rate), color: "#7BA3F0" },
                  { label: "Annual Renewal", value: Math.max(0, 100 - config.annual_non_renewal), color: "#2163E7" },
                ]} />
                <NumberField label="Weekly Cancel Rate (%)" value={config.weekly_cancel_rate} onChange={(v) => setConfig({ weekly_cancel_rate: v })} min={0} max={100} step={0.5} help="% of weekly subs who cancel each cycle" />
                <NumberField label="Monthly Churn Rate (%)" value={config.monthly_churn_rate} onChange={(v) => setConfig({ monthly_churn_rate: v })} min={0} max={100} step={0.5} help="% of monthly subs who cancel each month" />
                <NumberField label="Annual Non-Renewal (%)" value={config.annual_non_renewal} onChange={(v) => setConfig({ annual_non_renewal: v })} min={0} max={100} step={1} help="% of annual subs who don't renew" />
                <NumberField label="Trial Days" value={config.trial_days} onChange={(v) => setConfig({ trial_days: v })} min={0} max={90} help="Length of free trial (0 = no trial)" />
                <NumberField label="Refund Rate (%)" value={config.refund_rate} onChange={(v) => setConfig({ refund_rate: v })} min={0} max={50} step={0.5} help="% of paid users requesting refunds" />
                {config.refund_rate > 10 && <InlineWarning message="Refund rate above 10% may indicate pricing or product issues" />}
                <NumberField label="Upgrade Rate (%)" value={config.upgrade_rate} onChange={(v) => setConfig({ upgrade_rate: v })} min={0} max={50} step={0.5} help="% of users upgrading each month" />
                <NumberField label="Downgrade Rate (%)" value={config.downgrade_rate} onChange={(v) => setConfig({ downgrade_rate: v })} min={0} max={50} step={0.5} help="% of users downgrading each month" />
              </div>
            </AnimatedAccordion>

            <AnimatedAccordion title="Taxes & Fees">
              <div className="space-y-3">
                <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate on gross revenue" />
                <NumberField label="Store Split (%)" value={config.store_split} onChange={(v) => setConfig({ store_split: v })} min={0} max={100} help="% of revenue from app stores (vs web)" />
                <NumberField label="App Store Commission (%)" value={config.app_store_comm} onChange={(v) => setConfig({ app_store_comm: v })} min={0} max={50} step={0.5} help="Apple/Google commission (typically 15-30%)" />
                <NumberField label="Web Commission (%)" value={config.web_comm_pct} onChange={(v) => setConfig({ web_comm_pct: v })} min={0} max={20} step={0.1} help="Payment processor fee (e.g. Stripe 2.9%)" />
                <NumberField label="Web Fixed Fee ($)" value={config.web_comm_fixed} onChange={(v) => setConfig({ web_comm_fixed: v })} min={0} step={0.1} help="Fixed fee per web transaction (e.g. $0.30)" />
                <NumberField label="Bank Fee (%)" value={config.bank_fee} onChange={(v) => setConfig({ bank_fee: v })} min={0} max={10} step={0.1} help="Banking/withdrawal fees" />
              </div>
            </AnimatedAccordion>

            <AnimatedAccordion title="Sensitivity">
              <div className="space-y-3">
                <p className="text-[10px] text-[#8181A5] leading-relaxed">
                  Shift key metrics up or down to see how they affect your revenue and profit forecasts.
                </p>
                <SliderField label="Conversion" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Shifts trial-to-paid conversion rate. +20% means 20% more users convert — directly increases revenue. Negative values simulate lower conversion." />
                <SliderField label="Churn" value={config.sens_churn} onChange={(v) => setConfig({ sens_churn: v })} min={-100} max={100} help="Shifts monthly churn rate. +20% means 20% more users cancel each month — reduces recurring revenue and LTV. Negative = better retention." />
                <SliderField label="CPI" value={config.sens_cpi} onChange={(v) => setConfig({ sens_cpi: v })} min={-100} max={100} help="Shifts cost per install. +20% means you pay 20% more per user acquired — increases ad spend, reduces ROI. Negative = cheaper installs." />
                <SliderField label="Organic" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Shifts organic (free) installs share. +20% means 20% more users come without ads — reduces acquisition cost. Negative = less word-of-mouth." />
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

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
import { PhaseCostItems, SUB_CATEGORIES } from "./PhaseCostItems";
import {
  AnimatedAccordion,
  SegmentedControl,
  ToggleSwitch,
  PlanMixBar,
  PhaseTimeline,
  PhaseSummaryCard,
  RetentionFunnel,
  PhasePresets,
  InlineWarning,
} from "./ConfigWidgets";
import type { CostItem } from "@/stores/cost-items-store";
import type { PhaseConfig } from "@/lib/types";

const PHASE_COLORS: [string, string, string] = ["#2163E7", "#10B981", "#7C3AED"];

const GROWTH_MODE_OPTIONS = [
  { value: "Percentage (%)", label: "% Growth" },
  { value: "Absolute ($)", label: "$ Growth" },
];

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
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1">
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
              className="absolute top-1/2 left-0 w-full -translate-y-1/2 opacity-0 cursor-pointer h-5 m-0"
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

function PhaseSection({ phase, phaseNum }: { phase: PhaseConfig; phaseNum: 1 | 2 | 3 }) {
  const setPhase = useConfigStore((s) => s.setSubscriptionPhase);
  const update = (partial: Partial<PhaseConfig>) => setPhase(phaseNum, partial);

  const costDefaults: CostItem[] = [
    { id: `inv-${phaseNum}`, label: "Investment", amount: phase.investment, category: "Investment" },
    { id: `sal-${phaseNum}`, label: "Team Salary", amount: phase.monthly_salary, category: "Personnel" },
    { id: `misc-${phaseNum}`, label: "Misc Costs", amount: phase.misc_total, category: "Operations" },
    { id: `ads-${phaseNum}`, label: "Ad Budget", amount: phase.ad_budget, category: "Marketing" },
    { id: `org-${phaseNum}`, label: "Organic Spend", amount: phase.organic_spend, category: "Organic" },
  ];

  const handleCostSync = useCallback((totals: Record<string, number>) => {
    update({
      investment: totals.Investment ?? 0,
      monthly_salary: totals.Personnel ?? 0,
      misc_total: totals.Operations ?? 0,
      ad_budget: totals.Marketing ?? 0,
      organic_spend: totals.Organic ?? 0,
    });
  }, [phaseNum]); // eslint-disable-line react-hooks/exhaustive-deps

  const mixSum = Math.round((phase.mix_weekly + phase.mix_monthly + phase.mix_annual) * 100);

  const totalCosts = phase.investment + phase.monthly_salary + phase.misc_total + phase.ad_budget + phase.organic_spend;

  const handlePreset = (preset: "conservative" | "moderate" | "aggressive") => {
    const values = preset === "conservative" ? CONSERVATIVE_PRESET
      : preset === "moderate" ? MODERATE_PRESET
      : AGGRESSIVE_PRESET;
    update(values);
  };

  return (
    <AnimatedAccordion title={`Phase ${phaseNum}`} color={PHASE_COLORS[phaseNum - 1]}>
      <div className="px-3 pb-3 space-y-3">
        {/* Phase Summary Card */}
        <PhaseSummaryCard items={[
          { label: "Monthly Costs", value: `$${totalCosts.toLocaleString()}` },
          { label: "CPI", value: `$${phase.cpi.toFixed(2)}` },
          { label: "Trial Conv", value: `${phase.conv_trial}%`, color: phase.conv_trial > 20 ? "#10B981" : "#F59E0B" },
          { label: "Paid Conv", value: `${phase.conv_paid}%`, color: phase.conv_paid > 12 ? "#10B981" : "#F59E0B" },
        ]} />

        {/* Quick Presets */}
        <div>
          <p className="text-[10px] text-[#8181A5] mb-1.5">Quick Presets</p>
          <PhasePresets onApply={handlePreset} />
        </div>

        <div className="pt-1 pb-1 text-xs font-medium text-muted-foreground">Cost Items</div>
        <PhaseCostItems
          storeKey={`sub-${phaseNum}`}
          defaults={costDefaults}
          categories={SUB_CATEGORIES}
          onSync={handleCostSync}
        />

        <NumberField label="CPI ($)" value={phase.cpi} onChange={(v) => update({ cpi: v })} min={0.01} step={0.5} help="Cost Per Install — how much you pay per app install from ads" />
        <NumberField label="Conv Trial (%)" value={phase.conv_trial} onChange={(v) => update({ conv_trial: v })} min={0} max={100} step={1} help="% of paid installs that start a free trial" slider />
        <NumberField label="Conv Paid (%)" value={phase.conv_paid} onChange={(v) => update({ conv_paid: v })} min={0} max={100} step={1} help="% of trial users that convert to a paid subscription" slider />
        <NumberField label="Churn Mult" value={phase.churn_mult} onChange={(v) => update({ churn_mult: v })} min={0} step={0.1} help="Multiplier applied to base churn rates. 1.0 = default, 0.5 = halved churn, 2.0 = doubled" />

        <div className="pt-2 text-xs font-medium text-muted-foreground">Ad Growth</div>
        <SegmentedControl
          options={GROWTH_MODE_OPTIONS}
          value={phase.ad_growth_mode}
          onChange={(v) => update({ ad_growth_mode: v as PhaseConfig["ad_growth_mode"] })}
        />
        {phase.ad_growth_mode === "Percentage (%)" ? (
          <NumberField label="Growth (%/mo)" value={phase.ad_growth_pct} onChange={(v) => update({ ad_growth_pct: v })} step={0.5} help="Monthly % increase in ad budget (compound growth)" />
        ) : (
          <NumberField label="Growth ($/mo)" value={phase.ad_growth_abs} onChange={(v) => update({ ad_growth_abs: v })} step={100} help="Fixed dollar increase in ad budget each month" />
        )}
        <NumberField label="CPI Degradation (%/mo)" value={phase.cpi_degradation} onChange={(v) => update({ cpi_degradation: v })} min={0} step={0.5} help="Monthly % increase in CPI as audience saturates (higher = worse)" />

        <div className="pt-2 text-xs font-medium text-muted-foreground">Organic</div>
        <SegmentedControl
          options={GROWTH_MODE_OPTIONS}
          value={phase.organic_growth_mode}
          onChange={(v) => update({ organic_growth_mode: v as PhaseConfig["organic_growth_mode"] })}
        />
        {phase.organic_growth_mode === "Percentage (%)" ? (
          <NumberField label="Organic Growth (%/mo)" value={phase.organic_growth_pct} onChange={(v) => update({ organic_growth_pct: v })} step={1} help="Monthly % growth of organic (non-paid) installs" />
        ) : (
          <NumberField label="Organic Growth (abs/mo)" value={phase.organic_growth_abs} onChange={(v) => update({ organic_growth_abs: v })} step={10} help="Fixed number of additional organic installs each month" />
        )}
        <NumberField label="Organic Conv Trial (%)" value={phase.organic_conv_trial} onChange={(v) => update({ organic_conv_trial: v })} min={0} max={100} step={1} help="% of organic installs that start a free trial" slider />
        <NumberField label="Organic Conv Paid (%)" value={phase.organic_conv_paid} onChange={(v) => update({ organic_conv_paid: v })} min={0} max={100} step={1} help="% of organic trial users that convert to paid" slider />

        <div className="pt-2 text-xs font-medium text-muted-foreground">Pricing</div>
        <NumberField label="Weekly ($)" value={phase.price_weekly} onChange={(v) => update({ price_weekly: v })} min={0} step={0.99} help="Price for weekly subscription plan" />
        <NumberField label="Monthly ($)" value={phase.price_monthly} onChange={(v) => update({ price_monthly: v })} min={0} step={0.99} help="Price for monthly subscription plan" />
        <NumberField label="Annual ($)" value={phase.price_annual} onChange={(v) => update({ price_annual: v })} min={0} step={0.99} help="Price for annual subscription plan" />

        <div className="pt-2 text-xs font-medium text-muted-foreground">Plan Mix</div>
        <NumberField label="Weekly (%)" value={phase.mix_weekly * 100} onChange={(v) => update({ mix_weekly: v / 100 })} min={0} max={100} step={1} help="% of new subscribers choosing weekly plan. All mixes should sum to 100%" slider />
        <NumberField label="Monthly (%)" value={phase.mix_monthly * 100} onChange={(v) => update({ mix_monthly: v / 100 })} min={0} max={100} step={1} help="% of new subscribers choosing monthly plan" slider />
        <NumberField label="Annual (%)" value={phase.mix_annual * 100} onChange={(v) => update({ mix_annual: v / 100 })} min={0} max={100} step={1} help="% of new subscribers choosing annual plan" slider />
        <PlanMixBar
          weekly={Math.round(phase.mix_weekly * 100)}
          monthly={Math.round(phase.mix_monthly * 100)}
          annual={Math.round(phase.mix_annual * 100)}
        />
        {mixSum !== 100 && (
          <InlineWarning message={`Plan mix sums to ${mixSum}% — should be 100%`} type="error" />
        )}

        <NumberField label="COGS (%)" value={phase.cogs * 100} onChange={(v) => update({ cogs: v / 100 })} min={0} max={100} step={1} help="Cost of Goods Sold as % of revenue (hosting, CDN, support)" />
      </div>
    </AnimatedAccordion>
  );
}

export function Sidebar({ projectId, onProjectCreated }: { projectId: string | null; onProjectCreated?: (id: string) => void }) {
  const config = useConfigStore((s) => s.subscriptionConfig);
  const setConfig = useConfigStore((s) => s.setSubscriptionConfig);
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
        <h2 className="font-semibold text-sm">Subscription Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType="subscription" onProjectCreated={onProjectCreated} />

      {/* Phase Timeline */}
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
            <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={12} max={120} help="Total forecast horizon in months" slider />
            <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (launch / MVP). Phase 3 = total - P1 - P2" slider />
            <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (growth). Phase 3 = total - P1 - P2" slider />
            {config.total_months - config.phase1_dur - config.phase2_dur < 1 && (
              <InlineWarning message="Phase 3 has no months — increase total or reduce P1/P2" type="error" />
            )}
            <NumberField label="Starting Organic" value={config.starting_organic} onChange={(v) => setConfig({ starting_organic: v })} min={0} help="Initial organic installs per month at model start" />
          </div>
        </AnimatedAccordion>

        <AnimatedAccordion title="Sensitivity">
          <div className="space-y-3">
            <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Adjust conversion rates by this %. Positive = better conversion" slider />
            <NumberField label="Churn (%)" value={config.sens_churn} onChange={(v) => setConfig({ sens_churn: v })} min={-100} max={100} help="Adjust churn rates by this %. Positive = more churn (worse)" slider />
            <NumberField label="CPI (%)" value={config.sens_cpi} onChange={(v) => setConfig({ sens_cpi: v })} min={-100} max={100} help="Adjust CPI by this %. Positive = higher cost per install" slider />
            <NumberField label="Organic (%)" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Adjust organic growth by this %. Positive = more organic" slider />
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
                <NumberField label="Iterations" value={config.mc_iterations} onChange={(v) => setConfig({ mc_iterations: v })} min={50} max={1000} step={50} help="Number of random simulations to run. More = smoother distribution" />
                <NumberField label="Variance (%)" value={config.mc_variance} onChange={(v) => setConfig({ mc_variance: v })} min={1} max={100} help="Max random deviation from base parameters per iteration" />
              </>
            )}
          </div>
        </AnimatedAccordion>

        <AnimatedAccordion title="Taxes & Fees">
          <div className="space-y-3">
            <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate applied to gross revenue" />
            <NumberField label="Store Split (%)" value={config.store_split} onChange={(v) => setConfig({ store_split: v })} min={0} max={100} help="% of revenue from app stores (vs. web). Affects commission calculation" slider />
            <NumberField label="App Store Commission (%)" value={config.app_store_comm} onChange={(v) => setConfig({ app_store_comm: v })} min={0} max={50} step={0.5} help="Apple/Google commission on in-app purchases (typically 15-30%)" />
            <NumberField label="Web Commission (%)" value={config.web_comm_pct} onChange={(v) => setConfig({ web_comm_pct: v })} min={0} max={20} step={0.1} help="Payment processor fee on web purchases (e.g., Stripe 2.9%)" />
            <NumberField label="Web Fixed Fee ($)" value={config.web_comm_fixed} onChange={(v) => setConfig({ web_comm_fixed: v })} min={0} step={0.1} help="Fixed fee per web transaction (e.g., Stripe $0.30)" />
            <NumberField label="Bank Fee (%)" value={config.bank_fee} onChange={(v) => setConfig({ bank_fee: v })} min={0} max={10} step={0.1} help="Additional banking/withdrawal fees on revenue" />
          </div>
        </AnimatedAccordion>

        <AnimatedAccordion title="Retention & Churn">
          <div className="space-y-3">
            <RetentionFunnel steps={[
              { label: "Weekly Retention", value: Math.max(0, 100 - config.weekly_cancel_rate), color: "#BDD0F8" },
              { label: "Monthly Retention", value: Math.max(0, 100 - config.monthly_churn_rate), color: "#7BA3F0" },
              { label: "Annual Renewal", value: Math.max(0, 100 - config.annual_non_renewal), color: "#2163E7" },
            ]} />
            <NumberField label="Weekly Cancel Rate (%)" value={config.weekly_cancel_rate} onChange={(v) => setConfig({ weekly_cancel_rate: v })} min={0} max={100} step={0.5} help="% of weekly subscribers who cancel each billing cycle" />
            <NumberField label="Monthly Churn Rate (%)" value={config.monthly_churn_rate} onChange={(v) => setConfig({ monthly_churn_rate: v })} min={0} max={100} step={0.5} help="% of monthly subscribers who cancel each month" />
            <NumberField label="Annual Non-Renewal (%)" value={config.annual_non_renewal} onChange={(v) => setConfig({ annual_non_renewal: v })} min={0} max={100} step={1} help="% of annual subscribers who don't renew after 12 months" />
            <NumberField label="Trial Days" value={config.trial_days} onChange={(v) => setConfig({ trial_days: v })} min={0} max={90} help="Length of free trial period in days (0 = no trial)" />
            <NumberField label="Refund Rate (%)" value={config.refund_rate} onChange={(v) => setConfig({ refund_rate: v })} min={0} max={50} step={0.5} help="% of paid users requesting refunds" />
            {config.refund_rate > 10 && (
              <InlineWarning message="Refund rate above 10% may indicate pricing or product issues" />
            )}
            <NumberField label="Upgrade Rate (%)" value={config.upgrade_rate} onChange={(v) => setConfig({ upgrade_rate: v })} min={0} max={50} step={0.5} help="% of users upgrading to a higher plan each month" />
            <NumberField label="Downgrade Rate (%)" value={config.downgrade_rate} onChange={(v) => setConfig({ downgrade_rate: v })} min={0} max={50} step={0.5} help="% of users downgrading to a lower plan each month" />
          </div>
        </AnimatedAccordion>

        <PhaseSection phase={config.phase1} phaseNum={1} />
        <PhaseSection phase={config.phase2} phaseNum={2} />
        <PhaseSection phase={config.phase3} phaseNum={3} />
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

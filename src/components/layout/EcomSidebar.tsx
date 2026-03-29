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
import { PhaseCostItems, ECOM_CATEGORIES } from "./PhaseCostItems";
import {
  AnimatedAccordion,
  ToggleSwitch,
  PhaseTimeline,
  PhaseSummaryCard,
  PhasePresets,
  InlineWarning,
} from "./ConfigWidgets";
import type { CostItem } from "@/stores/cost-items-store";
import type { EcomPhaseConfig } from "@/lib/types";

const PHASE_COLORS: [string, string, string] = ["#2275ed", "#85abf2", "#e8f0ff"];

function InfoIcon({ tooltip }: { tooltip: string }) {
  const [show, setShow] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean; alignRight: boolean }>({ top: 0, left: 0, above: true, alignRight: false });

  const handleToggle = () => {
    if (!show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const above = rect.top > 160;
      const alignRight = rect.left > window.innerWidth / 2;
      setPos({
        top: above ? rect.top - 8 : rect.bottom + 8,
        left: alignRight ? rect.right : rect.left,
        above,
        alignRight,
      });
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
        <span
          className="fixed z-[9999] px-3 py-2 bg-[#1a1a2e] text-white text-[10px] leading-relaxed rounded-[10px] shadow-lg w-[240px] max-w-[calc(100vw-2rem)] whitespace-normal pointer-events-none font-medium"
          style={{
            top: pos.above ? pos.top : pos.top,
            left: pos.alignRight ? 'auto' : pos.left,
            right: pos.alignRight ? (window.innerWidth - pos.left) : 'auto',
            transform: pos.above ? 'translateY(-100%)' : 'none',
          }}
        >
          {tooltip}
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

const ECOM_CONSERVATIVE: Partial<EcomPhaseConfig> = {
  avg_order_value: 35, repeat_purchase_rate: 10, cpc: 1.5,
  click_to_purchase: 1.5, cogs_pct: 50, return_rate: 8, discount_rate: 5,
};
const ECOM_MODERATE: Partial<EcomPhaseConfig> = {
  avg_order_value: 55, repeat_purchase_rate: 20, cpc: 1.0,
  click_to_purchase: 3, cogs_pct: 40, return_rate: 5, discount_rate: 10,
};
const ECOM_AGGRESSIVE: Partial<EcomPhaseConfig> = {
  avg_order_value: 80, repeat_purchase_rate: 35, cpc: 0.6,
  click_to_purchase: 5, cogs_pct: 30, return_rate: 3, discount_rate: 15,
};

function EcomPhaseSection({ phase, phaseNum }: { phase: EcomPhaseConfig; phaseNum: 1 | 2 | 3 }) {
  const setPhase = useConfigStore((s) => s.setEcommercePhase);
  const update = (partial: Partial<EcomPhaseConfig>) => setPhase(phaseNum, partial);

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

  const handlePreset = (preset: "conservative" | "moderate" | "aggressive") => {
    const values = preset === "conservative" ? ECOM_CONSERVATIVE
      : preset === "moderate" ? ECOM_MODERATE
      : ECOM_AGGRESSIVE;
    update(values);
  };

  return (
    <AnimatedAccordion title={`Phase ${phaseNum}`} color={PHASE_COLORS[phaseNum - 1]}>
      <div className="px-3 pb-3 space-y-3">
        <PhaseSummaryCard items={[
          { label: "Monthly Costs", value: `$${totalCosts.toLocaleString()}` },
          { label: "AOV", value: `$${phase.avg_order_value}` },
          { label: "Conv Rate", value: `${phase.click_to_purchase}%`, color: phase.click_to_purchase > 3 ? "#10B981" : "#F59E0B" },
          { label: "COGS", value: `${phase.cogs_pct}%` },
        ]} />

        <div>
          <p className="text-[10px] text-[#8181A5] mb-1.5">Quick Presets</p>
          <PhasePresets onApply={handlePreset} />
        </div>

        <div className="pt-1 pb-1 text-xs font-medium text-muted-foreground">Cost Items</div>
        <PhaseCostItems
          storeKey={`ecom-${phaseNum}`}
          defaults={costDefaults}
          categories={ECOM_CATEGORIES}
          onSync={handleCostSync}
        />

        <NumberField label="AOV ($)" value={phase.avg_order_value} onChange={(v) => update({ avg_order_value: v })} min={0} step={1} help="Average Order Value — the mean revenue per order. This is a key driver of your revenue. Affected by product pricing, upsells, and bundles. E-commerce typical: $30–80." />
        <NumberField label="Repeat Purchase Rate (%)" value={phase.repeat_purchase_rate} onChange={(v) => update({ repeat_purchase_rate: v })} min={0} max={100} step={1} help="Percentage of customers who come back and buy again within 30 days. Higher repeat rates dramatically improve unit economics and reduce reliance on paid acquisition." />
        <NumberField label="Orders/Returning Customer" value={phase.orders_per_returning} onChange={(v) => update({ orders_per_returning: v })} min={1} step={0.1} help="How many orders a returning customer places per month on average. Subscription boxes might be 1, fashion might be 1.5–2." />
        <NumberField label="COGS (%)" value={phase.cogs_pct} onChange={(v) => update({ cogs_pct: v })} min={0} max={100} step={1} help="Cost of Goods Sold — manufacturing, shipping, packaging, and fulfillment as a percentage of revenue. Physical products: typically 30–60%." />
        <NumberField label="Return Rate (%)" value={phase.return_rate} onChange={(v) => update({ return_rate: v })} min={0} max={100} step={0.5} help="Percentage of orders that get returned or refunded. Directly reduces your net revenue. Fashion: 15–30%, electronics: 5–10%." />
        {phase.return_rate > 15 && (
          <InlineWarning message="Return rate above 15% — check product quality or sizing" />
        )}
        <NumberField label="CPC ($)" value={phase.cpc} onChange={(v) => update({ cpc: v })} min={0.01} step={0.1} help="Cost Per Click — average price you pay for each ad click (Google Ads, Facebook, etc.). Lower CPC means more traffic for your budget. Typical: $0.50–$3.00." />
        <NumberField label="Click-to-Purchase (%)" value={phase.click_to_purchase} onChange={(v) => update({ click_to_purchase: v })} min={0} max={100} step={0.5} help="Conversion rate from ad click to completed purchase. This measures your landing page and checkout effectiveness. Good benchmark: 2–5%." slider />
        <NumberField label="Organic (%)" value={phase.organic_pct} onChange={(v) => update({ organic_pct: v })} min={0} max={100} step={1} help="Percentage of your total traffic that is organic (free — SEO, direct, social). Higher organic share means better unit economics since you're not paying for those visitors." slider />
        <NumberField label="Discount Rate (%)" value={phase.discount_rate} onChange={(v) => update({ discount_rate: v })} min={0} max={100} step={1} help="Average discount applied across all orders (promotions, coupons, sales). Reduces your effective AOV. Keep in mind: heavy discounting can hurt brand perception." />
      </div>
    </AnimatedAccordion>
  );
}

export function EcomSidebar({ projectId, onProjectCreated, monthRange, productType }: { projectId: string | null; onProjectCreated?: (id: string) => void; monthRange?: [number, number] | null; productType?: string }) {
  const config = useConfigStore((s) => s.ecommerceConfig);
  const setConfig = useConfigStore((s) => s.setEcommerceConfig);
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
        <h2 className="font-semibold text-sm">E-commerce Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType={productType ?? "ecommerce"} onProjectCreated={onProjectCreated} />

      <div className="px-3 py-2">
        <PhaseTimeline
          phase1Dur={config.phase1_dur}
          phase2Dur={config.phase2_dur}
          totalMonths={monthRange ? monthRange[1] - monthRange[0] + 1 : config.total_months}
          colors={PHASE_COLORS}
        />
      </div>

      <div className="px-3 space-y-3 py-2">
        <AnimatedAccordion title="General" defaultOpen>
          <div className="space-y-3">
            <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={6} max={120} help="Total forecast horizon in months" slider />
            <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (launch). Phase 3 = total - P1 - P2" slider />
            <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (growth). Phase 3 = total - P1 - P2" slider />
            {config.total_months - config.phase1_dur - config.phase2_dur < 1 && (
              <InlineWarning message="Phase 3 has no months — increase total or reduce P1/P2" type="error" />
            )}
          </div>
        </AnimatedAccordion>

        <AnimatedAccordion title="OpEx">
          <div className="space-y-3">
            <NumberField label="Misc Costs ($/mo)" value={config.misc_costs} onChange={(v) => setConfig({ misc_costs: v })} min={0} step={100} help="Monthly overhead costs — office rent, tools, SaaS subscriptions, legal, accounting, and other operational expenses not tied to a specific order." />
            <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate applied to gross revenue" />
          </div>
        </AnimatedAccordion>

        <AnimatedAccordion title="Sensitivity">
          <div className="space-y-3">
            <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Adjust click-to-purchase rate. Positive = better conversion" slider />
            <NumberField label="CPC (%)" value={config.sens_cpc} onChange={(v) => setConfig({ sens_cpc: v })} min={-100} max={100} help="Adjust CPC. Positive = higher cost per click (worse)" slider />
            <NumberField label="AOV (%)" value={config.sens_aov} onChange={(v) => setConfig({ sens_aov: v })} min={-100} max={100} help="Adjust average order value. Positive = higher AOV" slider />
            <NumberField label="Organic (%)" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Adjust organic traffic share. Positive = more organic" slider />
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

        <EcomPhaseSection phase={config.phase1} phaseNum={1} />
        <EcomPhaseSection phase={config.phase2} phaseNum={2} />
        <EcomPhaseSection phase={config.phase3} phaseNum={3} />
      </div>
    </div>
  );

  if (isMobile) {
    return <MobileConfigDrawer>{content}</MobileConfigDrawer>;
  }

  return (
    <aside className="w-[360px] border-r bg-background overflow-y-auto h-[calc(100vh-3.5rem)] flex-shrink-0" data-tour="config-sidebar">
      {content}
    </aside>
  );
}

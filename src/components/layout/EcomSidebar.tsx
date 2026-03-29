"use client";

import React, { useCallback } from "react";
import { useConfigStore } from "@/stores/config-store";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import { MobileConfigDrawer } from "./MobileConfigDrawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan } from "@/lib/plan-limits";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { PhaseCostItems, ECOM_CATEGORIES } from "./PhaseCostItems";
import {
  AnimatedAccordion,
  SegmentedControl,
  ToggleSwitch,
  PhaseTimeline,
  PhasePresets,
  InlineWarning,
  NumberField,
  TripleField,
} from "./ConfigWidgets";
import type { CostItem } from "@/stores/cost-items-store";
import type { EcomPhaseConfig } from "@/lib/types";

const PHASE_COLORS: [string, string, string] = ["#2163E7", "#7BA3F0", "#BDD0F8"];

const MODE_OPTIONS = [
  { value: "simple", label: "Simple" },
  { value: "advanced", label: "Advanced" },
];

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

export function EcomSidebar({ projectId, onProjectCreated, monthRange, productType }: {
  projectId: string | null;
  onProjectCreated?: (id: string) => void;
  monthRange?: [number, number] | null;
  productType?: string;
}) {
  const config = useConfigStore((s) => s.ecommerceConfig);
  const setConfig = useConfigStore((s) => s.setEcommerceConfig);
  const setPhase = useConfigStore((s) => s.setEcommercePhase);
  const setPhaseAll = useConfigStore((s) => s.setEcommercePhaseAll);
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
    const values = preset === "conservative" ? ECOM_CONSERVATIVE
      : preset === "moderate" ? ECOM_MODERATE
      : ECOM_AGGRESSIVE;
    setPhaseAll(values);
  };

  const costDefaultsForPhase = (phase: EcomPhaseConfig, num: number): CostItem[] => [
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
        <AnimatedAccordion title="General" defaultOpen>
          <div className="space-y-3">
            <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (launch). Phase 3 = remaining months." slider />
            <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (growth). Phase 3 = remaining months." slider />
          </div>
        </AnimatedAccordion>

        {/* Acquisition */}
        <AnimatedAccordion title="Acquisition" defaultOpen>
          <div className="space-y-3">
            <TripleField label="CPC ($)" help="Cost Per Click — average ad click price. Typical: $0.50–$3.00." values={[p1.cpc, p2.cpc, p3.cpc]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { cpc: v })} onChangeAll={(v) => setPhaseAll({ cpc: v })} min={0.01} step={0.1} />
            {isAdv && (
              <TripleField label="Organic (%)" help="% of total traffic from organic (free) sources — SEO, direct, social." values={[p1.organic_pct, p2.organic_pct, p3.organic_pct]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { organic_pct: v })} onChangeAll={(v) => setPhaseAll({ organic_pct: v })} min={0} max={100} step={1} slider />
            )}
          </div>
        </AnimatedAccordion>

        {/* Conversion */}
        <AnimatedAccordion title="Conversion" defaultOpen>
          <div className="space-y-3">
            <TripleField label="Click-to-Purchase (%)" help="Conversion rate from ad click to purchase. Good: 2–5%." values={[p1.click_to_purchase, p2.click_to_purchase, p3.click_to_purchase]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { click_to_purchase: v })} onChangeAll={(v) => setPhaseAll({ click_to_purchase: v })} min={0} max={100} step={0.5} slider />
            <TripleField label="Repeat Purchase Rate (%)" help="% of customers who buy again within 30 days." values={[p1.repeat_purchase_rate, p2.repeat_purchase_rate, p3.repeat_purchase_rate]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { repeat_purchase_rate: v })} onChangeAll={(v) => setPhaseAll({ repeat_purchase_rate: v })} min={0} max={100} step={1} />
            {isAdv && (
              <TripleField label="Orders/Returning Customer" help="Monthly orders per returning customer. Typical: 1–2." values={[p1.orders_per_returning, p2.orders_per_returning, p3.orders_per_returning]} perPhase={perPhase} onChange={(p, v) => setPhase(p, { orders_per_returning: v })} onChangeAll={(v) => setPhaseAll({ orders_per_returning: v })} min={1} step={0.1} />
            )}
          </div>
        </AnimatedAccordion>

        {/* Pricing & Revenue */}
        <AnimatedAccordion title="Pricing & Revenue" defaultOpen>
          <div className="space-y-3">
            <TripleField label="AOV ($)" help="Average Order Value — mean revenue per order. E-commerce: $30–80." values={[p1.avg_order_value, p2.avg_order_value, p3.avg_order_value]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { avg_order_value: v })} onChangeAll={(v) => setPhaseAll({ avg_order_value: v })} min={0} step={1} />
            <TripleField label="Discount Rate (%)" help="Average discount across all orders. Reduces effective AOV." values={[p1.discount_rate, p2.discount_rate, p3.discount_rate]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { discount_rate: v })} onChangeAll={(v) => setPhaseAll({ discount_rate: v })} min={0} max={100} step={1} />
          </div>
        </AnimatedAccordion>

        {/* Costs */}
        <AnimatedAccordion title="Costs" defaultOpen>
          <div className="space-y-3">
            {isAdv && perPhase ? (
              <>
                {([1, 2, 3] as const).map((num) => (
                  <AnimatedAccordion key={num} title={`Phase ${num}`} color={PHASE_COLORS[num - 1]}>
                    <div className="space-y-3">
                      <PhaseCostItems
                        storeKey={`ecom-${num}`}
                        defaults={costDefaultsForPhase(config[`phase${num}`], num)}
                        categories={ECOM_CATEGORIES}
                        onSync={makeCostSync(num)}
                      />
                    </div>
                  </AnimatedAccordion>
                ))}
              </>
            ) : (
              <PhaseCostItems
                storeKey="ecom-1"
                defaults={costDefaultsForPhase(p1, 1)}
                categories={ECOM_CATEGORIES}
                onSync={handleCostSyncAll}
              />
            )}
            <TripleField label="COGS (%)" help="Cost of Goods Sold — manufacturing, shipping, packaging. Physical: 30–60%." values={[p1.cogs_pct, p2.cogs_pct, p3.cogs_pct]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { cogs_pct: v })} onChangeAll={(v) => setPhaseAll({ cogs_pct: v })} min={0} max={100} step={1} />
            <TripleField label="Return Rate (%)" help="% of orders returned or refunded. Fashion: 15–30%, electronics: 5–10%." values={[p1.return_rate, p2.return_rate, p3.return_rate]} perPhase={isAdv && perPhase} onChange={(p, v) => setPhase(p, { return_rate: v })} onChangeAll={(v) => setPhaseAll({ return_rate: v })} min={0} max={100} step={0.5} />
            {p1.return_rate > 15 && <InlineWarning message="Return rate above 15% — check product quality or sizing" />}
          </div>
        </AnimatedAccordion>

        {/* Advanced-only sections */}
        {isAdv && (
          <>
            <AnimatedAccordion title="OpEx">
              <div className="space-y-3">
                <NumberField label="Misc Costs ($/mo)" value={config.misc_costs} onChange={(v) => setConfig({ misc_costs: v })} min={0} step={100} help="Monthly overhead — rent, tools, legal, accounting." />
                <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate on gross revenue" />
              </div>
            </AnimatedAccordion>

            <AnimatedAccordion title="Sensitivity">
              <div className="space-y-3">
                <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Adjust click-to-purchase rate" slider />
                <NumberField label="CPC (%)" value={config.sens_cpc} onChange={(v) => setConfig({ sens_cpc: v })} min={-100} max={100} help="Adjust CPC. Positive = higher cost" slider />
                <NumberField label="AOV (%)" value={config.sens_aov} onChange={(v) => setConfig({ sens_aov: v })} min={-100} max={100} help="Adjust average order value" slider />
                <NumberField label="Organic (%)" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Adjust organic traffic share" slider />
                <NumberField label="Scenario Bound (%)" value={config.scenario_bound} onChange={(v) => setConfig({ scenario_bound: v })} min={0} max={100} help="Spread for optimistic/pessimistic scenarios" slider />
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
    <aside className="w-[360px] border-r bg-background overflow-y-auto h-[calc(100vh-3.5rem)] flex-shrink-0" data-tour="config-sidebar">
      {content}
    </aside>
  );
}

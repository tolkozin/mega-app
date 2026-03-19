"use client";

import React, { useState } from "react";
import { useConfigStore } from "@/stores/config-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import { MobileConfigDrawer } from "./MobileConfigDrawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { EcomPhaseConfig } from "@/lib/types";

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

function EcomPhaseSection({ phase, phaseNum }: { phase: EcomPhaseConfig; phaseNum: 1 | 2 | 3 }) {
  const setPhase = useConfigStore((s) => s.setEcommercePhase);
  const update = (partial: Partial<EcomPhaseConfig>) => setPhase(phaseNum, partial);

  return (
    <Accordion title={`Phase ${phaseNum}`}>
      <NumberField label="Investment ($)" value={phase.investment} onChange={(v) => update({ investment: v })} min={0} step={1000} />
      <NumberField label="AOV ($)" value={phase.avg_order_value} onChange={(v) => update({ avg_order_value: v })} min={0} step={1} help="Average Order Value — mean revenue per order" />
      <NumberField label="Repeat Purchase Rate (%)" value={phase.repeat_purchase_rate} onChange={(v) => update({ repeat_purchase_rate: v })} min={0} max={100} step={1} help="% of customers who make a repeat purchase within 30 days" />
      <NumberField label="Orders/Returning Customer" value={phase.orders_per_returning} onChange={(v) => update({ orders_per_returning: v })} min={1} step={0.1} help="Average orders per returning customer per month" />
      <NumberField label="COGS (%)" value={phase.cogs_pct} onChange={(v) => update({ cogs_pct: v })} min={0} max={100} step={1} help="Cost of Goods Sold as % of revenue (manufacturing, shipping, packaging)" />
      <NumberField label="Return Rate (%)" value={phase.return_rate} onChange={(v) => update({ return_rate: v })} min={0} max={100} step={0.5} help="% of orders returned/refunded. Reduces net revenue" />
      <NumberField label="Ad Budget ($/mo)" value={phase.ad_budget} onChange={(v) => update({ ad_budget: v })} min={0} step={500} help="Monthly paid advertising spend (Facebook, Google, TikTok, etc.)" />
      <NumberField label="CPC ($)" value={phase.cpc} onChange={(v) => update({ cpc: v })} min={0.01} step={0.1} help="Cost Per Click — average price per ad click" />
      <NumberField label="Click-to-Purchase (%)" value={phase.click_to_purchase} onChange={(v) => update({ click_to_purchase: v })} min={0} max={100} step={0.5} help="% of ad clicks that result in a purchase (conversion rate)" />
      <NumberField label="Organic (%)" value={phase.organic_pct} onChange={(v) => update({ organic_pct: v })} min={0} max={100} step={1} help="% of total traffic that is organic (non-paid). Higher = better unit economics" />
      <NumberField label="Discount Rate (%)" value={phase.discount_rate} onChange={(v) => update({ discount_rate: v })} min={0} max={100} step={1} help="Average discount applied to orders. Reduces effective AOV" />
      <NumberField label="Monthly Salary ($)" value={phase.monthly_salary} onChange={(v) => update({ monthly_salary: v })} min={0} step={500} help="Total team salary per month during this phase" />
    </Accordion>
  );
}

export function EcomSidebar({ projectId, onProjectCreated }: { projectId: string | null; onProjectCreated?: (id: string) => void }) {
  const config = useConfigStore((s) => s.ecommerceConfig);
  const setConfig = useConfigStore((s) => s.setEcommerceConfig);
  const isMobile = useIsMobile();

  const content = (
    <>
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">E-commerce Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType="ecommerce" onProjectCreated={onProjectCreated} />

      <Accordion title="General" defaultOpen>
        <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={12} max={120} help="Total forecast horizon in months" />
        <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (launch). Phase 3 = total - P1 - P2" />
        <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (growth). Phase 3 = total - P1 - P2" />
      </Accordion>

      <Accordion title="OpEx">
        <NumberField label="Misc Costs ($/mo)" value={config.misc_costs} onChange={(v) => setConfig({ misc_costs: v })} min={0} step={100} help="Office, tools, SaaS subscriptions, legal, and other overhead" />
        <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate applied to gross revenue" />
      </Accordion>

      <Accordion title="Sensitivity">
        <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Adjust click-to-purchase rate. Positive = better conversion" />
        <NumberField label="CPC (%)" value={config.sens_cpc} onChange={(v) => setConfig({ sens_cpc: v })} min={-100} max={100} help="Adjust CPC. Positive = higher cost per click (worse)" />
        <NumberField label="AOV (%)" value={config.sens_aov} onChange={(v) => setConfig({ sens_aov: v })} min={-100} max={100} help="Adjust average order value. Positive = higher AOV" />
        <NumberField label="Organic (%)" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Adjust organic traffic share. Positive = more organic" />
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

      <EcomPhaseSection phase={config.phase1} phaseNum={1} />
      <EcomPhaseSection phase={config.phase2} phaseNum={2} />
      <EcomPhaseSection phase={config.phase3} phaseNum={3} />
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

"use client";

import React, { useState } from "react";
import { useConfigStore } from "@/stores/config-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ScenarioPanel } from "@/components/scenarios/ScenarioPanel";
import { MobileConfigDrawer } from "./MobileConfigDrawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { PhaseConfig } from "@/lib/types";

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

function PhaseSection({ phase, phaseNum }: { phase: PhaseConfig; phaseNum: 1 | 2 | 3 }) {
  const setPhase = useConfigStore((s) => s.setSubscriptionPhase);
  const update = (partial: Partial<PhaseConfig>) => setPhase(phaseNum, partial);

  return (
    <Accordion title={`Phase ${phaseNum}`}>
      <NumberField label="Investment ($)" value={phase.investment} onChange={(v) => update({ investment: v })} min={0} step={1000} help="One-time capital investment for this phase" />
      <NumberField label="Monthly Salary ($)" value={phase.monthly_salary} onChange={(v) => update({ monthly_salary: v })} min={0} step={500} help="Total team salary per month during this phase" />
      <NumberField label="Misc Costs ($/mo)" value={phase.misc_total} onChange={(v) => update({ misc_total: v })} min={0} step={100} help="Office rent, tools, SaaS subscriptions, legal fees, etc." />
      <NumberField label="Ad Budget ($/mo)" value={phase.ad_budget} onChange={(v) => update({ ad_budget: v })} min={0} step={500} help="Monthly paid advertising spend (Facebook, Google, etc.)" />
      <NumberField label="CPI ($)" value={phase.cpi} onChange={(v) => update({ cpi: v })} min={0.01} step={0.5} help="Cost Per Install — how much you pay per app install from ads" />
      <NumberField label="Conv Trial (%)" value={phase.conv_trial} onChange={(v) => update({ conv_trial: v })} min={0} max={100} step={1} help="% of paid installs that start a free trial" />
      <NumberField label="Conv Paid (%)" value={phase.conv_paid} onChange={(v) => update({ conv_paid: v })} min={0} max={100} step={1} help="% of trial users that convert to a paid subscription" />
      <NumberField label="Churn Mult" value={phase.churn_mult} onChange={(v) => update({ churn_mult: v })} min={0} step={0.1} help="Multiplier applied to base churn rates. 1.0 = default, 0.5 = halved churn, 2.0 = doubled" />

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
        <NumberField label="Growth (%/mo)" value={phase.ad_growth_pct} onChange={(v) => update({ ad_growth_pct: v })} step={0.5} help="Monthly % increase in ad budget (compound growth)" />
      ) : (
        <NumberField label="Growth ($/mo)" value={phase.ad_growth_abs} onChange={(v) => update({ ad_growth_abs: v })} step={100} help="Fixed dollar increase in ad budget each month" />
      )}
      <NumberField label="CPI Degradation (%/mo)" value={phase.cpi_degradation} onChange={(v) => update({ cpi_degradation: v })} min={0} step={0.5} help="Monthly % increase in CPI as audience saturates (higher = worse)" />

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
        <NumberField label="Organic Growth (%/mo)" value={phase.organic_growth_pct} onChange={(v) => update({ organic_growth_pct: v })} step={1} help="Monthly % growth of organic (non-paid) installs" />
      ) : (
        <NumberField label="Organic Growth (abs/mo)" value={phase.organic_growth_abs} onChange={(v) => update({ organic_growth_abs: v })} step={10} help="Fixed number of additional organic installs each month" />
      )}
      <NumberField label="Organic Conv Trial (%)" value={phase.organic_conv_trial} onChange={(v) => update({ organic_conv_trial: v })} min={0} max={100} step={1} help="% of organic installs that start a free trial" />
      <NumberField label="Organic Conv Paid (%)" value={phase.organic_conv_paid} onChange={(v) => update({ organic_conv_paid: v })} min={0} max={100} step={1} help="% of organic trial users that convert to paid" />
      <NumberField label="Organic Spend ($/mo)" value={phase.organic_spend} onChange={(v) => update({ organic_spend: v })} min={0} step={100} help="Monthly spend on SEO, content marketing, social media" />

      <div className="pt-2 text-xs font-medium text-muted-foreground">Pricing</div>
      <NumberField label="Weekly ($)" value={phase.price_weekly} onChange={(v) => update({ price_weekly: v })} min={0} step={0.99} help="Price for weekly subscription plan" />
      <NumberField label="Monthly ($)" value={phase.price_monthly} onChange={(v) => update({ price_monthly: v })} min={0} step={0.99} help="Price for monthly subscription plan" />
      <NumberField label="Annual ($)" value={phase.price_annual} onChange={(v) => update({ price_annual: v })} min={0} step={0.99} help="Price for annual subscription plan" />

      <div className="pt-2 text-xs font-medium text-muted-foreground">Plan Mix</div>
      <NumberField label="Weekly (%)" value={phase.mix_weekly * 100} onChange={(v) => update({ mix_weekly: v / 100 })} min={0} max={100} step={1} help="% of new subscribers choosing weekly plan. All mixes should sum to 100%" />
      <NumberField label="Monthly (%)" value={phase.mix_monthly * 100} onChange={(v) => update({ mix_monthly: v / 100 })} min={0} max={100} step={1} help="% of new subscribers choosing monthly plan" />
      <NumberField label="Annual (%)" value={phase.mix_annual * 100} onChange={(v) => update({ mix_annual: v / 100 })} min={0} max={100} step={1} help="% of new subscribers choosing annual plan" />

      <NumberField label="COGS (%)" value={phase.cogs * 100} onChange={(v) => update({ cogs: v / 100 })} min={0} max={100} step={1} help="Cost of Goods Sold as % of revenue (hosting, CDN, support)" />
    </Accordion>
  );
}

export function Sidebar({ projectId, onProjectCreated }: { projectId: string | null; onProjectCreated?: (id: string) => void }) {
  const config = useConfigStore((s) => s.subscriptionConfig);
  const setConfig = useConfigStore((s) => s.setSubscriptionConfig);
  const isMobile = useIsMobile();

  const content = (
    <>
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">Subscription Model Config</h2>
      </div>

      <ScenarioPanel projectId={projectId} modelType="subscription" onProjectCreated={onProjectCreated} />

      <Accordion title="General" defaultOpen>
        <NumberField label="Total Months" value={config.total_months} onChange={(v) => setConfig({ total_months: v })} min={12} max={120} help="Total forecast horizon in months" />
        <NumberField label="Phase 1 Duration" value={config.phase1_dur} onChange={(v) => setConfig({ phase1_dur: v })} min={1} max={24} help="Months in Phase 1 (launch / MVP). Phase 3 = total - P1 - P2" />
        <NumberField label="Phase 2 Duration" value={config.phase2_dur} onChange={(v) => setConfig({ phase2_dur: v })} min={1} max={24} help="Months in Phase 2 (growth). Phase 3 = total - P1 - P2" />
        <NumberField label="Starting Organic" value={config.starting_organic} onChange={(v) => setConfig({ starting_organic: v })} min={0} help="Initial organic installs per month at model start" />
      </Accordion>

      <Accordion title="Sensitivity">
        <NumberField label="Conversion (%)" value={config.sens_conv} onChange={(v) => setConfig({ sens_conv: v })} min={-100} max={100} help="Adjust conversion rates by this %. Positive = better conversion" />
        <NumberField label="Churn (%)" value={config.sens_churn} onChange={(v) => setConfig({ sens_churn: v })} min={-100} max={100} help="Adjust churn rates by this %. Positive = more churn (worse)" />
        <NumberField label="CPI (%)" value={config.sens_cpi} onChange={(v) => setConfig({ sens_cpi: v })} min={-100} max={100} help="Adjust CPI by this %. Positive = higher cost per install" />
        <NumberField label="Organic (%)" value={config.sens_organic} onChange={(v) => setConfig({ sens_organic: v })} min={-100} max={100} help="Adjust organic growth by this %. Positive = more organic" />
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
            <NumberField label="Iterations" value={config.mc_iterations} onChange={(v) => setConfig({ mc_iterations: v })} min={50} max={1000} step={50} help="Number of random simulations to run. More = smoother distribution" />
            <NumberField label="Variance (%)" value={config.mc_variance} onChange={(v) => setConfig({ mc_variance: v })} min={1} max={100} help="Max random deviation from base parameters per iteration" />
          </>
        )}
      </Accordion>

      <Accordion title="Taxes & Fees">
        <NumberField label="Corporate Tax (%)" value={config.corporate_tax} onChange={(v) => setConfig({ corporate_tax: v })} min={0} max={100} step={0.5} help="Tax rate applied to gross revenue" />
        <NumberField label="Store Split (%)" value={config.store_split} onChange={(v) => setConfig({ store_split: v })} min={0} max={100} help="% of revenue from app stores (vs. web). Affects commission calculation" />
        <NumberField label="App Store Commission (%)" value={config.app_store_comm} onChange={(v) => setConfig({ app_store_comm: v })} min={0} max={50} step={0.5} help="Apple/Google commission on in-app purchases (typically 15-30%)" />
        <NumberField label="Web Commission (%)" value={config.web_comm_pct} onChange={(v) => setConfig({ web_comm_pct: v })} min={0} max={20} step={0.1} help="Payment processor fee on web purchases (e.g., Stripe 2.9%)" />
        <NumberField label="Web Fixed Fee ($)" value={config.web_comm_fixed} onChange={(v) => setConfig({ web_comm_fixed: v })} min={0} step={0.1} help="Fixed fee per web transaction (e.g., Stripe $0.30)" />
        <NumberField label="Bank Fee (%)" value={config.bank_fee} onChange={(v) => setConfig({ bank_fee: v })} min={0} max={10} step={0.1} help="Additional banking/withdrawal fees on revenue" />
      </Accordion>

      <Accordion title="Retention & Churn">
        <NumberField label="Weekly Cancel Rate (%)" value={config.weekly_cancel_rate} onChange={(v) => setConfig({ weekly_cancel_rate: v })} min={0} max={100} step={0.5} help="% of weekly subscribers who cancel each billing cycle" />
        <NumberField label="Monthly Churn Rate (%)" value={config.monthly_churn_rate} onChange={(v) => setConfig({ monthly_churn_rate: v })} min={0} max={100} step={0.5} help="% of monthly subscribers who cancel each month" />
        <NumberField label="Annual Non-Renewal (%)" value={config.annual_non_renewal} onChange={(v) => setConfig({ annual_non_renewal: v })} min={0} max={100} step={1} help="% of annual subscribers who don't renew after 12 months" />
        <NumberField label="Trial Days" value={config.trial_days} onChange={(v) => setConfig({ trial_days: v })} min={0} max={90} help="Length of free trial period in days (0 = no trial)" />
        <NumberField label="Refund Rate (%)" value={config.refund_rate} onChange={(v) => setConfig({ refund_rate: v })} min={0} max={50} step={0.5} help="% of paid users requesting refunds" />
        <NumberField label="Upgrade Rate (%)" value={config.upgrade_rate} onChange={(v) => setConfig({ upgrade_rate: v })} min={0} max={50} step={0.5} help="% of users upgrading to a higher plan each month" />
        <NumberField label="Downgrade Rate (%)" value={config.downgrade_rate} onChange={(v) => setConfig({ downgrade_rate: v })} min={0} max={50} step={0.5} help="% of users downgrading to a lower plan each month" />
      </Accordion>

      <PhaseSection phase={config.phase1} phaseNum={1} />
      <PhaseSection phase={config.phase2} phaseNum={2} />
      <PhaseSection phase={config.phase3} phaseNum={3} />
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

import type { BaseEngine } from "@/lib/model-registry";

export function buildSubscriptionScenario(config: Record<string, unknown>) {
  const base = {
    conv: (config.sens_conv as number) / 100,
    churn: (config.sens_churn as number) / 100,
    cpi: (config.sens_cpi as number) / 100,
    organic: (config.sens_organic as number) / 100,
  };
  const bound = (config.scenario_bound as number) / 100;
  return {
    base,
    pessimistic: { conv: base.conv - bound, churn: base.churn + bound, cpi: base.cpi + bound, organic: base.organic - bound },
    optimistic: { conv: base.conv + bound, churn: base.churn - bound, cpi: base.cpi - bound, organic: base.organic + bound },
  };
}

export function buildEcommerceScenario(config: Record<string, unknown>) {
  const base = {
    conv: (config.sens_conv as number) / 100,
    cpc: (config.sens_cpc as number) / 100,
    aov: (config.sens_aov as number) / 100,
    organic: (config.sens_organic as number) / 100,
  };
  const bound = (config.scenario_bound as number) / 100;
  return {
    base,
    pessimistic: { conv: base.conv - bound, cpc: base.cpc + bound, aov: base.aov - bound, organic: base.organic - bound },
    optimistic: { conv: base.conv + bound, cpc: base.cpc - bound, aov: base.aov + bound, organic: base.organic + bound },
  };
}

export function buildSaasScenario(config: Record<string, unknown>) {
  const base = {
    conv: (config.sens_conv as number) / 100,
    churn: (config.sens_churn as number) / 100,
    expansion: (config.sens_expansion as number) / 100,
    organic: (config.sens_organic as number) / 100,
  };
  const bound = (config.scenario_bound as number) / 100;
  return {
    base,
    pessimistic: { conv: base.conv - bound, churn: base.churn + bound, expansion: base.expansion - bound, organic: base.organic - bound },
    optimistic: { conv: base.conv + bound, churn: base.churn - bound, expansion: base.expansion + bound, organic: base.organic + bound },
  };
}

export const SCENARIO_BUILDERS: Record<BaseEngine, (config: Record<string, unknown>) => Record<string, Record<string, number>>> = {
  subscription: buildSubscriptionScenario,
  ecommerce: buildEcommerceScenario,
  saas: buildSaasScenario,
};

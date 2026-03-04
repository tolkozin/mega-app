import { create } from "zustand";
import type { ModelConfig, PhaseConfig, EcomConfig, EcomPhaseConfig } from "@/lib/types";

// Default PhaseConfigs matching Python dataclass defaults
const defaultPhase1: PhaseConfig = {
  investment: 100000, salaries_total: 17475, misc_total: 8419,
  ad_budget: 0, cpi: 7.5, conv_trial: 0, conv_paid: 0, churn_mult: 1,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 0, ad_growth_abs: 0, cpi_degradation: 0,
  organic_growth_mode: "Percentage (%)", organic_growth_pct: 0, organic_growth_abs: 0,
  organic_conv_trial: 0, organic_conv_paid: 0, organic_spend: 0,
  price_weekly: 4.99, price_monthly: 7.99, price_annual: 49.99,
  mix_weekly: 0, mix_monthly: 0.48, mix_annual: 0.52, cogs: 0.1,
};

const defaultPhase2: PhaseConfig = {
  investment: 0, salaries_total: 3600, misc_total: 750,
  ad_budget: 5000, cpi: 7.5, conv_trial: 20, conv_paid: 20, churn_mult: 1.5,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 5, ad_growth_abs: 5000, cpi_degradation: 1,
  organic_growth_mode: "Percentage (%)", organic_growth_pct: 10, organic_growth_abs: 50,
  organic_conv_trial: 25, organic_conv_paid: 25, organic_spend: 500,
  price_weekly: 4.99, price_monthly: 7.99, price_annual: 49.99,
  mix_weekly: 0, mix_monthly: 0.48, mix_annual: 0.52, cogs: 0.1,
};

const defaultPhase3: PhaseConfig = {
  investment: 0, salaries_total: 64800, misc_total: 13500,
  ad_budget: 150000, cpi: 7.5, conv_trial: 25, conv_paid: 25, churn_mult: 1,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 5, ad_growth_abs: 5000, cpi_degradation: 1,
  organic_growth_mode: "Percentage (%)", organic_growth_pct: 15, organic_growth_abs: 500,
  organic_conv_trial: 35, organic_conv_paid: 35, organic_spend: 2000,
  price_weekly: 4.99, price_monthly: 7.99, price_annual: 49.99,
  mix_weekly: 0, mix_monthly: 0.48, mix_annual: 0.52, cogs: 0.1,
};

export const defaultModelConfig: ModelConfig = {
  total_months: 60, phase1_dur: 3, phase2_dur: 3,
  sens_conv: 0, sens_churn: 0, sens_cpi: 0, sens_organic: 0, scenario_bound: 20,
  mc_enabled: false, mc_iterations: 200, mc_variance: 20,
  corporate_tax: 1, store_split: 50, app_store_comm: 15,
  web_comm_pct: 3.5, web_comm_fixed: 0.5, bank_fee: 1,
  weekly_cancel_rate: 15, monthly_churn_rate: 10, annual_non_renewal: 30,
  trial_days: 7, refund_rate: 2, upgrade_rate: 2, downgrade_rate: 5,
  starting_organic: 0,
  phase1: defaultPhase1, phase2: defaultPhase2, phase3: defaultPhase3,
};

const defaultEcomPhase1: EcomPhaseConfig = {
  avg_order_value: 45, repeat_purchase_rate: 10, orders_per_returning: 1.2,
  cogs_pct: 45, return_rate: 5, ad_budget: 3000, cpc: 2,
  click_to_purchase: 2, organic_pct: 10, discount_rate: 10,
};

const defaultEcomPhase2: EcomPhaseConfig = {
  avg_order_value: 50, repeat_purchase_rate: 20, orders_per_returning: 1.5,
  cogs_pct: 40, return_rate: 5, ad_budget: 8000, cpc: 1.5,
  click_to_purchase: 3, organic_pct: 20, discount_rate: 5,
};

const defaultEcomPhase3: EcomPhaseConfig = {
  avg_order_value: 55, repeat_purchase_rate: 30, orders_per_returning: 2,
  cogs_pct: 35, return_rate: 4, ad_budget: 20000, cpc: 1.2,
  click_to_purchase: 4, organic_pct: 30, discount_rate: 3,
};

export const defaultEcomConfig: EcomConfig = {
  product_type: "ecommerce",
  total_months: 36, phase1_dur: 3, phase2_dur: 6,
  phase1: defaultEcomPhase1, phase2: defaultEcomPhase2, phase3: defaultEcomPhase3,
  salaries_base: 5000, salaries_growth: 3, misc_costs: 2000,
  corporate_tax: 1,
  sens_conv: 0, sens_cpc: 0, sens_aov: 0, sens_organic: 0, scenario_bound: 20,
  mc_enabled: false, mc_iterations: 200, mc_variance: 20,
};

interface ConfigStore {
  subscriptionConfig: ModelConfig;
  ecommerceConfig: EcomConfig;
  setSubscriptionConfig: (config: Partial<ModelConfig>) => void;
  setEcommerceConfig: (config: Partial<EcomConfig>) => void;
  setSubscriptionPhase: (phase: 1 | 2 | 3, config: Partial<PhaseConfig>) => void;
  setEcommercePhase: (phase: 1 | 2 | 3, config: Partial<EcomPhaseConfig>) => void;
  loadSubscriptionConfig: (config: ModelConfig) => void;
  loadEcommerceConfig: (config: EcomConfig) => void;
  resetSubscription: () => void;
  resetEcommerce: () => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  subscriptionConfig: defaultModelConfig,
  ecommerceConfig: defaultEcomConfig,

  setSubscriptionConfig: (partial) =>
    set((state) => ({
      subscriptionConfig: { ...state.subscriptionConfig, ...partial },
    })),

  setEcommerceConfig: (partial) =>
    set((state) => ({
      ecommerceConfig: { ...state.ecommerceConfig, ...partial },
    })),

  setSubscriptionPhase: (phase, partial) =>
    set((state) => {
      const key = `phase${phase}` as "phase1" | "phase2" | "phase3";
      return {
        subscriptionConfig: {
          ...state.subscriptionConfig,
          [key]: { ...state.subscriptionConfig[key], ...partial },
        },
      };
    }),

  setEcommercePhase: (phase, partial) =>
    set((state) => {
      const key = `phase${phase}` as "phase1" | "phase2" | "phase3";
      return {
        ecommerceConfig: {
          ...state.ecommerceConfig,
          [key]: { ...state.ecommerceConfig[key], ...partial },
        },
      };
    }),

  loadSubscriptionConfig: (config) => set({ subscriptionConfig: config }),
  loadEcommerceConfig: (config) => set({ ecommerceConfig: config }),
  resetSubscription: () => set({ subscriptionConfig: defaultModelConfig }),
  resetEcommerce: () => set({ ecommerceConfig: defaultEcomConfig }),
}));

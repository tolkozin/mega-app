import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModelConfig, PhaseConfig, EcomConfig, EcomPhaseConfig, SaasConfig, SaasPhaseConfig } from "@/lib/types";

// Default PhaseConfigs matching Python dataclass defaults
const defaultPhase1: PhaseConfig = {
  investment: 100000, monthly_salary: 5000, misc_total: 3000,
  ad_budget: 3000, cpi: 5, conv_trial: 15, conv_paid: 15, churn_mult: 1,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 0, ad_growth_abs: 0, cpi_degradation: 0,
  organic_growth_mode: "Absolute ($)", organic_growth_pct: 0, organic_growth_abs: 100,
  organic_conv_trial: 20, organic_conv_paid: 20, organic_spend: 0,
  price_weekly: 4.99, price_monthly: 9.99, price_annual: 79.99,
  mix_weekly: 0, mix_monthly: 0.45, mix_annual: 0.55, cogs: 0.1,
};

const defaultPhase2: PhaseConfig = {
  investment: 0, monthly_salary: 8000, misc_total: 2000,
  ad_budget: 10000, cpi: 4.5, conv_trial: 25, conv_paid: 25, churn_mult: 1.2,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 8, ad_growth_abs: 2000, cpi_degradation: 0.5,
  organic_growth_mode: "Percentage (%)", organic_growth_pct: 15, organic_growth_abs: 200,
  organic_conv_trial: 30, organic_conv_paid: 30, organic_spend: 1000,
  price_weekly: 4.99, price_monthly: 9.99, price_annual: 79.99,
  mix_weekly: 0, mix_monthly: 0.45, mix_annual: 0.55, cogs: 0.1,
};

const defaultPhase3: PhaseConfig = {
  investment: 0, monthly_salary: 15000, misc_total: 5000,
  ad_budget: 30000, cpi: 4, conv_trial: 30, conv_paid: 30, churn_mult: 1,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 5, ad_growth_abs: 3000, cpi_degradation: 0.5,
  organic_growth_mode: "Percentage (%)", organic_growth_pct: 12, organic_growth_abs: 500,
  organic_conv_trial: 35, organic_conv_paid: 35, organic_spend: 2000,
  price_weekly: 4.99, price_monthly: 9.99, price_annual: 79.99,
  mix_weekly: 0, mix_monthly: 0.45, mix_annual: 0.55, cogs: 0.1,
};

export const defaultModelConfig: ModelConfig = {
  total_months: 12, phase1_dur: 3, phase2_dur: 3,
  sens_conv: 0, sens_churn: 0, sens_cpi: 0, sens_organic: 0, scenario_bound: 20,
  mc_enabled: false, mc_iterations: 200, mc_variance: 20,
  corporate_tax: 1, store_split: 50, app_store_comm: 15,
  web_comm_pct: 3.5, web_comm_fixed: 0.5, bank_fee: 1,
  weekly_cancel_rate: 12, monthly_churn_rate: 8, annual_non_renewal: 25,
  trial_days: 7, refund_rate: 2, upgrade_rate: 2, downgrade_rate: 5,
  starting_organic: 200,
  phase1: defaultPhase1, phase2: defaultPhase2, phase3: defaultPhase3,
};

const defaultEcomPhase1: EcomPhaseConfig = {
  investment: 50000, avg_order_value: 55, repeat_purchase_rate: 15, orders_per_returning: 1.3,
  cogs_pct: 40, return_rate: 4, ad_budget: 5000, cpc: 1.5,
  click_to_purchase: 3, organic_pct: 15, discount_rate: 8, monthly_salary: 5000,
};

const defaultEcomPhase2: EcomPhaseConfig = {
  investment: 0, avg_order_value: 60, repeat_purchase_rate: 25, orders_per_returning: 1.8,
  cogs_pct: 35, return_rate: 4, ad_budget: 12000, cpc: 1.2,
  click_to_purchase: 4, organic_pct: 25, discount_rate: 5, monthly_salary: 8000,
};

const defaultEcomPhase3: EcomPhaseConfig = {
  investment: 0, avg_order_value: 65, repeat_purchase_rate: 35, orders_per_returning: 2.2,
  cogs_pct: 30, return_rate: 3, ad_budget: 25000, cpc: 1,
  click_to_purchase: 5, organic_pct: 35, discount_rate: 3, monthly_salary: 12000,
};

export const defaultEcomConfig: EcomConfig = {
  product_type: "ecommerce",
  total_months: 12, phase1_dur: 3, phase2_dur: 6,
  phase1: defaultEcomPhase1, phase2: defaultEcomPhase2, phase3: defaultEcomPhase3,
  misc_costs: 2000,
  corporate_tax: 1,
  sens_conv: 0, sens_cpc: 0, sens_aov: 0, sens_organic: 0, scenario_bound: 20,
  mc_enabled: false, mc_iterations: 200, mc_variance: 20,
};

const defaultSaasPhase1: SaasPhaseConfig = {
  investment: 100000, seats_per_account: 4, price_per_seat: 49, annual_contract_pct: 60, annual_discount: 15,
  ad_budget: 5000, cpl: 120, lead_to_demo: 30, demo_to_close: 20,
  sales_cycle_months: 1, expansion_rate: 2, contraction_rate: 0.5, logo_churn_rate: 2,
  cogs_per_seat: 5, organic_leads_pct: 15, monthly_salary: 10000,
};

const defaultSaasPhase2: SaasPhaseConfig = {
  investment: 0, seats_per_account: 6, price_per_seat: 49, annual_contract_pct: 70, annual_discount: 15,
  ad_budget: 12000, cpl: 100, lead_to_demo: 35, demo_to_close: 30,
  sales_cycle_months: 1, expansion_rate: 4, contraction_rate: 1, logo_churn_rate: 1.5,
  cogs_per_seat: 4, organic_leads_pct: 25, monthly_salary: 20000,
};

const defaultSaasPhase3: SaasPhaseConfig = {
  investment: 0, seats_per_account: 10, price_per_seat: 59, annual_contract_pct: 80, annual_discount: 15,
  ad_budget: 25000, cpl: 80, lead_to_demo: 40, demo_to_close: 35,
  sales_cycle_months: 1, expansion_rate: 6, contraction_rate: 1, logo_churn_rate: 1,
  cogs_per_seat: 3, organic_leads_pct: 35, monthly_salary: 30000,
};

export const defaultSaasConfig: SaasConfig = {
  product_type: "saas",
  total_months: 12, phase1_dur: 3, phase2_dur: 9,
  phase1: defaultSaasPhase1, phase2: defaultSaasPhase2, phase3: defaultSaasPhase3,
  misc_costs: 3000,
  corporate_tax: 1,
  initial_customers: 5, initial_seats: 20, investment: 100000,
  sens_conv: 0, sens_churn: 0, sens_expansion: 0, sens_organic: 0, scenario_bound: 20,
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
  saasConfig: SaasConfig;
  setSaasConfig: (config: Partial<SaasConfig>) => void;
  setSaasPhase: (phase: 1 | 2 | 3, config: Partial<SaasPhaseConfig>) => void;
  loadSaasConfig: (config: SaasConfig) => void;
  resetSaas: () => void;
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
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

      saasConfig: defaultSaasConfig,

      setSaasConfig: (partial) =>
        set((state) => ({
          saasConfig: { ...state.saasConfig, ...partial },
        })),

      setSaasPhase: (phase, partial) =>
        set((state) => {
          const key = `phase${phase}` as "phase1" | "phase2" | "phase3";
          return {
            saasConfig: {
              ...state.saasConfig,
              [key]: { ...state.saasConfig[key], ...partial },
            },
          };
        }),

      loadSaasConfig: (config) => set({ saasConfig: config }),
      resetSaas: () => set({ saasConfig: defaultSaasConfig }),
    }),
    {
      name: "revenuemap-config",
      version: 2,
      partialize: (state) => ({
        subscriptionConfig: state.subscriptionConfig,
        ecommerceConfig: state.ecommerceConfig,
        saasConfig: state.saasConfig,
      }),
    }
  )
);

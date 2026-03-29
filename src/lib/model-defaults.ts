/**
 * Realistic default configurations per model/engine combination.
 * All values based on 2024-2025 industry benchmarks.
 *
 * Sources: RevenueCat, Appsflyer, Adjust, Sensor Tower, OpenView,
 * Bessemer, KeyBanc, Statista, Shopify, Business of Apps, and others.
 */

import type { ModelConfig, PhaseConfig, EcomConfig, EcomPhaseConfig, SaasConfig, SaasPhaseConfig } from "./types";
import type { ProductType, BaseEngine } from "./model-registry";

// ─── Shared constants ────────────────────────────────────────
const TOTAL_MONTHS = 60;
const CORPORATE_TAX = 25; // 21% federal + ~4% state avg
const SCENARIO_BOUND = 20;
const MC_ITERATIONS = 200;
const MC_VARIANCE = 20;

// ─── Helper: merge phase partial into full PhaseConfig ───────
function subPhase(base: PhaseConfig, overrides: Partial<PhaseConfig>): PhaseConfig {
  return { ...base, ...overrides };
}
function ecomPhase(base: EcomPhaseConfig, overrides: Partial<EcomPhaseConfig>): EcomPhaseConfig {
  return { ...base, ...overrides };
}
function saasPhase(base: SaasPhaseConfig, overrides: Partial<SaasPhaseConfig>): SaasPhaseConfig {
  return { ...base, ...overrides };
}

// ═════════════════════════════════════════════════════════════
//  SUBSCRIPTION ENGINE DEFAULTS
// ═════════════════════════════════════════════════════════════

const SUB_BASE_P1: PhaseConfig = {
  investment: 80000, monthly_salary: 6000, misc_total: 2000,
  ad_budget: 5000, cpi: 3.5, conv_trial: 7, conv_paid: 35, churn_mult: 1,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 0, ad_growth_abs: 0, cpi_degradation: 0,
  organic_growth_mode: "Absolute ($)", organic_growth_pct: 0, organic_growth_abs: 80,
  organic_conv_trial: 10, organic_conv_paid: 25, organic_spend: 0,
  price_weekly: 4.99, price_monthly: 9.99, price_annual: 49.99,
  mix_weekly: 0, mix_monthly: 0.45, mix_annual: 0.55, cogs: 0.15,
};

const SUB_BASE_P2: PhaseConfig = {
  investment: 0, monthly_salary: 10000, misc_total: 3000,
  ad_budget: 12000, cpi: 3.0, conv_trial: 10, conv_paid: 38, churn_mult: 1,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 8, ad_growth_abs: 0, cpi_degradation: 0.3,
  organic_growth_mode: "Percentage (%)", organic_growth_pct: 12, organic_growth_abs: 0,
  organic_conv_trial: 15, organic_conv_paid: 30, organic_spend: 500,
  price_weekly: 4.99, price_monthly: 9.99, price_annual: 49.99,
  mix_weekly: 0, mix_monthly: 0.40, mix_annual: 0.60, cogs: 0.15,
};

const SUB_BASE_P3: PhaseConfig = {
  investment: 0, monthly_salary: 15000, misc_total: 4000,
  ad_budget: 25000, cpi: 2.5, conv_trial: 12, conv_paid: 42, churn_mult: 0.9,
  ad_growth_mode: "Percentage (%)", ad_growth_pct: 5, ad_growth_abs: 0, cpi_degradation: 0.5,
  organic_growth_mode: "Percentage (%)", organic_growth_pct: 8, organic_growth_abs: 0,
  organic_conv_trial: 18, organic_conv_paid: 35, organic_spend: 1500,
  price_weekly: 4.99, price_monthly: 9.99, price_annual: 49.99,
  mix_weekly: 0, mix_monthly: 0.35, mix_annual: 0.65, cogs: 0.12,
};

function makeSubConfig(overrides: {
  p1?: Partial<PhaseConfig>; p2?: Partial<PhaseConfig>; p3?: Partial<PhaseConfig>;
  top?: Partial<ModelConfig>;
}): ModelConfig {
  return {
    total_months: TOTAL_MONTHS, phase1_dur: 4, phase2_dur: 8,
    sens_conv: 0, sens_churn: 0, sens_cpi: 0, sens_organic: 0, scenario_bound: SCENARIO_BOUND,
    mc_enabled: false, mc_iterations: MC_ITERATIONS, mc_variance: MC_VARIANCE,
    corporate_tax: CORPORATE_TAX, store_split: 50, app_store_comm: 15,
    web_comm_pct: 3.5, web_comm_fixed: 0.5, bank_fee: 1,
    weekly_cancel_rate: 12, monthly_churn_rate: 13, annual_non_renewal: 50,
    trial_days: 7, refund_rate: 3, upgrade_rate: 2, downgrade_rate: 4,
    starting_organic: 150,
    phase1: subPhase(SUB_BASE_P1, overrides.p1 ?? {}),
    phase2: subPhase(SUB_BASE_P2, overrides.p2 ?? {}),
    phase3: subPhase(SUB_BASE_P3, overrides.p3 ?? {}),
    ...overrides.top,
  };
}

// ─── Per-model subscription defaults ─────────────────────────

const SUB_DEFAULTS: Partial<Record<ProductType, ModelConfig>> = {
  // Mobile App — Subscription
  subscription: makeSubConfig({
    top: { app_store_comm: 15, store_split: 50, starting_organic: 150, monthly_churn_rate: 13, annual_non_renewal: 50 },
    p1: { cpi: 3.5, conv_trial: 7, conv_paid: 35, ad_budget: 5000, price_monthly: 9.99, price_annual: 49.99 },
    p2: { cpi: 3.0, conv_trial: 10, conv_paid: 38, ad_budget: 12000 },
    p3: { cpi: 2.5, conv_trial: 12, conv_paid: 42, ad_budget: 25000 },
  }),

  // E-Commerce — Subscription Box
  ecommerce: makeSubConfig({
    top: { app_store_comm: 0, store_split: 100, web_comm_pct: 3, starting_organic: 100, monthly_churn_rate: 10, annual_non_renewal: 65, trial_days: 0, weekly_cancel_rate: 0 },
    p1: { cpi: 45, conv_trial: 0, conv_paid: 30, ad_budget: 4000, price_weekly: 0, price_monthly: 40, price_annual: 399, mix_weekly: 0, mix_monthly: 0.70, mix_annual: 0.30, cogs: 0.50, monthly_salary: 5000 },
    p2: { cpi: 38, conv_trial: 0, conv_paid: 35, ad_budget: 10000, price_weekly: 0, price_monthly: 40, price_annual: 399, mix_weekly: 0, mix_monthly: 0.60, mix_annual: 0.40, cogs: 0.45 },
    p3: { cpi: 30, conv_trial: 0, conv_paid: 40, ad_budget: 20000, price_weekly: 0, price_monthly: 42, price_annual: 419, mix_weekly: 0, mix_monthly: 0.55, mix_annual: 0.45, cogs: 0.40 },
  }),

  // SaaS — Self-Serve Subscription
  saas: makeSubConfig({
    top: { app_store_comm: 0, store_split: 100, web_comm_pct: 3, starting_organic: 80, monthly_churn_rate: 3.5, annual_non_renewal: 30, trial_days: 14, weekly_cancel_rate: 0 },
    p1: { cpi: 150, conv_trial: 18, conv_paid: 48, ad_budget: 5000, price_weekly: 0, price_monthly: 29, price_annual: 249, mix_weekly: 0, mix_monthly: 0.60, mix_annual: 0.40, cogs: 0.20, monthly_salary: 8000 },
    p2: { cpi: 120, conv_trial: 22, conv_paid: 50, ad_budget: 15000, price_weekly: 0, price_monthly: 29, price_annual: 249, mix_weekly: 0, mix_monthly: 0.50, mix_annual: 0.50, cogs: 0.18 },
    p3: { cpi: 100, conv_trial: 25, conv_paid: 55, ad_budget: 30000, price_weekly: 0, price_monthly: 39, price_annual: 349, mix_weekly: 0, mix_monthly: 0.45, mix_annual: 0.55, cogs: 0.15 },
  }),

  // GameTech — Subscription
  gametech: makeSubConfig({
    top: { app_store_comm: 15, store_split: 50, starting_organic: 200, monthly_churn_rate: 22, annual_non_renewal: 65, trial_days: 3 },
    p1: { cpi: 3.5, conv_trial: 5, conv_paid: 4, ad_budget: 8000, price_weekly: 4.99, price_monthly: 7.99, price_annual: 49.99, mix_weekly: 0.80, mix_monthly: 0.15, mix_annual: 0.05, cogs: 0.15, monthly_salary: 8000 },
    p2: { cpi: 3.0, conv_trial: 7, conv_paid: 5, ad_budget: 20000, price_weekly: 4.99, price_monthly: 7.99, price_annual: 49.99, mix_weekly: 0.75, mix_monthly: 0.18, mix_annual: 0.07, cogs: 0.12 },
    p3: { cpi: 2.5, conv_trial: 8, conv_paid: 6, ad_budget: 40000, price_weekly: 4.99, price_monthly: 9.99, price_annual: 59.99, mix_weekly: 0.70, mix_monthly: 0.20, mix_annual: 0.10, cogs: 0.10 },
  }),

  // FoodTech — Meal Kit Subscription
  foodtech: makeSubConfig({
    top: { app_store_comm: 0, store_split: 100, web_comm_pct: 3, starting_organic: 60, monthly_churn_rate: 12, annual_non_renewal: 80, trial_days: 0, weekly_cancel_rate: 0 },
    p1: { cpi: 100, conv_trial: 0, conv_paid: 25, ad_budget: 5000, price_weekly: 0, price_monthly: 60, price_annual: 0, mix_weekly: 0, mix_monthly: 1, mix_annual: 0, cogs: 0.55, monthly_salary: 8000 },
    p2: { cpi: 80, conv_trial: 0, conv_paid: 30, ad_budget: 15000, price_weekly: 0, price_monthly: 60, price_annual: 0, mix_weekly: 0, mix_monthly: 1, mix_annual: 0, cogs: 0.50 },
    p3: { cpi: 65, conv_trial: 0, conv_paid: 35, ad_budget: 30000, price_weekly: 0, price_monthly: 65, price_annual: 0, mix_weekly: 0, mix_monthly: 1, mix_annual: 0, cogs: 0.45 },
  }),

  // TravelTech — Membership Subscription
  traveltech: makeSubConfig({
    top: { app_store_comm: 0, store_split: 100, web_comm_pct: 3, starting_organic: 50, monthly_churn_rate: 5, annual_non_renewal: 40, trial_days: 14, weekly_cancel_rate: 0 },
    p1: { cpi: 55, conv_trial: 15, conv_paid: 25, ad_budget: 4000, price_weekly: 0, price_monthly: 20, price_annual: 179, mix_weekly: 0, mix_monthly: 0.50, mix_annual: 0.50, cogs: 0.10, monthly_salary: 6000 },
    p2: { cpi: 45, conv_trial: 18, conv_paid: 30, ad_budget: 10000, price_weekly: 0, price_monthly: 20, price_annual: 179, mix_weekly: 0, mix_monthly: 0.40, mix_annual: 0.60, cogs: 0.10 },
    p3: { cpi: 35, conv_trial: 22, conv_paid: 35, ad_budget: 20000, price_weekly: 0, price_monthly: 25, price_annual: 219, mix_weekly: 0, mix_monthly: 0.35, mix_annual: 0.65, cogs: 0.08 },
  }),

  // HealthTech — Patient Subscription
  healthtech: makeSubConfig({
    top: { app_store_comm: 15, store_split: 50, starting_organic: 40, monthly_churn_rate: 10, annual_non_renewal: 60, trial_days: 7 },
    p1: { cpi: 150, conv_trial: 12, conv_paid: 15, ad_budget: 5000, price_weekly: 0, price_monthly: 39.99, price_annual: 349, mix_weekly: 0, mix_monthly: 0.55, mix_annual: 0.45, cogs: 0.25, monthly_salary: 10000 },
    p2: { cpi: 120, conv_trial: 15, conv_paid: 20, ad_budget: 15000, price_weekly: 0, price_monthly: 39.99, price_annual: 349, mix_weekly: 0, mix_monthly: 0.45, mix_annual: 0.55, cogs: 0.22 },
    p3: { cpi: 100, conv_trial: 18, conv_paid: 25, ad_budget: 30000, price_weekly: 0, price_monthly: 49.99, price_annual: 449, mix_weekly: 0, mix_monthly: 0.40, mix_annual: 0.60, cogs: 0.20 },
  }),

  // EdTech — Student Subscription
  edtech: makeSubConfig({
    top: { app_store_comm: 15, store_split: 50, starting_organic: 100, monthly_churn_rate: 10, annual_non_renewal: 50, trial_days: 7, weekly_cancel_rate: 0 },
    p1: { cpi: 60, conv_trial: 12, conv_paid: 15, ad_budget: 3000, price_weekly: 0, price_monthly: 14.99, price_annual: 99, mix_weekly: 0, mix_monthly: 0.40, mix_annual: 0.60, cogs: 0.20, monthly_salary: 5000 },
    p2: { cpi: 50, conv_trial: 15, conv_paid: 18, ad_budget: 8000, price_weekly: 0, price_monthly: 14.99, price_annual: 99, mix_weekly: 0, mix_monthly: 0.35, mix_annual: 0.65, cogs: 0.18 },
    p3: { cpi: 40, conv_trial: 18, conv_paid: 22, ad_budget: 18000, price_weekly: 0, price_monthly: 19.99, price_annual: 149, mix_weekly: 0, mix_monthly: 0.30, mix_annual: 0.70, cogs: 0.15 },
  }),

  // AI/ML — API Subscription
  "ai-ml": makeSubConfig({
    top: { app_store_comm: 0, store_split: 100, web_comm_pct: 3, starting_organic: 50, monthly_churn_rate: 5, annual_non_renewal: 40, trial_days: 14, weekly_cancel_rate: 0 },
    p1: { cpi: 250, conv_trial: 10, conv_paid: 15, ad_budget: 5000, price_weekly: 0, price_monthly: 49, price_annual: 468, mix_weekly: 0, mix_monthly: 0.65, mix_annual: 0.35, cogs: 0.45, monthly_salary: 12000 },
    p2: { cpi: 200, conv_trial: 13, conv_paid: 18, ad_budget: 15000, price_weekly: 0, price_monthly: 49, price_annual: 468, mix_weekly: 0, mix_monthly: 0.55, mix_annual: 0.45, cogs: 0.40, monthly_salary: 18000 },
    p3: { cpi: 160, conv_trial: 15, conv_paid: 22, ad_budget: 30000, price_weekly: 0, price_monthly: 79, price_annual: 749, mix_weekly: 0, mix_monthly: 0.45, mix_annual: 0.55, cogs: 0.35, monthly_salary: 25000 },
  }),
};

// ═════════════════════════════════════════════════════════════
//  ECOMMERCE ENGINE DEFAULTS
// ═════════════════════════════════════════════════════════════

const ECOM_BASE_P1: EcomPhaseConfig = {
  investment: 50000, avg_order_value: 85, repeat_purchase_rate: 15, orders_per_returning: 1.3,
  cogs_pct: 50, return_rate: 18, ad_budget: 5000, cpc: 1.20,
  click_to_purchase: 2.5, organic_pct: 30, discount_rate: 15, monthly_salary: 5000,
};

const ECOM_BASE_P2: EcomPhaseConfig = {
  investment: 0, avg_order_value: 90, repeat_purchase_rate: 25, orders_per_returning: 1.6,
  cogs_pct: 45, return_rate: 16, ad_budget: 12000, cpc: 1.00,
  click_to_purchase: 3.0, organic_pct: 40, discount_rate: 12, monthly_salary: 8000,
};

const ECOM_BASE_P3: EcomPhaseConfig = {
  investment: 0, avg_order_value: 95, repeat_purchase_rate: 30, orders_per_returning: 2.0,
  cogs_pct: 42, return_rate: 14, ad_budget: 25000, cpc: 0.85,
  click_to_purchase: 3.5, organic_pct: 50, discount_rate: 10, monthly_salary: 12000,
};

function makeEcomConfig(overrides: {
  p1?: Partial<EcomPhaseConfig>; p2?: Partial<EcomPhaseConfig>; p3?: Partial<EcomPhaseConfig>;
  top?: Partial<EcomConfig>;
}): EcomConfig {
  return {
    product_type: "ecommerce",
    total_months: TOTAL_MONTHS, phase1_dur: 4, phase2_dur: 8,
    phase1: ecomPhase(ECOM_BASE_P1, overrides.p1 ?? {}),
    phase2: ecomPhase(ECOM_BASE_P2, overrides.p2 ?? {}),
    phase3: ecomPhase(ECOM_BASE_P3, overrides.p3 ?? {}),
    misc_costs: 2000, corporate_tax: CORPORATE_TAX,
    sens_conv: 0, sens_cpc: 0, sens_aov: 0, sens_organic: 0, scenario_bound: SCENARIO_BOUND,
    mc_enabled: false, mc_iterations: MC_ITERATIONS, mc_variance: MC_VARIANCE,
    ...overrides.top,
  };
}

const ECOM_DEFAULTS: Partial<Record<ProductType, EcomConfig>> = {
  // Mobile App — In-App Purchases
  subscription: makeEcomConfig({
    p1: { avg_order_value: 3, repeat_purchase_rate: 30, orders_per_returning: 2.0, cogs_pct: 8, return_rate: 2, cpc: 3.0, click_to_purchase: 3.5, organic_pct: 35, discount_rate: 0, ad_budget: 5000 },
    p2: { avg_order_value: 5, repeat_purchase_rate: 35, orders_per_returning: 2.5, cogs_pct: 8, return_rate: 2, cpc: 2.5, click_to_purchase: 4.0, organic_pct: 40, discount_rate: 0, ad_budget: 12000 },
    p3: { avg_order_value: 7, repeat_purchase_rate: 40, orders_per_returning: 3.0, cogs_pct: 5, return_rate: 1, cpc: 2.0, click_to_purchase: 5.0, organic_pct: 45, discount_rate: 0, ad_budget: 25000 },
    top: { misc_costs: 2000 },
  }),

  // E-Commerce — Per Order
  ecommerce: makeEcomConfig({
    p1: { avg_order_value: 85, repeat_purchase_rate: 15, cogs_pct: 50, return_rate: 18, cpc: 1.2, click_to_purchase: 2.5, organic_pct: 30, discount_rate: 15 },
    p2: { avg_order_value: 90, repeat_purchase_rate: 25, cogs_pct: 45, return_rate: 16, cpc: 1.0, click_to_purchase: 3.0, organic_pct: 40, discount_rate: 12 },
    p3: { avg_order_value: 95, repeat_purchase_rate: 30, cogs_pct: 42, return_rate: 14, cpc: 0.85, click_to_purchase: 3.5, organic_pct: 50, discount_rate: 10 },
  }),

  // Marketplace — Per Transaction
  marketplace: makeEcomConfig({
    p1: { avg_order_value: 75, repeat_purchase_rate: 20, orders_per_returning: 1.5, cogs_pct: 8, return_rate: 5, cpc: 0.80, click_to_purchase: 3.0, organic_pct: 25, discount_rate: 5, ad_budget: 6000 },
    p2: { avg_order_value: 80, repeat_purchase_rate: 28, orders_per_returning: 1.8, cogs_pct: 7, return_rate: 4, cpc: 0.65, click_to_purchase: 3.5, organic_pct: 35, discount_rate: 3, ad_budget: 15000 },
    p3: { avg_order_value: 85, repeat_purchase_rate: 35, orders_per_returning: 2.2, cogs_pct: 6, return_rate: 3, cpc: 0.50, click_to_purchase: 4.0, organic_pct: 45, discount_rate: 2, ad_budget: 30000 },
    top: { misc_costs: 3000 },
  }),

  // FoodTech — Per Order Delivery
  foodtech: makeEcomConfig({
    p1: { avg_order_value: 35, repeat_purchase_rate: 40, orders_per_returning: 3.0, cogs_pct: 65, return_rate: 5, cpc: 1.0, click_to_purchase: 4.5, organic_pct: 20, discount_rate: 15, ad_budget: 6000, monthly_salary: 6000 },
    p2: { avg_order_value: 38, repeat_purchase_rate: 48, orders_per_returning: 4.0, cogs_pct: 60, return_rate: 4, cpc: 0.8, click_to_purchase: 5.0, organic_pct: 30, discount_rate: 10, ad_budget: 15000, monthly_salary: 10000 },
    p3: { avg_order_value: 40, repeat_purchase_rate: 55, orders_per_returning: 5.0, cogs_pct: 55, return_rate: 3, cpc: 0.6, click_to_purchase: 5.5, organic_pct: 40, discount_rate: 5, ad_budget: 30000, monthly_salary: 15000 },
    top: { misc_costs: 3000 },
  }),

  // TravelTech — Per Booking
  traveltech: makeEcomConfig({
    p1: { avg_order_value: 350, repeat_purchase_rate: 12, orders_per_returning: 1.2, cogs_pct: 85, return_rate: 8, cpc: 1.5, click_to_purchase: 2.0, organic_pct: 25, discount_rate: 5, ad_budget: 5000 },
    p2: { avg_order_value: 380, repeat_purchase_rate: 18, orders_per_returning: 1.4, cogs_pct: 82, return_rate: 6, cpc: 1.2, click_to_purchase: 2.5, organic_pct: 35, discount_rate: 3, ad_budget: 12000 },
    p3: { avg_order_value: 400, repeat_purchase_rate: 22, orders_per_returning: 1.6, cogs_pct: 80, return_rate: 5, cpc: 1.0, click_to_purchase: 3.0, organic_pct: 45, discount_rate: 2, ad_budget: 25000 },
    top: { misc_costs: 2000 },
  }),

  // GameTech — In-Game Purchases
  gametech: makeEcomConfig({
    p1: { avg_order_value: 5, repeat_purchase_rate: 30, orders_per_returning: 3.0, cogs_pct: 8, return_rate: 2, cpc: 2.5, click_to_purchase: 3.5, organic_pct: 25, discount_rate: 0, ad_budget: 8000, monthly_salary: 8000 },
    p2: { avg_order_value: 7, repeat_purchase_rate: 35, orders_per_returning: 4.0, cogs_pct: 6, return_rate: 1, cpc: 2.0, click_to_purchase: 4.0, organic_pct: 30, discount_rate: 0, ad_budget: 20000, monthly_salary: 12000 },
    p3: { avg_order_value: 10, repeat_purchase_rate: 40, orders_per_returning: 5.0, cogs_pct: 5, return_rate: 1, cpc: 1.5, click_to_purchase: 4.5, organic_pct: 35, discount_rate: 0, ad_budget: 40000, monthly_salary: 18000 },
    top: { misc_costs: 3000 },
  }),

  // FinTech — Per Transaction
  fintech: makeEcomConfig({
    p1: { avg_order_value: 85, repeat_purchase_rate: 55, orders_per_returning: 4.0, cogs_pct: 3, return_rate: 1, cpc: 4.0, click_to_purchase: 3.0, organic_pct: 20, discount_rate: 0, ad_budget: 8000, monthly_salary: 10000 },
    p2: { avg_order_value: 100, repeat_purchase_rate: 65, orders_per_returning: 6.0, cogs_pct: 2, return_rate: 1, cpc: 3.5, click_to_purchase: 4.0, organic_pct: 30, discount_rate: 0, ad_budget: 18000, monthly_salary: 15000 },
    p3: { avg_order_value: 120, repeat_purchase_rate: 72, orders_per_returning: 8.0, cogs_pct: 2, return_rate: 1, cpc: 3.0, click_to_purchase: 5.0, organic_pct: 40, discount_rate: 0, ad_budget: 35000, monthly_salary: 22000 },
    top: { misc_costs: 5000 },
  }),

  // PropTech — Per Deal
  proptech: makeEcomConfig({
    p1: { avg_order_value: 8000, repeat_purchase_rate: 5, orders_per_returning: 1.1, cogs_pct: 30, return_rate: 0, cpc: 2.5, click_to_purchase: 1.0, organic_pct: 20, discount_rate: 0, ad_budget: 5000, monthly_salary: 8000 },
    p2: { avg_order_value: 9000, repeat_purchase_rate: 8, orders_per_returning: 1.2, cogs_pct: 28, return_rate: 0, cpc: 2.0, click_to_purchase: 1.5, organic_pct: 30, discount_rate: 0, ad_budget: 12000, monthly_salary: 12000 },
    p3: { avg_order_value: 10000, repeat_purchase_rate: 10, orders_per_returning: 1.3, cogs_pct: 25, return_rate: 0, cpc: 1.8, click_to_purchase: 2.0, organic_pct: 40, discount_rate: 0, ad_budget: 25000, monthly_salary: 18000 },
    top: { misc_costs: 3000 },
  }),

  // EdTech — Course Sales
  edtech: makeEcomConfig({
    p1: { avg_order_value: 79, repeat_purchase_rate: 20, orders_per_returning: 1.5, cogs_pct: 25, return_rate: 8, cpc: 2.5, click_to_purchase: 3.0, organic_pct: 35, discount_rate: 20, ad_budget: 3000, monthly_salary: 4000 },
    p2: { avg_order_value: 89, repeat_purchase_rate: 28, orders_per_returning: 1.8, cogs_pct: 22, return_rate: 6, cpc: 2.0, click_to_purchase: 3.5, organic_pct: 45, discount_rate: 15, ad_budget: 8000, monthly_salary: 7000 },
    p3: { avg_order_value: 99, repeat_purchase_rate: 32, orders_per_returning: 2.0, cogs_pct: 18, return_rate: 5, cpc: 1.5, click_to_purchase: 4.0, organic_pct: 55, discount_rate: 10, ad_budget: 18000, monthly_salary: 10000 },
    top: { misc_costs: 1500 },
  }),

  // AI/ML — Pay-per-Use
  "ai-ml": makeEcomConfig({
    p1: { avg_order_value: 50, repeat_purchase_rate: 60, orders_per_returning: 4.0, cogs_pct: 50, return_rate: 2, cpc: 4.0, click_to_purchase: 6.0, organic_pct: 30, discount_rate: 0, ad_budget: 5000, monthly_salary: 12000 },
    p2: { avg_order_value: 80, repeat_purchase_rate: 68, orders_per_returning: 6.0, cogs_pct: 45, return_rate: 1, cpc: 3.5, click_to_purchase: 7.0, organic_pct: 40, discount_rate: 0, ad_budget: 15000, monthly_salary: 18000 },
    p3: { avg_order_value: 120, repeat_purchase_rate: 75, orders_per_returning: 8.0, cogs_pct: 40, return_rate: 1, cpc: 3.0, click_to_purchase: 8.0, organic_pct: 50, discount_rate: 0, ad_budget: 30000, monthly_salary: 25000 },
    top: { misc_costs: 5000 },
  }),
};

// ═════════════════════════════════════════════════════════════
//  SAAS ENGINE DEFAULTS
// ═════════════════════════════════════════════════════════════

const SAAS_BASE_P1: SaasPhaseConfig = {
  investment: 100000, seats_per_account: 5, price_per_seat: 45, annual_contract_pct: 60, annual_discount: 20,
  ad_budget: 5000, cpl: 237, lead_to_demo: 15, demo_to_close: 20,
  sales_cycle_months: 2, expansion_rate: 2, contraction_rate: 0.5, logo_churn_rate: 2.5,
  cogs_per_seat: 10, organic_leads_pct: 25, monthly_salary: 12000,
};

const SAAS_BASE_P2: SaasPhaseConfig = {
  investment: 0, seats_per_account: 8, price_per_seat: 45, annual_contract_pct: 65, annual_discount: 20,
  ad_budget: 15000, cpl: 200, lead_to_demo: 20, demo_to_close: 22,
  sales_cycle_months: 2, expansion_rate: 4, contraction_rate: 1, logo_churn_rate: 2.0,
  cogs_per_seat: 9, organic_leads_pct: 35, monthly_salary: 20000,
};

const SAAS_BASE_P3: SaasPhaseConfig = {
  investment: 0, seats_per_account: 12, price_per_seat: 55, annual_contract_pct: 70, annual_discount: 20,
  ad_budget: 30000, cpl: 170, lead_to_demo: 25, demo_to_close: 25,
  sales_cycle_months: 2, expansion_rate: 6, contraction_rate: 1, logo_churn_rate: 1.5,
  cogs_per_seat: 8, organic_leads_pct: 40, monthly_salary: 30000,
};

function makeSaasConfig(overrides: {
  p1?: Partial<SaasPhaseConfig>; p2?: Partial<SaasPhaseConfig>; p3?: Partial<SaasPhaseConfig>;
  top?: Partial<SaasConfig>;
}): SaasConfig {
  return {
    product_type: "saas",
    total_months: TOTAL_MONTHS, phase1_dur: 4, phase2_dur: 10,
    phase1: saasPhase(SAAS_BASE_P1, overrides.p1 ?? {}),
    phase2: saasPhase(SAAS_BASE_P2, overrides.p2 ?? {}),
    phase3: saasPhase(SAAS_BASE_P3, overrides.p3 ?? {}),
    misc_costs: 3000, corporate_tax: CORPORATE_TAX,
    initial_customers: 3, initial_seats: 15, investment: 100000,
    sens_conv: 0, sens_churn: 0, sens_expansion: 0, sens_organic: 0, scenario_bound: SCENARIO_BOUND,
    mc_enabled: false, mc_iterations: MC_ITERATIONS, mc_variance: MC_VARIANCE,
    ...overrides.top,
  };
}

const SAAS_DEFAULTS: Partial<Record<ProductType, SaasConfig>> = {
  // SaaS B2B — Per Seat
  saas: makeSaasConfig({
    p1: { cpl: 237, lead_to_demo: 15, demo_to_close: 20, price_per_seat: 45, seats_per_account: 5 },
    p2: { cpl: 200, lead_to_demo: 20, demo_to_close: 22, price_per_seat: 45, seats_per_account: 8 },
    p3: { cpl: 170, lead_to_demo: 25, demo_to_close: 25, price_per_seat: 55, seats_per_account: 12 },
  }),

  // Marketplace — B2B SaaS Platform
  marketplace: makeSaasConfig({
    p1: { cpl: 200, lead_to_demo: 15, demo_to_close: 20, price_per_seat: 99, seats_per_account: 3, logo_churn_rate: 3.5, monthly_salary: 10000 },
    p2: { cpl: 170, lead_to_demo: 20, demo_to_close: 22, price_per_seat: 99, seats_per_account: 5, logo_churn_rate: 2.5 },
    p3: { cpl: 140, lead_to_demo: 25, demo_to_close: 25, price_per_seat: 119, seats_per_account: 8, logo_churn_rate: 2.0 },
    top: { initial_customers: 2, initial_seats: 6 },
  }),

  // FinTech — B2B SaaS Platform
  fintech: makeSaasConfig({
    p1: { cpl: 450, lead_to_demo: 15, demo_to_close: 18, price_per_seat: 75, seats_per_account: 5, sales_cycle_months: 3, logo_churn_rate: 1.5, cogs_per_seat: 20, expansion_rate: 3, monthly_salary: 15000 },
    p2: { cpl: 380, lead_to_demo: 18, demo_to_close: 20, price_per_seat: 85, seats_per_account: 8, sales_cycle_months: 3, logo_churn_rate: 1.2, cogs_per_seat: 18, expansion_rate: 5, monthly_salary: 25000 },
    p3: { cpl: 320, lead_to_demo: 22, demo_to_close: 22, price_per_seat: 95, seats_per_account: 12, sales_cycle_months: 2, logo_churn_rate: 1.0, cogs_per_seat: 15, expansion_rate: 7, monthly_salary: 35000 },
    top: { misc_costs: 5000, initial_customers: 2, initial_seats: 10, investment: 150000 },
  }),

  // HealthTech — B2B SaaS Platform
  healthtech: makeSaasConfig({
    p1: { cpl: 400, lead_to_demo: 12, demo_to_close: 15, price_per_seat: 90, seats_per_account: 5, sales_cycle_months: 5, logo_churn_rate: 1.8, cogs_per_seat: 22, expansion_rate: 3, monthly_salary: 15000 },
    p2: { cpl: 350, lead_to_demo: 15, demo_to_close: 18, price_per_seat: 100, seats_per_account: 10, sales_cycle_months: 4, logo_churn_rate: 1.5, cogs_per_seat: 18, expansion_rate: 5, monthly_salary: 25000 },
    p3: { cpl: 300, lead_to_demo: 18, demo_to_close: 20, price_per_seat: 115, seats_per_account: 15, sales_cycle_months: 3, logo_churn_rate: 1.2, cogs_per_seat: 15, expansion_rate: 8, monthly_salary: 35000 },
    top: { misc_costs: 5000, initial_customers: 2, initial_seats: 10, investment: 120000 },
  }),

  // EdTech — B2B SaaS Platform
  edtech: makeSaasConfig({
    p1: { cpl: 350, lead_to_demo: 15, demo_to_close: 15, price_per_seat: 15, seats_per_account: 20, sales_cycle_months: 4, logo_churn_rate: 1.2, cogs_per_seat: 3, expansion_rate: 3, annual_contract_pct: 80, monthly_salary: 8000 },
    p2: { cpl: 300, lead_to_demo: 18, demo_to_close: 18, price_per_seat: 18, seats_per_account: 40, sales_cycle_months: 3, logo_churn_rate: 1.0, cogs_per_seat: 3, expansion_rate: 5, annual_contract_pct: 85, monthly_salary: 15000 },
    p3: { cpl: 250, lead_to_demo: 22, demo_to_close: 20, price_per_seat: 22, seats_per_account: 60, sales_cycle_months: 3, logo_churn_rate: 0.8, cogs_per_seat: 3, expansion_rate: 8, annual_contract_pct: 90, monthly_salary: 22000 },
    top: { misc_costs: 2000, initial_customers: 3, initial_seats: 60 },
  }),

  // PropTech — B2B SaaS Platform
  proptech: makeSaasConfig({
    p1: { cpl: 70, lead_to_demo: 15, demo_to_close: 18, price_per_seat: 120, seats_per_account: 3, sales_cycle_months: 2, logo_churn_rate: 4, cogs_per_seat: 15, expansion_rate: 2, monthly_salary: 8000 },
    p2: { cpl: 60, lead_to_demo: 18, demo_to_close: 20, price_per_seat: 120, seats_per_account: 5, sales_cycle_months: 2, logo_churn_rate: 3, cogs_per_seat: 12, expansion_rate: 4, monthly_salary: 15000 },
    p3: { cpl: 50, lead_to_demo: 22, demo_to_close: 22, price_per_seat: 140, seats_per_account: 8, sales_cycle_months: 1, logo_churn_rate: 2.5, cogs_per_seat: 10, expansion_rate: 6, monthly_salary: 22000 },
    top: { misc_costs: 2500, initial_customers: 5, initial_seats: 15, investment: 80000 },
  }),

  // AI/ML — B2B SaaS Platform
  "ai-ml": makeSaasConfig({
    p1: { cpl: 400, lead_to_demo: 18, demo_to_close: 18, price_per_seat: 60, seats_per_account: 5, sales_cycle_months: 2, logo_churn_rate: 3.5, cogs_per_seat: 25, expansion_rate: 3, monthly_salary: 15000 },
    p2: { cpl: 340, lead_to_demo: 22, demo_to_close: 20, price_per_seat: 70, seats_per_account: 8, sales_cycle_months: 2, logo_churn_rate: 2.8, cogs_per_seat: 22, expansion_rate: 5, monthly_salary: 22000 },
    p3: { cpl: 280, lead_to_demo: 25, demo_to_close: 22, price_per_seat: 85, seats_per_account: 12, sales_cycle_months: 1, logo_churn_rate: 2.0, cogs_per_seat: 18, expansion_rate: 8, monthly_salary: 30000 },
    top: { misc_costs: 5000, initial_customers: 2, initial_seats: 10, investment: 150000 },
  }),
};

// ═════════════════════════════════════════════════════════════
//  PUBLIC API
// ═════════════════════════════════════════════════════════════

/**
 * Get realistic default config for a model/engine combination.
 * Falls back to base engine defaults if no model-specific override exists.
 */
export function getModelDefaults(
  modelType: ProductType,
  engine: BaseEngine,
): ModelConfig | EcomConfig | SaasConfig {
  if (engine === "subscription") {
    return SUB_DEFAULTS[modelType] ?? SUB_DEFAULTS.subscription!;
  }
  if (engine === "ecommerce") {
    return ECOM_DEFAULTS[modelType] ?? ECOM_DEFAULTS.ecommerce!;
  }
  return SAAS_DEFAULTS[modelType] ?? SAAS_DEFAULTS.saas!;
}

/** Type-safe getter for subscription engine defaults */
export function getSubscriptionDefaults(modelType: ProductType): ModelConfig {
  return (SUB_DEFAULTS[modelType] ?? SUB_DEFAULTS.subscription!) as ModelConfig;
}

/** Type-safe getter for ecommerce engine defaults */
export function getEcommerceDefaults(modelType: ProductType): EcomConfig {
  return (ECOM_DEFAULTS[modelType] ?? ECOM_DEFAULTS.ecommerce!) as EcomConfig;
}

/** Type-safe getter for saas engine defaults */
export function getSaasDefaults(modelType: ProductType): SaasConfig {
  return (SAAS_DEFAULTS[modelType] ?? SAAS_DEFAULTS.saas!) as SaasConfig;
}

/**
 * Industry-specific config presets.
 *
 * Each product type × industry combination produces a partial config
 * that is merged ON TOP of the base engine defaults. Survey stage and
 * budget further adjust investment and growth assumptions.
 */

import type { PhaseConfig, ModelConfig, EcomPhaseConfig, EcomConfig, SaasPhaseConfig, SaasConfig } from "./types";
import { getBaseEngine, type BaseEngine, type ProductType } from "./model-registry";
import { defaultModelConfig, defaultEcomConfig, defaultSaasConfig } from "@/stores/config-store";
import { getModelDefaults } from "./model-defaults";

/* ─── Deep-merge helper ─── */

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge<T extends Record<string, any>>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const val = patch[key];
    if (val !== undefined && typeof val === "object" && val !== null && !Array.isArray(val)) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, val as Record<string, unknown>) as T[keyof T];
    } else if (val !== undefined) {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════════════
   SUBSCRIPTION ENGINE PRESETS  (mobile-app, gametech)
   ═══════════════════════════════════════════════════════════════════════ */

type SubPreset = DeepPartial<ModelConfig>;

const SUB_BASE: Record<string, SubPreset> = {
  // ── Mobile App (subscription) — default engine ──
  subscription: {},
  // ── GameTech — default engine ──
  gametech: {
    phase1: { cpi: 4, ad_budget: 0, price_weekly: 2.99, price_monthly: 4.99, price_annual: 29.99, mix_weekly: 0.3, mix_monthly: 0.5, mix_annual: 0.2 },
    phase2: { cpi: 3.5, ad_budget: 8000, conv_trial: 25, conv_paid: 15, churn_mult: 2 },
    phase3: { ad_budget: 200000, cpi: 3, organic_growth_pct: 20, organic_conv_paid: 20 },
    weekly_cancel_rate: 25, monthly_churn_rate: 15, annual_non_renewal: 40,
  },
  // ── E-Commerce on subscription engine → Subscription Box ──
  ecommerce: {
    phase1: { price_monthly: 29.99, price_annual: 299.99, cpi: 12, ad_budget: 4000, conv_trial: 10, conv_paid: 8, mix_monthly: 0.6, mix_annual: 0.4, mix_weekly: 0, cogs: 0.35, investment: 60000 },
    phase2: { ad_budget: 8000, cpi: 10, conv_trial: 15, conv_paid: 12, organic_growth_pct: 12 },
    phase3: { ad_budget: 20000, cpi: 8, conv_trial: 20, conv_paid: 15, organic_growth_pct: 15 },
    monthly_churn_rate: 10, annual_non_renewal: 30, trial_days: 0,
  },
  // ── SaaS on subscription engine → Self-Serve SaaS ──
  saas: {
    phase1: { price_monthly: 29, price_annual: 290, cpi: 25, ad_budget: 5000, conv_trial: 20, conv_paid: 12, mix_monthly: 0.4, mix_annual: 0.6, mix_weekly: 0, cogs: 0.05, investment: 100000 },
    phase2: { ad_budget: 12000, cpi: 20, conv_trial: 25, conv_paid: 18, organic_growth_pct: 15 },
    phase3: { ad_budget: 30000, cpi: 15, conv_trial: 30, conv_paid: 22, organic_growth_pct: 20 },
    monthly_churn_rate: 5, annual_non_renewal: 15, trial_days: 14,
  },
  // ── FoodTech on subscription engine → Meal Kit Subscription ──
  foodtech: {
    phase1: { price_monthly: 49.99, price_annual: 479.99, cpi: 18, ad_budget: 5000, conv_trial: 8, conv_paid: 6, mix_monthly: 0.7, mix_annual: 0.3, mix_weekly: 0, cogs: 0.45, investment: 80000 },
    phase2: { ad_budget: 10000, cpi: 15, conv_trial: 12, conv_paid: 10, organic_growth_pct: 10 },
    phase3: { ad_budget: 25000, cpi: 12, conv_trial: 18, conv_paid: 15, organic_growth_pct: 15 },
    monthly_churn_rate: 12, annual_non_renewal: 35, trial_days: 0,
  },
  // ── TravelTech on subscription engine → Travel Membership ──
  traveltech: {
    phase1: { price_monthly: 19.99, price_annual: 199.99, cpi: 15, ad_budget: 4000, conv_trial: 12, conv_paid: 8, mix_monthly: 0.3, mix_annual: 0.7, mix_weekly: 0, cogs: 0.1, investment: 80000 },
    phase2: { ad_budget: 8000, cpi: 12, conv_trial: 18, conv_paid: 12, organic_growth_pct: 12 },
    phase3: { ad_budget: 20000, cpi: 10, conv_trial: 22, conv_paid: 16, organic_growth_pct: 18 },
    monthly_churn_rate: 8, annual_non_renewal: 25, trial_days: 7,
  },
  // ── HealthTech on subscription engine → Patient Subscription ──
  healthtech: {
    phase1: { price_monthly: 39.99, price_annual: 399.99, cpi: 20, ad_budget: 4000, conv_trial: 10, conv_paid: 8, mix_monthly: 0.5, mix_annual: 0.5, mix_weekly: 0, cogs: 0.08, investment: 100000 },
    phase2: { ad_budget: 8000, cpi: 16, conv_trial: 15, conv_paid: 12, organic_growth_pct: 10 },
    phase3: { ad_budget: 20000, cpi: 12, conv_trial: 20, conv_paid: 18, organic_growth_pct: 15 },
    monthly_churn_rate: 6, annual_non_renewal: 18, trial_days: 7,
  },
  // ── EdTech on subscription engine → Student Subscription ──
  edtech: {
    phase1: { price_monthly: 14.99, price_annual: 119.99, cpi: 10, ad_budget: 3000, conv_trial: 15, conv_paid: 10, mix_monthly: 0.4, mix_annual: 0.6, mix_weekly: 0, cogs: 0.05, investment: 60000 },
    phase2: { ad_budget: 6000, cpi: 8, conv_trial: 20, conv_paid: 15, organic_growth_pct: 15 },
    phase3: { ad_budget: 15000, cpi: 6, conv_trial: 25, conv_paid: 20, organic_growth_pct: 20 },
    monthly_churn_rate: 7, annual_non_renewal: 20, trial_days: 7,
  },
  // ── AI/ML on subscription engine → API Subscription ──
  "ai-ml": {
    phase1: { price_monthly: 49, price_annual: 490, cpi: 30, ad_budget: 5000, conv_trial: 15, conv_paid: 10, mix_monthly: 0.4, mix_annual: 0.6, mix_weekly: 0, cogs: 0.2, investment: 150000 },
    phase2: { ad_budget: 12000, cpi: 25, conv_trial: 20, conv_paid: 15, organic_growth_pct: 15 },
    phase3: { ad_budget: 30000, cpi: 20, conv_trial: 25, conv_paid: 20, organic_growth_pct: 20 },
    monthly_churn_rate: 5, annual_non_renewal: 12, trial_days: 14,
  },
};

const SUB_INDUSTRY: Record<string, SubPreset> = {
  // subscription industries
  "Fitness & Wellness": {
    phase1: { price_monthly: 12.99, price_annual: 79.99, cpi: 6, investment: 80000 },
    phase2: { ad_budget: 6000, cpi: 5.5, organic_growth_pct: 15 },
    monthly_churn_rate: 12, annual_non_renewal: 25,
  },
  "Entertainment & Media": {
    phase1: { price_monthly: 6.99, price_annual: 39.99, cpi: 4, investment: 120000 },
    phase2: { ad_budget: 10000, cpi: 3.5, conv_trial: 30 },
    phase3: { ad_budget: 250000 },
    monthly_churn_rate: 8, annual_non_renewal: 20,
  },
  "Productivity": {
    phase1: { price_monthly: 9.99, price_annual: 59.99, cpi: 8, investment: 100000 },
    phase2: { ad_budget: 4000, organic_growth_pct: 15, conv_paid: 25 },
    monthly_churn_rate: 6, annual_non_renewal: 18, trial_days: 14,
  },
  "Dating & Social": {
    phase1: { price_monthly: 7.99, price_annual: 49.99, cpi: 3, investment: 150000 },
    phase2: { ad_budget: 15000, cpi: 2.5, conv_trial: 15, conv_paid: 10 },
    phase3: { ad_budget: 300000, organic_growth_pct: 25 },
    monthly_churn_rate: 15, weekly_cancel_rate: 20,
  },
  "Education": {
    phase1: { price_monthly: 14.99, price_annual: 89.99, cpi: 10, investment: 80000 },
    phase2: { ad_budget: 3000, organic_growth_pct: 12, conv_paid: 30 },
    monthly_churn_rate: 7, annual_non_renewal: 15, trial_days: 14,
  },
  "Finance & Budget": {
    phase1: { price_monthly: 11.99, price_annual: 69.99, cpi: 12, investment: 90000 },
    phase2: { ad_budget: 5000, conv_trial: 18, conv_paid: 22 },
    monthly_churn_rate: 5, annual_non_renewal: 12,
  },
  // gametech industries
  "Mobile games": {
    phase1: { cpi: 2, price_weekly: 1.99, price_monthly: 3.99, investment: 200000 },
    phase2: { ad_budget: 20000, cpi: 1.5 },
    phase3: { ad_budget: 500000 },
    weekly_cancel_rate: 30, monthly_churn_rate: 20,
  },
  "PC / Console": {
    phase1: { cpi: 15, price_monthly: 9.99, price_annual: 59.99, investment: 300000, mix_weekly: 0, mix_monthly: 0.6, mix_annual: 0.4 },
    phase2: { ad_budget: 10000, cpi: 12 },
    monthly_churn_rate: 8,
  },
  "Casual / Hyper-casual": {
    phase1: { cpi: 0.5, price_weekly: 0.99, price_monthly: 2.99, investment: 50000 },
    phase2: { ad_budget: 30000, cpi: 0.3 },
    phase3: { ad_budget: 800000 },
    weekly_cancel_rate: 40, monthly_churn_rate: 25,
  },
  "Esports": {
    phase1: { cpi: 8, price_monthly: 7.99, investment: 150000 },
    phase2: { ad_budget: 8000, organic_growth_pct: 20 },
    monthly_churn_rate: 10,
  },
  "Game tools": {
    phase1: { cpi: 10, price_monthly: 14.99, price_annual: 99.99, investment: 100000, mix_weekly: 0, mix_monthly: 0.4, mix_annual: 0.6 },
    phase2: { ad_budget: 3000, organic_growth_pct: 15 },
    monthly_churn_rate: 5,
  },
  "VR / AR": {
    phase1: { cpi: 20, price_monthly: 9.99, investment: 250000 },
    phase2: { ad_budget: 5000, cpi: 15 },
    monthly_churn_rate: 12,
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   ECOMMERCE ENGINE PRESETS  (ecommerce, marketplace, foodtech, traveltech, proptech)
   ═══════════════════════════════════════════════════════════════════════ */

type EcomPreset = DeepPartial<EcomConfig>;

const ECOM_BASE: Record<string, EcomPreset> = {
  // ── E-Commerce — default engine ──
  ecommerce: {},
  // ── Marketplace — default engine ──
  marketplace: {
    phase1: { avg_order_value: 35, cogs_pct: 15, cpc: 1.5, repeat_purchase_rate: 15 },
    phase2: { avg_order_value: 40, cogs_pct: 12, organic_pct: 25, repeat_purchase_rate: 25 },
    phase3: { avg_order_value: 45, cogs_pct: 10, organic_pct: 35, repeat_purchase_rate: 35 },
  },
  // ── FoodTech — default engine ──
  foodtech: {
    phase1: { avg_order_value: 28, cogs_pct: 55, cpc: 1.2, repeat_purchase_rate: 20, return_rate: 2, investment: 80000 },
    phase2: { avg_order_value: 32, cogs_pct: 50, repeat_purchase_rate: 35, orders_per_returning: 2.5, organic_pct: 15 },
    phase3: { avg_order_value: 35, cogs_pct: 45, repeat_purchase_rate: 50, orders_per_returning: 4, organic_pct: 25 },
  },
  // ── TravelTech — default engine ──
  traveltech: {
    phase1: { avg_order_value: 250, cogs_pct: 20, cpc: 3, click_to_purchase: 1, repeat_purchase_rate: 5, investment: 100000 },
    phase2: { avg_order_value: 300, cpc: 2.5, click_to_purchase: 1.5, repeat_purchase_rate: 15, organic_pct: 20 },
    phase3: { avg_order_value: 350, cpc: 2, click_to_purchase: 2, repeat_purchase_rate: 25, organic_pct: 30 },
  },
  // ── PropTech — default engine ──
  proptech: {
    phase1: { avg_order_value: 500, cogs_pct: 10, cpc: 5, click_to_purchase: 0.5, repeat_purchase_rate: 3, investment: 120000 },
    phase2: { avg_order_value: 600, cpc: 4, click_to_purchase: 1, repeat_purchase_rate: 8, organic_pct: 20 },
    phase3: { avg_order_value: 700, cpc: 3, click_to_purchase: 1.5, repeat_purchase_rate: 12, organic_pct: 35 },
  },
  // ── Subscription App on ecommerce engine → In-App Purchases ──
  subscription: {
    phase1: { avg_order_value: 4.99, cogs_pct: 30, cpc: 0.8, click_to_purchase: 2, repeat_purchase_rate: 25, return_rate: 0, investment: 80000 },
    phase2: { avg_order_value: 5.99, cpc: 0.6, click_to_purchase: 3, repeat_purchase_rate: 35, orders_per_returning: 3, organic_pct: 20 },
    phase3: { avg_order_value: 6.99, cpc: 0.5, click_to_purchase: 4, repeat_purchase_rate: 45, orders_per_returning: 4, organic_pct: 30 },
  },
  // ── GameTech on ecommerce engine → In-Game Purchases ──
  gametech: {
    phase1: { avg_order_value: 3.99, cogs_pct: 30, cpc: 0.5, click_to_purchase: 3, repeat_purchase_rate: 30, return_rate: 0, investment: 150000 },
    phase2: { avg_order_value: 4.99, cpc: 0.4, click_to_purchase: 4, repeat_purchase_rate: 40, orders_per_returning: 4, organic_pct: 20 },
    phase3: { avg_order_value: 5.99, cpc: 0.3, click_to_purchase: 5, repeat_purchase_rate: 50, orders_per_returning: 5, organic_pct: 30 },
  },
  // ── FinTech on ecommerce engine → Per Transaction ──
  fintech: {
    phase1: { avg_order_value: 150, cogs_pct: 5, cpc: 3, click_to_purchase: 1.5, repeat_purchase_rate: 30, return_rate: 1, investment: 150000 },
    phase2: { avg_order_value: 180, cpc: 2.5, click_to_purchase: 2, repeat_purchase_rate: 40, orders_per_returning: 3, organic_pct: 20 },
    phase3: { avg_order_value: 200, cpc: 2, click_to_purchase: 2.5, repeat_purchase_rate: 50, orders_per_returning: 4, organic_pct: 30 },
    misc_costs: 5000,
  },
  // ── EdTech on ecommerce engine → Course Sales ──
  edtech: {
    phase1: { avg_order_value: 49, cogs_pct: 10, cpc: 2, click_to_purchase: 2, repeat_purchase_rate: 15, return_rate: 5, investment: 50000 },
    phase2: { avg_order_value: 59, cpc: 1.5, click_to_purchase: 3, repeat_purchase_rate: 25, orders_per_returning: 2, organic_pct: 25 },
    phase3: { avg_order_value: 69, cpc: 1.2, click_to_purchase: 4, repeat_purchase_rate: 35, orders_per_returning: 2.5, organic_pct: 35 },
  },
  // ── AI/ML on ecommerce engine → Pay-per-Use ──
  "ai-ml": {
    phase1: { avg_order_value: 25, cogs_pct: 30, cpc: 2, click_to_purchase: 2, repeat_purchase_rate: 40, return_rate: 0, investment: 150000 },
    phase2: { avg_order_value: 35, cpc: 1.5, click_to_purchase: 3, repeat_purchase_rate: 55, orders_per_returning: 4, organic_pct: 20 },
    phase3: { avg_order_value: 45, cpc: 1.2, click_to_purchase: 4, repeat_purchase_rate: 65, orders_per_returning: 6, organic_pct: 30 },
    misc_costs: 5000,
  },
};

const ECOM_INDUSTRY: Record<string, EcomPreset> = {
  // ecommerce industries
  "Fashion & Apparel": {
    phase1: { avg_order_value: 65, cogs_pct: 55, return_rate: 15, cpc: 1.8 },
    phase2: { avg_order_value: 70, repeat_purchase_rate: 25 },
    phase3: { avg_order_value: 75, repeat_purchase_rate: 35 },
  },
  "Beauty & Wellness": {
    phase1: { avg_order_value: 38, cogs_pct: 40, return_rate: 3, cpc: 1.2 },
    phase2: { avg_order_value: 42, repeat_purchase_rate: 30, orders_per_returning: 2 },
    phase3: { avg_order_value: 48, repeat_purchase_rate: 40, orders_per_returning: 3 },
  },
  "Food & Beverage": {
    phase1: { avg_order_value: 30, cogs_pct: 50, return_rate: 2, cpc: 0.8 },
    phase2: { avg_order_value: 35, repeat_purchase_rate: 35, orders_per_returning: 3 },
    phase3: { avg_order_value: 38, repeat_purchase_rate: 50, orders_per_returning: 4 },
  },
  "Home & Living": {
    phase1: { avg_order_value: 120, cogs_pct: 50, return_rate: 8, cpc: 2.5 },
    phase2: { avg_order_value: 130, repeat_purchase_rate: 12 },
    phase3: { avg_order_value: 140, repeat_purchase_rate: 18 },
  },
  "Sports & Fitness": {
    phase1: { avg_order_value: 55, cogs_pct: 45, return_rate: 6, cpc: 1.5 },
    phase2: { avg_order_value: 60, repeat_purchase_rate: 25 },
    phase3: { avg_order_value: 65, repeat_purchase_rate: 35 },
  },
  "Digital products": {
    phase1: { avg_order_value: 25, cogs_pct: 5, return_rate: 0, cpc: 1 },
    phase2: { avg_order_value: 30, repeat_purchase_rate: 15 },
    phase3: { avg_order_value: 35, repeat_purchase_rate: 25, organic_pct: 35 },
  },
  // marketplace industries
  "Services": { phase1: { avg_order_value: 60, cogs_pct: 15 }, phase2: { repeat_purchase_rate: 30 } },
  "Rentals": { phase1: { avg_order_value: 150, cogs_pct: 10 }, phase2: { repeat_purchase_rate: 20 } },
  "Freelance": { phase1: { avg_order_value: 80, cogs_pct: 12 }, phase2: { repeat_purchase_rate: 35, organic_pct: 25 } },
  "Handmade / Crafts": { phase1: { avg_order_value: 40, cogs_pct: 18, cpc: 0.8 }, phase2: { repeat_purchase_rate: 20 } },
  "Local delivery": { phase1: { avg_order_value: 25, cogs_pct: 20, cpc: 0.5 }, phase2: { repeat_purchase_rate: 40, orders_per_returning: 3 } },
  "B2B wholesale": { phase1: { avg_order_value: 500, cogs_pct: 8, cpc: 5 }, phase2: { repeat_purchase_rate: 50, orders_per_returning: 2 } },
  // foodtech industries
  "Restaurant delivery": { phase1: { avg_order_value: 25, cogs_pct: 60 }, phase2: { repeat_purchase_rate: 40, orders_per_returning: 3 } },
  "Grocery": { phase1: { avg_order_value: 45, cogs_pct: 55 }, phase2: { repeat_purchase_rate: 50, orders_per_returning: 4 } },
  "Meal kits": { phase1: { avg_order_value: 55, cogs_pct: 50 }, phase2: { repeat_purchase_rate: 35, orders_per_returning: 3 } },
  "Cloud kitchen": { phase1: { avg_order_value: 22, cogs_pct: 45, investment: 120000 }, phase2: { repeat_purchase_rate: 45, orders_per_returning: 4 } },
  "Food marketplace": { phase1: { avg_order_value: 30, cogs_pct: 15 }, phase2: { repeat_purchase_rate: 30, organic_pct: 20 } },
  "Catering": { phase1: { avg_order_value: 300, cogs_pct: 45, cpc: 4 }, phase2: { repeat_purchase_rate: 25 } },
  // traveltech industries
  "Accommodation": { phase1: { avg_order_value: 200, cpc: 2.5 }, phase2: { repeat_purchase_rate: 15 } },
  "Flights": { phase1: { avg_order_value: 400, cogs_pct: 5, cpc: 3 }, phase2: { repeat_purchase_rate: 20 } },
  "Tours & Experiences": { phase1: { avg_order_value: 80, cpc: 1.5 }, phase2: { repeat_purchase_rate: 10, organic_pct: 25 } },
  "Car rental": { phase1: { avg_order_value: 150, cpc: 2 }, phase2: { repeat_purchase_rate: 20 } },
  "Business travel": { phase1: { avg_order_value: 600, cogs_pct: 8, cpc: 5 }, phase2: { repeat_purchase_rate: 40 } },
  "Travel planning": { phase1: { avg_order_value: 50, cogs_pct: 10, cpc: 1 }, phase2: { organic_pct: 30 } },
  // proptech industries
  "Listings & search": { phase1: { avg_order_value: 300, cogs_pct: 5 }, phase2: { organic_pct: 30 } },
  "Property management": { phase1: { avg_order_value: 200, repeat_purchase_rate: 10 }, phase2: { repeat_purchase_rate: 30 } },
  "Construction tech": { phase1: { avg_order_value: 1000, cogs_pct: 15, cpc: 8 }, phase2: { repeat_purchase_rate: 20 } },
  "Mortgage / Lending": { phase1: { avg_order_value: 800, cogs_pct: 5, cpc: 10 } },
  "Smart home": { phase1: { avg_order_value: 150, cogs_pct: 40, cpc: 3 }, phase2: { repeat_purchase_rate: 15 } },
  "Co-working": { phase1: { avg_order_value: 250, cogs_pct: 30, cpc: 2 }, phase2: { repeat_purchase_rate: 50, orders_per_returning: 2 } },
};

/* ═══════════════════════════════════════════════════════════════════════
   SAAS ENGINE PRESETS  (saas, fintech, healthtech, edtech, ai-ml)
   ═══════════════════════════════════════════════════════════════════════ */

type SaasPreset = DeepPartial<SaasConfig>;

const SAAS_BASE: Record<string, SaasPreset> = {
  // ── SaaS B2B — default engine ──
  saas: {},
  // ── FinTech — default engine ──
  fintech: {
    phase1: { price_per_seat: 59, cpl: 300, lead_to_demo: 15, demo_to_close: 10, cogs_per_seat: 10, investment: 200000 },
    phase2: { price_per_seat: 69, cpl: 250, lead_to_demo: 20, demo_to_close: 15, expansion_rate: 4 },
    phase3: { price_per_seat: 79, cpl: 200, lead_to_demo: 25, demo_to_close: 20, expansion_rate: 6 },
    misc_costs: 5000,
  },
  // ── HealthTech — default engine ──
  healthtech: {
    phase1: { price_per_seat: 49, cpl: 350, lead_to_demo: 12, demo_to_close: 8, sales_cycle_months: 3, cogs_per_seat: 8, investment: 150000 },
    phase2: { price_per_seat: 59, cpl: 280, lead_to_demo: 18, demo_to_close: 12, expansion_rate: 2 },
    phase3: { price_per_seat: 69, cpl: 220, lead_to_demo: 25, demo_to_close: 18, expansion_rate: 4 },
    misc_costs: 8000,
  },
  // ── EdTech — default engine ──
  edtech: {
    phase1: { price_per_seat: 19, seats_per_account: 10, cpl: 100, lead_to_demo: 25, demo_to_close: 20, cogs_per_seat: 3, investment: 80000 },
    phase2: { price_per_seat: 25, seats_per_account: 15, cpl: 80, lead_to_demo: 30, demo_to_close: 25, expansion_rate: 5 },
    phase3: { price_per_seat: 29, seats_per_account: 25, cpl: 60, lead_to_demo: 35, demo_to_close: 30, expansion_rate: 8 },
  },
  // ── AI/ML — default engine ──
  "ai-ml": {
    phase1: { price_per_seat: 79, seats_per_account: 2, cpl: 250, lead_to_demo: 20, demo_to_close: 12, cogs_per_seat: 15, investment: 200000 },
    phase2: { price_per_seat: 99, seats_per_account: 4, cpl: 200, lead_to_demo: 25, demo_to_close: 18, expansion_rate: 5 },
    phase3: { price_per_seat: 99, seats_per_account: 6, cpl: 150, lead_to_demo: 30, demo_to_close: 25, expansion_rate: 8 },
    misc_costs: 6000,
  },
  // ── Marketplace on SaaS engine → Platform SaaS ──
  marketplace: {
    phase1: { price_per_seat: 29, seats_per_account: 3, cpl: 150, lead_to_demo: 20, demo_to_close: 15, cogs_per_seat: 5, investment: 120000 },
    phase2: { price_per_seat: 39, seats_per_account: 5, cpl: 120, lead_to_demo: 25, demo_to_close: 20, expansion_rate: 5 },
    phase3: { price_per_seat: 49, seats_per_account: 8, cpl: 90, lead_to_demo: 30, demo_to_close: 25, expansion_rate: 7 },
    misc_costs: 4000,
  },
  // ── PropTech on SaaS engine → Property Management SaaS ──
  proptech: {
    phase1: { price_per_seat: 39, seats_per_account: 5, cpl: 200, lead_to_demo: 18, demo_to_close: 12, sales_cycle_months: 2, cogs_per_seat: 5, investment: 100000 },
    phase2: { price_per_seat: 49, seats_per_account: 8, cpl: 160, lead_to_demo: 22, demo_to_close: 18, expansion_rate: 4 },
    phase3: { price_per_seat: 59, seats_per_account: 12, cpl: 120, lead_to_demo: 28, demo_to_close: 22, expansion_rate: 6 },
    misc_costs: 5000,
  },
};

const SAAS_INDUSTRY: Record<string, SaasPreset> = {
  // saas industries
  "Marketing & Sales tools": {
    phase1: { price_per_seat: 29, cpl: 150, lead_to_demo: 25, demo_to_close: 20 },
    phase2: { expansion_rate: 4, organic_leads_pct: 25 },
  },
  "Productivity / Workflow": {
    phase1: { price_per_seat: 15, seats_per_account: 8, cpl: 80, lead_to_demo: 30 },
    phase2: { expansion_rate: 6, logo_churn_rate: 1.5 },
  },
  "Finance & Accounting": {
    phase1: { price_per_seat: 49, cpl: 250, demo_to_close: 12, sales_cycle_months: 3 },
    phase2: { expansion_rate: 2, logo_churn_rate: 1.5 },
  },
  "Developer tools": {
    phase1: { price_per_seat: 19, seats_per_account: 5, cpl: 60, organic_leads_pct: 30 },
    phase2: { expansion_rate: 5, organic_leads_pct: 40, logo_churn_rate: 2 },
  },
  "HR & People": {
    phase1: { price_per_seat: 8, seats_per_account: 20, cpl: 200, demo_to_close: 15 },
    phase2: { expansion_rate: 3, seats_per_account: 30 },
  },
  "Healthcare / MedTech": {
    phase1: { price_per_seat: 59, cpl: 400, sales_cycle_months: 3, demo_to_close: 8 },
    phase2: { expansion_rate: 2, logo_churn_rate: 1 },
    misc_costs: 8000,
  },
  // fintech industries
  "Payments": { phase1: { price_per_seat: 39, cpl: 200 }, phase2: { expansion_rate: 5 } },
  "Lending": { phase1: { price_per_seat: 79, cpl: 350, sales_cycle_months: 3 }, misc_costs: 10000 },
  "Insurance": { phase1: { price_per_seat: 69, cpl: 400, sales_cycle_months: 3 }, misc_costs: 8000 },
  "Investment": { phase1: { price_per_seat: 99, cpl: 300 }, misc_costs: 7000 },
  "Neobanking": { phase1: { price_per_seat: 29, cpl: 500, investment: 300000 }, misc_costs: 15000 },
  "Crypto / DeFi": { phase1: { price_per_seat: 49, cpl: 150, organic_leads_pct: 25 } },
  // healthtech industries
  "Telemedicine": { phase1: { price_per_seat: 59, cpl: 300 }, misc_costs: 10000 },
  "Mental health": { phase1: { price_per_seat: 39, cpl: 200, organic_leads_pct: 20 } },
  "Fitness tracking": { phase1: { price_per_seat: 19, cpl: 100 }, phase2: { expansion_rate: 3 } },
  "Clinical trials": { phase1: { price_per_seat: 149, cpl: 500, sales_cycle_months: 4 }, misc_costs: 15000 },
  "EHR / EMR": { phase1: { price_per_seat: 79, cpl: 400, sales_cycle_months: 4 }, misc_costs: 12000 },
  "Wellness": { phase1: { price_per_seat: 29, cpl: 120, organic_leads_pct: 20 } },
  // edtech industries
  "K-12": { phase1: { price_per_seat: 8, seats_per_account: 30, cpl: 150, sales_cycle_months: 3 } },
  "Higher education": { phase1: { price_per_seat: 15, seats_per_account: 50, cpl: 200, sales_cycle_months: 4 } },
  "Corporate training": { phase1: { price_per_seat: 25, seats_per_account: 20, cpl: 180, demo_to_close: 20 } },
  "Language learning": { phase1: { price_per_seat: 12, cpl: 60, organic_leads_pct: 25 }, phase2: { expansion_rate: 4 } },
  "Test prep": { phase1: { price_per_seat: 19, cpl: 80, organic_leads_pct: 20 } },
  "Skills / Bootcamp": { phase1: { price_per_seat: 39, cpl: 100 }, phase2: { expansion_rate: 5, organic_leads_pct: 30 } },
  // ai-ml industries
  "API / Platform": { phase1: { price_per_seat: 99, cpl: 200, organic_leads_pct: 20 }, phase2: { expansion_rate: 6 } },
  "Enterprise AI": { phase1: { price_per_seat: 149, cpl: 400, sales_cycle_months: 3 }, misc_costs: 10000 },
  "Computer vision": { phase1: { price_per_seat: 89, cpl: 300, cogs_per_seat: 20 } },
  "NLP / LLM": { phase1: { price_per_seat: 79, cpl: 200, cogs_per_seat: 18 }, phase2: { expansion_rate: 5 } },
  "Data analytics": { phase1: { price_per_seat: 59, cpl: 180, seats_per_account: 5 }, phase2: { expansion_rate: 4 } },
  "AI agents": { phase1: { price_per_seat: 99, cpl: 150, organic_leads_pct: 25, cogs_per_seat: 20 }, phase2: { expansion_rate: 6 } },
};

/* ═══════════════════════════════════════════════════════════════════════
   STAGE & BUDGET MODIFIERS
   ═══════════════════════════════════════════════════════════════════════ */

interface StageModifier {
  investmentMult: number;
  phase1Dur: number;
  phase2Dur: number;
  adBudgetMult: number;
  organicBoost: number;
}

const STAGE_MODIFIERS: Record<string, StageModifier> = {
  idea:     { investmentMult: 1.0,  phase1Dur: 4, phase2Dur: 4, adBudgetMult: 0.5, organicBoost: 0 },
  building: { investmentMult: 0.8,  phase1Dur: 3, phase2Dur: 4, adBudgetMult: 0.7, organicBoost: 0 },
  launched: { investmentMult: 0.6,  phase1Dur: 2, phase2Dur: 3, adBudgetMult: 1.0, organicBoost: 5 },
  growing:  { investmentMult: 0.4,  phase1Dur: 1, phase2Dur: 3, adBudgetMult: 1.5, organicBoost: 10 },
};

function budgetToInvestment(budget: string): number | null {
  if (budget.includes("Bootstrapping")) return 5000;
  if (budget.includes("Under $500")) return 500;
  if (budget.includes("$500")) return 1500;
  if (budget.includes("$2,000")) return 5000;
  if (budget.includes("$10,000")) return 25000;
  if (budget.includes("$50,000")) return 75000;
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════════════ */

export interface PresetInput {
  productType: string;
  industry: string;
  stage?: string | null;
  budget?: string | null;
  /** Override engine (defaults to model's baseEngine) */
  engine?: BaseEngine | null;
}

/**
 * Returns a fully-merged config for the given product type and industry.
 * Engine defaults → product type base → industry specifics → stage/budget adjustments.
 */
/**
 * Returns the base default config for a model+engine combo (no industry/stage adjustments).
 * Used when user switches engine in the dashboard.
 */
export function getModelEngineDefaults(productType: string, engine: BaseEngine): ModelConfig | EcomConfig | SaasConfig {
  return getModelDefaults(productType as ProductType, engine);
}

export function getPresetConfig(input: PresetInput): ModelConfig | EcomConfig | SaasConfig {
  const engine = input.engine ?? getBaseEngine(input.productType);
  const stage = STAGE_MODIFIERS[input.stage ?? "idea"] ?? STAGE_MODIFIERS.idea;
  const budgetInv = budgetToInvestment(input.budget ?? "");

  if (engine === "subscription") {
    let config = getModelDefaults(input.productType as ProductType, engine) as ModelConfig;
    // Apply industry overrides on top of model defaults
    const ind = SUB_INDUSTRY[input.industry];
    if (ind) config = deepMerge<ModelConfig>(config, ind);
    // Apply stage
    config.phase1_dur = stage.phase1Dur;
    config.phase2_dur = stage.phase2Dur;
    if (budgetInv !== null) {
      config.phase1.investment = budgetInv;
    } else {
      config.phase1.investment = Math.round(config.phase1.investment * stage.investmentMult);
    }
    config.phase2.ad_budget = Math.round(config.phase2.ad_budget * stage.adBudgetMult);
    config.phase3.ad_budget = Math.round(config.phase3.ad_budget * stage.adBudgetMult);
    config.phase2.organic_growth_pct += stage.organicBoost;
    config.phase3.organic_growth_pct += stage.organicBoost;
    return config;
  }

  if (engine === "ecommerce") {
    let config = getModelDefaults(input.productType as ProductType, engine) as EcomConfig;
    const ind = ECOM_INDUSTRY[input.industry];
    if (ind) config = deepMerge<EcomConfig>(config, ind);
    config.phase1_dur = stage.phase1Dur;
    config.phase2_dur = Math.min(stage.phase2Dur + 2, 9); // ecom needs longer phase 2
    if (budgetInv !== null) {
      config.phase1.investment = budgetInv;
    } else {
      config.phase1.investment = Math.round(config.phase1.investment * stage.investmentMult);
    }
    config.phase2.ad_budget = Math.round(config.phase2.ad_budget * stage.adBudgetMult);
    config.phase3.ad_budget = Math.round(config.phase3.ad_budget * stage.adBudgetMult);
    return config;
  }

  // saas engine
  let config = getModelDefaults(input.productType as ProductType, engine) as SaasConfig;
  const ind = SAAS_INDUSTRY[input.industry];
  if (ind) config = deepMerge<SaasConfig>(config, ind);
  config.phase1_dur = stage.phase1Dur;
  config.phase2_dur = Math.min(stage.phase2Dur + 5, 12); // saas needs longer phase 2
  if (budgetInv !== null) {
    config.phase1.investment = budgetInv;
    config.investment = budgetInv;
  } else {
    config.phase1.investment = Math.round(config.phase1.investment * stage.investmentMult);
    config.investment = config.phase1.investment;
  }
  config.phase2.ad_budget = Math.round(config.phase2.ad_budget * stage.adBudgetMult);
  config.phase3.ad_budget = Math.round(config.phase3.ad_budget * stage.adBudgetMult);
  return config;
}

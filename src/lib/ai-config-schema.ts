// Machine-readable schema for all 3 model types.
// Used in AI system prompts so the model knows valid fields and ranges.

export interface FieldSchema {
  type: "number" | "boolean" | "string";
  min?: number;
  max?: number;
  default: number | boolean | string;
  desc: string;
  unit?: string;
}

export type ModelSchemaSection = Record<string, FieldSchema>;

export interface ModelSchema {
  top: ModelSchemaSection;
  phase: ModelSchemaSection;
}

// ── Subscription ──────────────────────────────────────────────
const subscriptionTop: ModelSchemaSection = {
  total_months: { type: "number", min: 12, max: 120, default: 60, desc: "Total simulation length in months" },
  phase1_dur: { type: "number", min: 1, max: 24, default: 3, desc: "Phase 1 duration (months)" },
  phase2_dur: { type: "number", min: 1, max: 24, default: 3, desc: "Phase 2 duration (months)" },
  corporate_tax: { type: "number", min: 0, max: 50, default: 1, desc: "Corporate tax rate (%)", unit: "%" },
  store_split: { type: "number", min: 0, max: 100, default: 50, desc: "Web vs App Store revenue split — % going through web", unit: "%" },
  app_store_comm: { type: "number", min: 0, max: 30, default: 15, desc: "App Store commission (%)", unit: "%" },
  web_comm_pct: { type: "number", min: 0, max: 10, default: 3.5, desc: "Web payment processor commission (%)", unit: "%" },
  web_comm_fixed: { type: "number", min: 0, max: 2, default: 0.5, desc: "Web payment processor fixed fee per transaction ($)", unit: "$" },
  bank_fee: { type: "number", min: 0, max: 5, default: 1, desc: "Bank fee (%)", unit: "%" },
  weekly_cancel_rate: { type: "number", min: 0, max: 100, default: 15, desc: "Weekly subscription cancel rate (%)", unit: "%" },
  monthly_churn_rate: { type: "number", min: 0, max: 100, default: 10, desc: "Monthly subscription churn rate (%)", unit: "%" },
  annual_non_renewal: { type: "number", min: 0, max: 100, default: 30, desc: "Annual subscription non-renewal rate (%)", unit: "%" },
  trial_days: { type: "number", min: 0, max: 30, default: 7, desc: "Free trial length (days)" },
  refund_rate: { type: "number", min: 0, max: 50, default: 2, desc: "Refund rate (%)", unit: "%" },
  upgrade_rate: { type: "number", min: 0, max: 50, default: 2, desc: "Plan upgrade rate (%)", unit: "%" },
  downgrade_rate: { type: "number", min: 0, max: 50, default: 5, desc: "Plan downgrade rate (%)", unit: "%" },
  starting_organic: { type: "number", min: 0, max: 100000, default: 0, desc: "Starting organic users count" },
};

const subscriptionPhase: ModelSchemaSection = {
  investment: { type: "number", min: 0, max: 10000000, default: 0, desc: "One-time investment in this phase ($)", unit: "$" },
  monthly_salary: { type: "number", min: 0, max: 1000000, default: 5000, desc: "Monthly salary/team costs ($)", unit: "$" },
  misc_total: { type: "number", min: 0, max: 1000000, default: 5000, desc: "Miscellaneous monthly costs ($)", unit: "$" },
  ad_budget: { type: "number", min: 0, max: 10000000, default: 5000, desc: "Monthly ad budget ($)", unit: "$" },
  cpi: { type: "number", min: 0.1, max: 500, default: 7.5, desc: "Cost per install ($)", unit: "$" },
  conv_trial: { type: "number", min: 0, max: 100, default: 20, desc: "Paid install → trial conversion (%)", unit: "%" },
  conv_paid: { type: "number", min: 0, max: 100, default: 20, desc: "Trial → paid conversion (%)", unit: "%" },
  churn_mult: { type: "number", min: 0.1, max: 5, default: 1, desc: "Churn multiplier for this phase" },
  ad_growth_pct: { type: "number", min: 0, max: 100, default: 5, desc: "Monthly ad budget growth (%)", unit: "%" },
  cpi_degradation: { type: "number", min: 0, max: 50, default: 1, desc: "Monthly CPI degradation (%)", unit: "%" },
  organic_growth_pct: { type: "number", min: 0, max: 100, default: 10, desc: "Monthly organic user growth (%)", unit: "%" },
  organic_conv_trial: { type: "number", min: 0, max: 100, default: 25, desc: "Organic → trial conversion (%)", unit: "%" },
  organic_conv_paid: { type: "number", min: 0, max: 100, default: 25, desc: "Organic trial → paid conversion (%)", unit: "%" },
  organic_spend: { type: "number", min: 0, max: 1000000, default: 500, desc: "Monthly organic marketing spend ($)", unit: "$" },
  price_weekly: { type: "number", min: 0, max: 1000, default: 4.99, desc: "Weekly subscription price ($)", unit: "$" },
  price_monthly: { type: "number", min: 0, max: 5000, default: 7.99, desc: "Monthly subscription price ($)", unit: "$" },
  price_annual: { type: "number", min: 0, max: 50000, default: 49.99, desc: "Annual subscription price ($)", unit: "$" },
  mix_weekly: { type: "number", min: 0, max: 1, default: 0, desc: "Plan mix — weekly (0-1)" },
  mix_monthly: { type: "number", min: 0, max: 1, default: 0.48, desc: "Plan mix — monthly (0-1)" },
  mix_annual: { type: "number", min: 0, max: 1, default: 0.52, desc: "Plan mix — annual (0-1)" },
  cogs: { type: "number", min: 0, max: 1, default: 0.1, desc: "COGS as fraction of revenue (0-1)" },
};

// ── Ecommerce ─────────────────────────────────────────────────
const ecommerceTop: ModelSchemaSection = {
  total_months: { type: "number", min: 12, max: 120, default: 36, desc: "Total simulation length (months)" },
  phase1_dur: { type: "number", min: 1, max: 24, default: 3, desc: "Phase 1 duration (months)" },
  phase2_dur: { type: "number", min: 1, max: 24, default: 6, desc: "Phase 2 duration (months)" },
  misc_costs: { type: "number", min: 0, max: 1000000, default: 2000, desc: "Monthly miscellaneous costs ($)", unit: "$" },
  corporate_tax: { type: "number", min: 0, max: 50, default: 1, desc: "Corporate tax rate (%)", unit: "%" },
};

const ecommercePhase: ModelSchemaSection = {
  investment: { type: "number", min: 0, max: 10_000_000, default: 50000, desc: "Investment / funding for this phase", unit: "$" },
  avg_order_value: { type: "number", min: 1, max: 100000, default: 50, desc: "Average order value ($)", unit: "$" },
  repeat_purchase_rate: { type: "number", min: 0, max: 100, default: 20, desc: "Repeat purchase rate (%)", unit: "%" },
  orders_per_returning: { type: "number", min: 1, max: 20, default: 1.5, desc: "Orders per returning customer" },
  cogs_pct: { type: "number", min: 0, max: 100, default: 40, desc: "Cost of goods sold (%)", unit: "%" },
  return_rate: { type: "number", min: 0, max: 100, default: 5, desc: "Product return rate (%)", unit: "%" },
  ad_budget: { type: "number", min: 0, max: 10000000, default: 8000, desc: "Monthly ad budget ($)", unit: "$" },
  cpc: { type: "number", min: 0.01, max: 100, default: 1.5, desc: "Cost per click ($)", unit: "$" },
  click_to_purchase: { type: "number", min: 0, max: 100, default: 3, desc: "Click to purchase conversion (%)", unit: "%" },
  organic_pct: { type: "number", min: 0, max: 100, default: 20, desc: "Organic traffic share (%)", unit: "%" },
  discount_rate: { type: "number", min: 0, max: 100, default: 5, desc: "Average discount rate (%)", unit: "%" },
  monthly_salary: { type: "number", min: 0, max: 1000000, default: 8000, desc: "Monthly salary/team costs ($)", unit: "$" },
};

// ── SaaS ──────────────────────────────────────────────────────
const saasTop: ModelSchemaSection = {
  total_months: { type: "number", min: 12, max: 120, default: 36, desc: "Total simulation length (months)" },
  phase1_dur: { type: "number", min: 1, max: 24, default: 3, desc: "Phase 1 duration (months)" },
  phase2_dur: { type: "number", min: 1, max: 24, default: 9, desc: "Phase 2 duration (months)" },
  misc_costs: { type: "number", min: 0, max: 1000000, default: 3000, desc: "Monthly miscellaneous costs ($)", unit: "$" },
  corporate_tax: { type: "number", min: 0, max: 50, default: 1, desc: "Corporate tax rate (%)", unit: "%" },
  initial_customers: { type: "number", min: 0, max: 100000, default: 0, desc: "Starting number of customers" },
  initial_seats: { type: "number", min: 0, max: 1000000, default: 0, desc: "Starting number of seats" },
  investment: { type: "number", min: 0, max: 10000000, default: 100000, desc: "Initial investment ($)", unit: "$" },
};

const saasPhase: ModelSchemaSection = {
  investment: { type: "number", min: 0, max: 10_000_000, default: 100000, desc: "Investment / funding for this phase", unit: "$" },
  seats_per_account: { type: "number", min: 1, max: 1000, default: 5, desc: "Average seats per account" },
  price_per_seat: { type: "number", min: 1, max: 10000, default: 49, desc: "Price per seat per month ($)", unit: "$" },
  annual_contract_pct: { type: "number", min: 0, max: 100, default: 70, desc: "Annual contract share (%)", unit: "%" },
  annual_discount: { type: "number", min: 0, max: 50, default: 15, desc: "Annual billing discount (%)", unit: "%" },
  ad_budget: { type: "number", min: 0, max: 10000000, default: 8000, desc: "Monthly ad budget ($)", unit: "$" },
  cpl: { type: "number", min: 1, max: 10000, default: 150, desc: "Cost per lead ($)", unit: "$" },
  lead_to_demo: { type: "number", min: 0, max: 100, default: 30, desc: "Lead to demo conversion (%)", unit: "%" },
  demo_to_close: { type: "number", min: 0, max: 100, default: 25, desc: "Demo to close conversion (%)", unit: "%" },
  sales_cycle_months: { type: "number", min: 0, max: 12, default: 1, desc: "Average sales cycle length (months)" },
  expansion_rate: { type: "number", min: 0, max: 50, default: 3, desc: "Monthly seat expansion rate (%)", unit: "%" },
  contraction_rate: { type: "number", min: 0, max: 50, default: 1, desc: "Monthly seat contraction rate (%)", unit: "%" },
  logo_churn_rate: { type: "number", min: 0, max: 50, default: 2, desc: "Monthly logo churn rate (%)", unit: "%" },
  cogs_per_seat: { type: "number", min: 0, max: 1000, default: 5, desc: "COGS per seat per month ($)", unit: "$" },
  organic_leads_pct: { type: "number", min: 0, max: 100, default: 20, desc: "Organic leads share (%)", unit: "%" },
  monthly_salary: { type: "number", min: 0, max: 1000000, default: 20000, desc: "Monthly salary/team costs ($)", unit: "$" },
};

// ── Export ─────────────────────────────────────────────────────
export const CONFIG_SCHEMAS: Record<string, ModelSchema> = {
  subscription: { top: subscriptionTop, phase: subscriptionPhase },
  ecommerce: { top: ecommerceTop, phase: ecommercePhase },
  saas: { top: saasTop, phase: saasPhase },
};

/**
 * Build a formatted string describing all config fields for a model type.
 * Used inside AI system prompts so the model knows what it can configure.
 */
export function buildConfigSchemaPrompt(modelType: string): string {
  const schema = CONFIG_SCHEMAS[modelType];
  if (!schema) return "";

  const formatSection = (title: string, fields: ModelSchemaSection): string => {
    const lines = Object.entries(fields).map(([key, f]) => {
      const range = f.type === "number" ? ` [${f.min}–${f.max}]` : "";
      const unit = f.unit ? ` (${f.unit})` : "";
      return `  - ${key}${unit}: ${f.desc}${range}, default: ${f.default}`;
    });
    return `${title}:\n${lines.join("\n")}`;
  };

  return [
    `## ${modelType.toUpperCase()} model configurable fields`,
    "",
    formatSection("Top-level parameters (apply to the whole model)", schema.top),
    "",
    formatSection("Per-phase parameters (apply to phase 1, 2, or 3 independently)", schema.phase),
  ].join("\n");
}

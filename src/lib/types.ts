// Mirrors Python ModelConfig / EcomConfig dataclasses

export interface PhaseConfig {
  investment: number;
  monthly_salary: number;
  misc_total: number;
  ad_budget: number;
  cpi: number;
  conv_trial: number;
  conv_paid: number;
  churn_mult: number;
  ad_growth_mode: "Percentage (%)" | "Absolute ($)";
  ad_growth_pct: number;
  ad_growth_abs: number;
  cpi_degradation: number;
  organic_growth_mode: "Percentage (%)" | "Absolute ($)";
  organic_growth_pct: number;
  organic_growth_abs: number;
  organic_conv_trial: number;
  organic_conv_paid: number;
  organic_spend: number;
  price_weekly: number;
  price_monthly: number;
  price_annual: number;
  mix_weekly: number;
  mix_monthly: number;
  mix_annual: number;
  cogs: number;
}

export interface ModelConfig {
  total_months: number;
  phase1_dur: number;
  phase2_dur: number;
  sens_conv: number;
  sens_churn: number;
  sens_cpi: number;
  sens_organic: number;
  scenario_bound: number;
  mc_enabled: boolean;
  mc_iterations: number;
  mc_variance: number;
  corporate_tax: number;
  store_split: number;
  app_store_comm: number;
  web_comm_pct: number;
  web_comm_fixed: number;
  bank_fee: number;
  weekly_cancel_rate: number;
  monthly_churn_rate: number;
  annual_non_renewal: number;
  trial_days: number;
  refund_rate: number;
  upgrade_rate: number;
  downgrade_rate: number;
  starting_organic: number;
  phase1: PhaseConfig;
  phase2: PhaseConfig;
  phase3: PhaseConfig;
}

export interface EcomPhaseConfig {
  avg_order_value: number;
  repeat_purchase_rate: number;
  orders_per_returning: number;
  cogs_pct: number;
  return_rate: number;
  ad_budget: number;
  cpc: number;
  click_to_purchase: number;
  organic_pct: number;
  discount_rate: number;
  monthly_salary: number;
}

export interface EcomConfig {
  product_type: "ecommerce";
  total_months: number;
  phase1_dur: number;
  phase2_dur: number;
  phase1: EcomPhaseConfig;
  phase2: EcomPhaseConfig;
  phase3: EcomPhaseConfig;
  misc_costs: number;
  corporate_tax: number;
  sens_conv: number;
  sens_cpc: number;
  sens_aov: number;
  sens_organic: number;
  scenario_bound: number;
  mc_enabled: boolean;
  mc_iterations: number;
  mc_variance: number;
}

export interface SaasPhaseConfig {
  seats_per_account: number;
  price_per_seat: number;
  annual_contract_pct: number;
  annual_discount: number;
  ad_budget: number;
  cpl: number;
  lead_to_demo: number;
  demo_to_close: number;
  sales_cycle_months: number;
  expansion_rate: number;
  contraction_rate: number;
  logo_churn_rate: number;
  cogs_per_seat: number;
  organic_leads_pct: number;
  monthly_salary: number;
}

export interface SaasConfig {
  product_type: "saas";
  total_months: number;
  phase1_dur: number;
  phase2_dur: number;
  phase1: SaasPhaseConfig;
  phase2: SaasPhaseConfig;
  phase3: SaasPhaseConfig;
  misc_costs: number;
  corporate_tax: number;
  initial_customers: number;
  initial_seats: number;
  investment: number;
  sens_conv: number;
  sens_churn: number;
  sens_expansion: number;
  sens_organic: number;
  scenario_bound: number;
  mc_enabled: boolean;
  mc_iterations: number;
  mc_variance: number;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  product_type: "subscription" | "ecommerce" | "saas";
  created_at: string;
  public_token?: string;
  is_public?: boolean;
}

export interface Scenario {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  notes: string;
  config: ModelConfig | EcomConfig | SaasConfig;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  username: string;
  telegram: string;
  company_name: string;
  company_address: string;
  tax_id: string;
  bank_details: string;
  lemon_squeezy_customer_id?: string;
  lemon_squeezy_subscription_id?: string;
  subscription_status?: string;
  plan: "free" | "expired" | "plus" | "pro" | "enterprise";
  ai_chat_count: number;
  ai_report_count: number;
  ai_voice_seconds: number;
  ai_period_start: string;
  created_at: string;
}

export interface ProjectShare {
  id: string;
  project_id: string;
  owner_id: string;
  shared_with_id: string;
  role: "viewer" | "editor";
  created_at: string;
}

export type InvoiceStatus = "paid" | "scheduled" | "unpaid";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string;
  created_at: string;
}

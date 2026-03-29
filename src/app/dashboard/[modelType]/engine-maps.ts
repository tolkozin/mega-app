import type { BaseEngine } from "@/lib/model-registry";
import { useConfigStore } from "@/stores/config-store";

import { Sidebar } from "@/components/layout/Sidebar";
import { EcomSidebar } from "@/components/layout/EcomSidebar";
import { SaasSidebar } from "@/components/layout/SaasSidebar";

export const ENGINE_SIDEBAR: Record<BaseEngine, React.ComponentType<{ projectId: string | null; onProjectCreated: (id: string) => void; monthRange?: [number, number] | null; productType?: string }>> = {
  subscription: Sidebar,
  ecommerce: EcomSidebar,
  saas: SaasSidebar,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getConfigSelector(engine: BaseEngine): (s: any) => any {
  const selectors = {
    subscription: (s: ReturnType<typeof useConfigStore.getState>) => s.subscriptionConfig,
    ecommerce: (s: ReturnType<typeof useConfigStore.getState>) => s.ecommerceConfig,
    saas: (s: ReturnType<typeof useConfigStore.getState>) => s.saasConfig,
  };
  return selectors[engine];
}

export const AI_CONTEXT_KEYS: Record<BaseEngine, string[]> = {
  subscription: ["Month", "Product Phase", "Total MRR", "Total Gross Revenue", "Net Revenue", "Net Profit", "EBITDA", "Total Active Users", "Blended CAC", "LTV", "LTV/CAC", "ARPU", "Gross Margin %", "ROI %", "Cash Balance", "Cumulative Net Profit", "Burn Rate", "Runway (Months)", "Cumulative ROAS"],
  ecommerce: ["Month", "Gross Revenue", "Net Revenue", "Net Profit", "EBITDA", "New Customers", "Returning Customers", "Total Orders", "AOV", "CAC", "LTV", "LTV/CAC", "Gross Margin %", "ROI %", "Cash Balance", "Cumulative Net Profit", "Ad Spend", "ROAS"],
  saas: ["Month", "ARR", "MRR", "Net Revenue", "Net Profit", "EBITDA", "Total Customers", "Total Seats", "NRR %", "Logo Churn %", "CAC", "LTV", "LTV/CAC", "Gross Margin %", "ROI %", "Cash Balance", "Cumulative Net Profit", "Quick Ratio", "Rule of 40", "Magic Number"],
};

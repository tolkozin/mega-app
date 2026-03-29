import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModelConfig, PhaseConfig, EcomConfig, EcomPhaseConfig, SaasConfig, SaasPhaseConfig } from "@/lib/types";
import { getSubscriptionDefaults, getEcommerceDefaults, getSaasDefaults } from "@/lib/model-defaults";

// Default configs use realistic benchmarks from model-defaults.ts
// These are the "Mobile App / subscription" defaults — the most common starting point
export const defaultModelConfig: ModelConfig = getSubscriptionDefaults("subscription");
export const defaultEcomConfig: EcomConfig = getEcommerceDefaults("ecommerce");
export const defaultSaasConfig: SaasConfig = getSaasDefaults("saas");

interface ConfigStore {
  subscriptionConfig: ModelConfig;
  ecommerceConfig: EcomConfig;
  setSubscriptionConfig: (config: Partial<ModelConfig>) => void;
  setEcommerceConfig: (config: Partial<EcomConfig>) => void;
  setSubscriptionPhase: (phase: 1 | 2 | 3, config: Partial<PhaseConfig>) => void;
  setEcommercePhase: (phase: 1 | 2 | 3, config: Partial<EcomPhaseConfig>) => void;
  setSubscriptionPhaseAll: (config: Partial<PhaseConfig>) => void;
  setEcommercePhaseAll: (config: Partial<EcomPhaseConfig>) => void;
  loadSubscriptionConfig: (config: ModelConfig) => void;
  loadEcommerceConfig: (config: EcomConfig) => void;
  resetSubscription: () => void;
  resetEcommerce: () => void;
  saasConfig: SaasConfig;
  setSaasConfig: (config: Partial<SaasConfig>) => void;
  setSaasPhase: (phase: 1 | 2 | 3, config: Partial<SaasPhaseConfig>) => void;
  setSaasPhaseAll: (config: Partial<SaasPhaseConfig>) => void;
  loadSaasConfig: (config: SaasConfig) => void;
  resetSaas: () => void;
  customizePerPhase: boolean;
  setCustomizePerPhase: (v: boolean) => void;
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

      setSubscriptionPhaseAll: (partial) =>
        set((state) => ({
          subscriptionConfig: {
            ...state.subscriptionConfig,
            phase1: { ...state.subscriptionConfig.phase1, ...partial },
            phase2: { ...state.subscriptionConfig.phase2, ...partial },
            phase3: { ...state.subscriptionConfig.phase3, ...partial },
          },
        })),

      setEcommercePhaseAll: (partial) =>
        set((state) => ({
          ecommerceConfig: {
            ...state.ecommerceConfig,
            phase1: { ...state.ecommerceConfig.phase1, ...partial },
            phase2: { ...state.ecommerceConfig.phase2, ...partial },
            phase3: { ...state.ecommerceConfig.phase3, ...partial },
          },
        })),

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

      setSaasPhaseAll: (partial) =>
        set((state) => ({
          saasConfig: {
            ...state.saasConfig,
            phase1: { ...state.saasConfig.phase1, ...partial },
            phase2: { ...state.saasConfig.phase2, ...partial },
            phase3: { ...state.saasConfig.phase3, ...partial },
          },
        })),

      loadSaasConfig: (config) => set({ saasConfig: config }),
      resetSaas: () => set({ saasConfig: defaultSaasConfig }),

      customizePerPhase: false,
      setCustomizePerPhase: (v) => set({ customizePerPhase: v }),
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

import { create } from "zustand";

interface UpgradeStore {
  open: boolean;
  feature: string;
  currentPlan: string;
  limitValue: string;
  showUpgradeModal: (opts: { feature: string; currentPlan?: string; limitValue?: string }) => void;
  closeUpgradeModal: () => void;
}

export const useUpgradeStore = create<UpgradeStore>((set) => ({
  open: false,
  feature: "",
  currentPlan: "free",
  limitValue: "",
  showUpgradeModal: ({ feature, currentPlan = "free", limitValue = "" }) =>
    set({ open: true, feature, currentPlan, limitValue }),
  closeUpgradeModal: () => set({ open: false }),
}));

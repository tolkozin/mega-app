import { create } from "zustand";

type ModalMode = "upgrade" | "expired" | "readonly";

interface UpgradeStore {
  open: boolean;
  mode: ModalMode;
  feature: string;
  currentPlan: string;
  limitValue: string;
  showUpgradeModal: (opts: { feature: string; currentPlan?: string; limitValue?: string }) => void;
  showExpiredModal: () => void;
  showReadOnlyModal: () => void;
  closeUpgradeModal: () => void;
}

export const useUpgradeStore = create<UpgradeStore>((set) => ({
  open: false,
  mode: "upgrade",
  feature: "",
  currentPlan: "expired",
  limitValue: "",
  showUpgradeModal: ({ feature, currentPlan = "expired", limitValue = "" }) =>
    set({ open: true, mode: "upgrade", feature, currentPlan, limitValue }),
  showExpiredModal: () =>
    set({ open: true, mode: "expired", feature: "", currentPlan: "expired", limitValue: "" }),
  showReadOnlyModal: () =>
    set({ open: true, mode: "readonly", feature: "", currentPlan: "expired", limitValue: "" }),
  closeUpgradeModal: () => set({ open: false }),
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SurveyData, INITIAL_SURVEY, TOTAL_STEPS } from "@/lib/survey-types";

interface SurveyStore {
  step: number;
  direction: number; // 1 = forward, -1 = back (for animation)
  data: SurveyData;
  plan: string;
  setStep: (step: number) => void;
  next: () => void;
  back: () => void;
  update: (partial: Partial<SurveyData>) => void;
  setPlan: (plan: string) => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set, get) => ({
      step: 0,
      direction: 1,
      data: { ...INITIAL_SURVEY },
      plan: "plus",
      setStep: (step) => set({ step }),
      next: () => {
        const { step } = get();
        if (step < TOTAL_STEPS - 1) set({ step: step + 1, direction: 1 });
      },
      back: () => {
        const { step } = get();
        if (step > 0) set({ step: step - 1, direction: -1 });
      },
      update: (partial) =>
        set((s) => ({ data: { ...s.data, ...partial } })),
      setPlan: (plan) => set({ plan }),
      reset: () =>
        set({ step: 0, direction: 1, data: { ...INITIAL_SURVEY }, plan: "plus" }),
    }),
    { name: "survey_draft" }
  )
);

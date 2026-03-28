import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  JPY: "\u00A5",
};

interface CurrencyStore {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  symbol: () => string;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "USD",
      setCurrency: (c) => set({ currency: c }),
      symbol: () => CURRENCY_SYMBOLS[get().currency],
    }),
    { name: "revenuemap-currency" },
  ),
);

export function getCurrencySymbol(code?: CurrencyCode): string {
  return CURRENCY_SYMBOLS[code ?? "USD"];
}

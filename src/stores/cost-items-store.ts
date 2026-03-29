import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CostItem {
  id: string;
  label: string;
  amount: number;
  category: string;
}

interface CostItemsStore {
  /** Items keyed by "sub-1", "sub-2", "ecom-1", "saas-1" etc. */
  items: Record<string, CostItem[]>;
  initialized: Record<string, boolean>;
  getItems: (key: string) => CostItem[];
  initItems: (key: string, defaults: CostItem[]) => void;
  /** Update amounts of default items to match current config values */
  refreshDefaults: (key: string, defaults: CostItem[]) => void;
  setItems: (key: string, items: CostItem[]) => void;
  addItem: (key: string, item: CostItem) => void;
  removeItem: (key: string, id: string) => void;
  updateItem: (key: string, id: string, updates: Partial<CostItem>) => void;
}

export const useCostItemsStore = create<CostItemsStore>()(
  persist(
    (set, get) => ({
      items: {},
      initialized: {},

      getItems: (key) => get().items[key] ?? [],

      initItems: (key, defaults) => {
        if (get().initialized[key]) return;
        set((s) => ({
          items: { ...s.items, [key]: defaults },
          initialized: { ...s.initialized, [key]: true },
        }));
      },

      refreshDefaults: (key, defaults) => {
        const current = get().items[key];
        if (!current) return;
        // Build a map of default id → amount from config
        const defaultMap = new Map(defaults.map((d) => [d.id, d.amount]));
        // Update only the default items' amounts, preserve custom items
        const updated = current.map((item) => {
          const configAmount = defaultMap.get(item.id);
          if (configAmount !== undefined) {
            return { ...item, amount: configAmount };
          }
          return item;
        });
        set((s) => ({ items: { ...s.items, [key]: updated } }));
      },

      setItems: (key, items) =>
        set((s) => ({ items: { ...s.items, [key]: items } })),

      addItem: (key, item) =>
        set((s) => ({
          items: { ...s.items, [key]: [...(s.items[key] ?? []), item] },
        })),

      removeItem: (key, id) =>
        set((s) => ({
          items: {
            ...s.items,
            [key]: (s.items[key] ?? []).filter((i) => i.id !== id),
          },
        })),

      updateItem: (key, id, updates) =>
        set((s) => ({
          items: {
            ...s.items,
            [key]: (s.items[key] ?? []).map((i) =>
              i.id === id ? { ...i, ...updates } : i
            ),
          },
        })),
    }),
    { name: "revenuemap-cost-items" }
  )
);

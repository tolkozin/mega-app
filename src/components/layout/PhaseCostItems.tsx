"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useCostItemsStore, type CostItem } from "@/stores/cost-items-store";
import { Plus, Trash2, ChevronDown } from "lucide-react";

/* ── Category definitions ── */

export interface CostCategory {
  value: string;
  label: string;
  color: string;
}

export const SUB_CATEGORIES: CostCategory[] = [
  { value: "Investment", label: "Investment", color: "#F59E0B" },
  { value: "Personnel", label: "Personnel", color: "#1650b0" },
  { value: "Operations", label: "Operations", color: "#2163E7" },
  { value: "Marketing", label: "Marketing", color: "#7BA3F0" },
  { value: "Organic", label: "Organic", color: "#BDD0F8" },
];

export const ECOM_CATEGORIES: CostCategory[] = [
  { value: "Investment", label: "Investment", color: "#F59E0B" },
  { value: "Personnel", label: "Personnel", color: "#1650b0" },
  { value: "Marketing", label: "Marketing", color: "#7BA3F0" },
  { value: "Operations", label: "Operations", color: "#2163E7" },
];

export const SAAS_CATEGORIES: CostCategory[] = [
  { value: "Investment", label: "Investment", color: "#F59E0B" },
  { value: "Personnel", label: "Personnel", color: "#1650b0" },
  { value: "Marketing", label: "Marketing", color: "#7BA3F0" },
  { value: "Operations", label: "Operations", color: "#2163E7" },
];

/* ── Component ── */

interface PhaseCostItemsProps {
  storeKey: string;
  defaults: CostItem[];
  categories: CostCategory[];
  onSync: (totals: Record<string, number>) => void;
}

export function PhaseCostItems({ storeKey, defaults, categories, onSync }: PhaseCostItemsProps) {
  const initItems = useCostItemsStore((s) => s.initItems);
  const items = useCostItemsStore((s) => s.getItems(storeKey));
  const setItems = useCostItemsStore((s) => s.setItems);
  const addItem = useCostItemsStore((s) => s.addItem);
  const removeItem = useCostItemsStore((s) => s.removeItem);
  const updateItem = useCostItemsStore((s) => s.updateItem);
  const nextId = useRef(100);

  // Initialize with defaults on first render
  useEffect(() => {
    initItems(storeKey, defaults);
  }, [storeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync totals to config whenever items change
  const syncTotals = useCallback(
    (currentItems: CostItem[]) => {
      const totals: Record<string, number> = {};
      for (const cat of categories) totals[cat.value] = 0;
      for (const item of currentItems) {
        totals[item.category] = (totals[item.category] ?? 0) + item.amount;
      }
      onSync(totals);
    },
    [categories, onSync]
  );

  // Sync when items change (but skip if empty — not yet initialized)
  useEffect(() => {
    if (items.length > 0) syncTotals(items);
  }, [items, syncTotals]);

  const catColor = (cat: string) =>
    categories.find((c) => c.value === cat)?.color ?? "#BDD0F8";

  const handleAdd = () => {
    const id = `custom-${nextId.current++}-${Date.now()}`;
    addItem(storeKey, {
      id,
      label: "New cost item",
      amount: 0,
      category: categories[1]?.value ?? categories[0].value,
    });
  };

  const handleRemove = (id: string) => {
    removeItem(storeKey, id);
  };

  const handleUpdate = (id: string, field: keyof CostItem, val: string | number) => {
    updateItem(storeKey, id, { [field]: val });
  };

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex gap-1.5 items-center rounded-[11px] p-2.5 border-[1.5px] border-[#eef0f6] bg-[#f8f9fc]"
        >
          {/* Category dot */}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: catColor(item.category) }}
          />

          {/* Label */}
          <input
            value={item.label}
            onChange={(e) => handleUpdate(item.id, "label", e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-[12.5px] font-semibold text-[#1a1a2e] font-[Lato,sans-serif]"
          />

          {/* Amount */}
          <div className="flex items-center bg-white border-[1.5px] border-[#e8eaf0] rounded-[7px] px-2 py-1 w-[76px] shrink-0">
            <span className="text-[11px] text-[#9ca3af] mr-0.5">$</span>
            <input
              type="number"
              value={item.amount || ""}
              onChange={(e) =>
                handleUpdate(item.id, "amount", e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="w-full bg-transparent border-none outline-none text-[12.5px] font-bold text-[#1a1a2e] font-[Lato,sans-serif] tabular-nums"
              placeholder="0"
            />
          </div>

          {/* Category select */}
          <div className="relative shrink-0">
            <select
              value={item.category}
              onChange={(e) => handleUpdate(item.id, "category", e.target.value)}
              className="appearance-none bg-white border-[1.5px] border-[#e8eaf0] rounded-[7px] pl-2 pr-6 py-1 text-[10.5px] text-[#6b7280] font-[Lato,sans-serif] cursor-pointer outline-none"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]"
            />
          </div>

          {/* Delete */}
          <button
            onClick={() => handleRemove(item.id)}
            className="shrink-0 p-1 text-[#d1d5db] hover:text-[#EF4444] transition-colors"
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      ))}

      {/* Add button */}
      <button
        onClick={handleAdd}
        className="flex items-center gap-2 rounded-[11px] border-[1.5px] border-dashed border-[#d1d5db] px-3.5 py-2.5 text-[12px] font-semibold text-[#9ca3af] font-[Lato,sans-serif] hover:border-[#2163E7] hover:text-[#2163E7] transition-colors"
      >
        <Plus size={13} strokeWidth={2.5} />
        Add cost item
      </button>

      {/* Total */}
      <div className="flex justify-between pt-2 border-t border-[#f0f1f7] mt-1">
        <span className="text-[12px] text-[#6b7280] font-semibold">Total costs</span>
        <span className="text-[14px] text-[#1a1a2e] font-black tabular-nums">
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

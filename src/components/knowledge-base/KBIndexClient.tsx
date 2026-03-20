"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MetricCard } from "./MetricCard";
import { CATEGORY_META, METRIC_CATEGORIES } from "@/lib/knowledge-base";
import { getAllModels } from "@/lib/model-registry";
import type { MetricDefinition, MetricCategory } from "@/lib/knowledge-base";
import type { ProductType } from "@/lib/model-registry";
import { Search } from "lucide-react";

const MODELS = getAllModels();

export function KBIndexClient({ metrics }: { metrics: MetricDefinition[] }) {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as MetricCategory) ?? null;
  const [category, setCategory] = useState<MetricCategory | null>(
    initialCategory && METRIC_CATEGORIES.includes(initialCategory) ? initialCategory : null
  );
  const [model, setModel] = useState<ProductType | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let result = metrics;
    if (category) result = result.filter((m) => m.category === category);
    if (model) result = result.filter((m) => m.models.includes(model));
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.shortName.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.keyword.toLowerCase().includes(q)
      );
    }
    return result;
  }, [metrics, category, model, query]);

  return (
    <>
      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search metrics..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#e5e7eb] bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#2163e7]/30 focus:border-[#2163e7]"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setCategory(null)}
          className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
            !category
              ? "bg-[#2163e7] text-white border-[#2163e7]"
              : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a2e]"
          }`}
        >
          All Categories
        </button>
        {METRIC_CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? null : cat)}
              className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
                category === cat
                  ? "text-white border-transparent"
                  : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a2e]"
              }`}
              style={category === cat ? { backgroundColor: meta.color } : undefined}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Model filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setModel(null)}
          className={`rounded-full px-3 py-1 text-xs border transition-colors ${
            !model
              ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
              : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a2e]"
          }`}
        >
          All Models
        </button>
        {MODELS.map((m) => (
          <button
            key={m.key}
            onClick={() => setModel(model === m.key ? null : m.key)}
            className={`rounded-full px-3 py-1 text-xs border transition-colors flex items-center gap-1.5 ${
              model === m.key
                ? "text-white border-transparent"
                : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a2e]"
            }`}
            style={model === m.key ? { backgroundColor: m.color } : undefined}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: model === m.key ? "#fff" : m.color }}
            />
            {m.shortLabel}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MetricCard key={m.slug} metric={m} />
          ))}
        </div>
      ) : (
        <p className="text-[#6b7280] py-16 text-center">
          No metrics found. Try a different filter or search term.
        </p>
      )}

      {/* Count */}
      <p className="text-xs text-[#6b7280] mt-6 text-center">
        Showing {filtered.length} of {metrics.length} metrics
      </p>
    </>
  );
}

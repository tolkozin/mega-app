import Link from "next/link";
import type { MetricDefinition } from "@/lib/knowledge-base";
import { CATEGORY_META } from "@/lib/knowledge-base";
import { MODEL_REGISTRY } from "@/lib/model-registry";
import type { ProductType } from "@/lib/model-registry";

export function MetricCard({ metric }: { metric: MetricDefinition }) {
  const cat = CATEGORY_META[metric.category];

  return (
    <Link
      href={`/knowledge-base/${metric.slug}`}
      className="group block rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm transition-all hover:border-[#2163e7]/40 hover:shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: cat.color }}
        >
          {cat.label.replace(" Metrics", "").replace(" & ", " / ")}
        </span>
      </div>
      <h3 className="text-base font-bold text-[#1a1a2e] group-hover:text-[#2163e7] transition-colors mb-1.5">
        {metric.shortName}
      </h3>
      <p className="text-sm text-[#6b7280] line-clamp-2 mb-3">
        {metric.description.slice(0, 120)}...
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {metric.models.slice(0, 5).map((key) => {
          const m = MODEL_REGISTRY[key as ProductType];
          if (!m) return null;
          return (
            <span
              key={key}
              title={m.label}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: m.color }}
            />
          );
        })}
        {metric.models.length > 5 && (
          <span className="text-[10px] text-[#6b7280]">+{metric.models.length - 5}</span>
        )}
      </div>
    </Link>
  );
}

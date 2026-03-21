"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IDEA_COLLECTIONS, IDEA_LISTS } from "@/lib/ideas";
import type { IdeaCollectionType } from "@/lib/ideas";
import { ArrowRight, Search } from "lucide-react";

const COLLECTION_META: Record<IdeaCollectionType, { label: string; color: string }> = {
  niche: { label: "By Niche", color: "#2163e7" },
  demographic: { label: "By Demographic", color: "#7c3aed" },
  budget: { label: "By Budget", color: "#059669" },
  category: { label: "By App Category", color: "#d97706" },
  timeline: { label: "By Build Time", color: "#dc2626" },
};

const COLLECTION_TYPES: IdeaCollectionType[] = ["niche", "demographic", "budget", "category", "timeline"];

interface FlatListItem {
  slug: string;
  label: string;
  icon: string;
  collectionType: IdeaCollectionType;
  subtitle: string;
  ideaCount: number;
}

const ALL_ITEMS: FlatListItem[] = IDEA_COLLECTIONS.flatMap((col) =>
  col.lists.map((item) => {
    const list = IDEA_LISTS.find((il) => il.slug === item.slug);
    return {
      slug: item.slug,
      label: item.label,
      icon: item.icon,
      collectionType: col.type,
      subtitle: list?.subtitle ?? "",
      ideaCount: list?.ideas.length ?? 30,
    };
  })
);

export function IdeasHubClient() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") as IdeaCollectionType | null;
  const [filter, setFilter] = useState<IdeaCollectionType | null>(
    initialFilter && COLLECTION_TYPES.includes(initialFilter) ? initialFilter : null
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let result = ALL_ITEMS;
    if (filter) result = result.filter((item) => item.collectionType === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, query]);

  const totalIdeas = useMemo(
    () => filtered.reduce((sum, item) => sum + item.ideaCount, 0),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Hero */}
      <section className="pt-20 pb-10 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#1a1a2e] mb-4">
          {IDEA_LISTS.length * 30}+ Business Ideas<br className="hidden sm:block" />
          Across {IDEA_COLLECTIONS.length} Categories
        </h1>
        <p className="text-lg text-[#6b7280] max-w-2xl mx-auto mb-8">
          Curated startup ideas across {IDEA_COLLECTIONS.reduce((sum, c) => sum + c.lists.length, 0)} lists —
          by niche, demographic, budget, app category, and build time.
          Find your next idea and validate it with real financial projections.
        </p>
        <Link href="/onboarding/survey">
          <button className="h-11 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-lg hover:bg-[#1a53c7] transition-colors">
            Validate Your Idea Free
          </button>
        </Link>
      </section>

      {/* Search + Filters */}
      <section className="max-w-5xl mx-auto px-4 pb-4">
        {/* Search */}
        <div className="relative max-w-md mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search idea lists..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#e5e7eb] bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#2163e7]/30 focus:border-[#2163e7]"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter(null)}
            className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
              !filter
                ? "bg-[#2163e7] text-white border-[#2163e7]"
                : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a2e]"
            }`}
          >
            All Lists ({ALL_ITEMS.length})
          </button>
          {COLLECTION_TYPES.map((type) => {
            const meta = COLLECTION_META[type];
            const count = ALL_ITEMS.filter((i) => i.collectionType === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(filter === type ? null : type)}
                className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
                  filter === type
                    ? "text-white border-transparent"
                    : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a2e]"
                }`}
                style={filter === type ? { backgroundColor: meta.color } : undefined}
              >
                {meta.label} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        {filtered.length > 0 ? (
          <>
            {/* Grouped by collection when no filter / no search */}
            {!filter && !query.trim() ? (
              <>
                {COLLECTION_TYPES.map((type) => {
                  const collection = IDEA_COLLECTIONS.find((c) => c.type === type)!;
                  const items = ALL_ITEMS.filter((i) => i.collectionType === type);
                  const meta = COLLECTION_META[type];
                  const isNiche = type === "niche";

                  return (
                    <div key={type} className="mb-12">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-6 rounded-full" style={{ backgroundColor: meta.color }} />
                        <h2 className="text-xl font-bold text-[#1a1a2e]">{collection.label}</h2>
                      </div>
                      <p className="text-sm text-[#6b7280] mb-6 pl-4">{collection.description}</p>

                      {isNiche ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {items.map((item) => (
                            <IdeaListCard key={item.slug} item={item} variant="large" />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {items.map((item) => (
                            <IdeaListCard key={item.slug} item={item} variant="compact" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              /* Flat grid when filtering or searching */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((item) => (
                  <IdeaListCard key={item.slug} item={item} variant="large" />
                ))}
              </div>
            )}

            <p className="text-sm text-[#6b7280] mt-6 text-center">
              Showing {filtered.length} lists with {totalIdeas.toLocaleString()} ideas
            </p>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-[#6b7280] mb-2">No idea lists match your search</p>
            <button
              onClick={() => { setFilter(null); setQuery(""); }}
              className="text-sm font-semibold text-[#2163e7] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-white border-t border-[#e5e7eb] py-20 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-[#1a1a2e] mb-4">
          Found an idea you like?
        </h2>
        <p className="text-[#6b7280] max-w-xl mx-auto mb-8">
          Plug it into Revenue Map and get a full financial projection in minutes — revenue, costs, break-even, and investor-ready reports.
        </p>
        <Link href="/onboarding/survey">
          <button className="h-11 px-8 bg-[#2163e7] text-white text-sm font-bold rounded-lg hover:bg-[#1a53c7] transition-colors">
            Start Free Projection
          </button>
        </Link>
      </section>
    </div>
  );
}

/* ── Card Components ── */

function IdeaListCard({ item, variant }: { item: FlatListItem; variant: "large" | "compact" }) {
  const meta = COLLECTION_META[item.collectionType];

  if (variant === "compact") {
    return (
      <Link
        href={`/ideas/${item.slug}`}
        className="group bg-white rounded-xl border border-[#e5e7eb] p-5 hover:border-[#2163e7]/30 hover:shadow-md transition-all flex flex-col"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-2xl">{item.icon}</span>
          <h3 className="text-sm font-bold text-[#1a1a2e] group-hover:text-[#2163e7] transition-colors">
            {item.label}
          </h3>
        </div>
        <p className="text-xs text-[#6b7280] mb-3 flex-1 leading-relaxed line-clamp-2">
          {item.subtitle}
        </p>
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
          >
            {meta.label}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#2163e7]">
            {item.ideaCount} ideas
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/ideas/${item.slug}`}
      className="group bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:border-[#2163e7]/30 hover:shadow-lg transition-all flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{item.icon}</span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <h3 className="text-lg font-bold text-[#1a1a2e] mb-1 group-hover:text-[#2163e7] transition-colors">
        {item.label}
      </h3>
      <p className="text-sm text-[#6b7280] mb-4 flex-1 leading-relaxed line-clamp-2">
        {item.subtitle}
      </p>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2163e7]">
        View {item.ideaCount} ideas
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

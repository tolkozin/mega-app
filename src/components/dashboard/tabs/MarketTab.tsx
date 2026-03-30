"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FONT, CARD_SHADOW } from "@/components/v2/charts/v2-chart-utils";
import type { MarketData, MarketRegion } from "@/lib/types";

/* ─── Types ─── */

interface MarketTabProps {
  data: MarketData;
  onChange: (data: MarketData) => void;
}

/* ─── Constants ─── */

const FADE_IN = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

const cardStyle: React.CSSProperties = {
  boxShadow: CARD_SHADOW,
  fontFamily: FONT,
};

const INPUT_CLASS =
  "h-10 px-3 rounded-lg border border-[#e5e7eb] focus:border-[#2163E7] focus:ring-2 focus:ring-[#2163e7]/20 outline-none text-sm w-full";

const BTN_PRIMARY =
  "bg-[#2163e7] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1a53c7] transition-colors";

const BTN_SECONDARY =
  "border border-[#e5e7eb] text-[#1a1a2e] text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#f8f9fc] transition-colors";

const TABLE_HEADER =
  "text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]";

/* ─── Region & Audience Presets ─── */

interface RegionPreset {
  name: string;
  tam: number;
  sam: number;
  som: number;
  source: string;
}

const REGION_PRESETS: RegionPreset[] = [
  { name: "North America", tam: 850_000_000_000, sam: 120_000_000_000, som: 2_400_000_000, source: "Statista 2025" },
  { name: "Europe", tam: 620_000_000_000, sam: 95_000_000_000, som: 1_900_000_000, source: "Statista 2025" },
  { name: "APAC", tam: 780_000_000_000, sam: 110_000_000_000, som: 2_200_000_000, source: "Grand View Research" },
  { name: "Latin America", tam: 180_000_000_000, sam: 28_000_000_000, som: 560_000_000, source: "Mordor Intelligence" },
  { name: "Middle East & Africa", tam: 95_000_000_000, sam: 15_000_000_000, som: 300_000_000, source: "Mordor Intelligence" },
  { name: "Southeast Asia", tam: 220_000_000_000, sam: 35_000_000_000, som: 700_000_000, source: "e-Conomy SEA" },
  { name: "India", tam: 310_000_000_000, sam: 48_000_000_000, som: 960_000_000, source: "NASSCOM" },
  { name: "China", tam: 520_000_000_000, sam: 75_000_000_000, som: 1_500_000_000, source: "iResearch" },
  { name: "Global", tam: 3_500_000_000_000, sam: 500_000_000_000, som: 10_000_000_000, source: "Statista 2025" },
];

interface AudiencePreset {
  name: string;
  age: string;
  pain: string;
}

const AUDIENCE_PRESETS: AudiencePreset[] = [
  { name: "Startup Founders", age: "25-40", pain: "Limited budget, need fast ROI on every tool" },
  { name: "SMB Owners", age: "30-55", pain: "Overwhelmed by ops, no dedicated tech team" },
  { name: "Enterprise Managers", age: "35-50", pain: "Slow procurement, need compliance and integrations" },
  { name: "Freelancers", age: "22-38", pain: "Inconsistent income, need affordable solutions" },
  { name: "Gen Z Consumers", age: "18-27", pain: "Price-sensitive, expect mobile-first UX" },
  { name: "Working Parents", age: "28-45", pain: "Time-poor, need convenience and reliability" },
  { name: "Tech-Savvy Early Adopters", age: "20-35", pain: "Want cutting-edge features, will switch fast" },
  { name: "Budget-Conscious Shoppers", age: "25-55", pain: "Always comparing prices, loyalty is hard to earn" },
];

/* ─── Helpers ─── */

function formatDollar(value: number): string {
  if (value >= 1e9) {
    const n = value / 1e9;
    return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}B`;
  }
  if (value >= 1e6) {
    const n = value / 1e6;
    return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}M`;
  }
  if (value >= 1e3) {
    const n = value / 1e3;
    return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}K`;
  }
  return `$${value}`;
}

function parseDollarInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/* ─── Tooltip ─── */

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group ml-1 cursor-help">
      <svg
        width={14}
        height={14}
        viewBox="0 0 14 14"
        fill="none"
        className="inline-block text-[#9ca3af]"
      >
        <circle cx={7} cy={7} r={6} stroke="currentColor" strokeWidth={1.2} />
        <text
          x={7}
          y={10}
          textAnchor="middle"
          fontSize={9}
          fontWeight={600}
          fill="currentColor"
        >
          i
        </text>
      </svg>
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 rounded-lg bg-[#1a1a2e] text-white text-[11px] leading-snug opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-center"
        style={{ fontFamily: FONT }}
      >
        {text}
      </span>
    </span>
  );
}

/* ─── Concentric Circles SVG ─── */

function ConcentricCircles({
  tam,
  sam,
  som,
}: {
  tam: number;
  sam: number;
  som: number;
}) {
  const cx = 120;
  const cy = 120;
  const maxR = 105;
  const minR = 25;

  // Compute radii proportional to values, with minimum sizes
  const maxVal = Math.max(tam, 1);
  const tamR = maxR;
  const samR = Math.max(minR + 10, (Math.sqrt(sam / maxVal) * maxR) || minR + 10);
  const somR = Math.max(minR, (Math.sqrt(som / maxVal) * maxR) || minR);

  return (
    <svg width={240} height={240} viewBox="0 0 240 240">
      {/* TAM */}
      <circle
        cx={cx}
        cy={cy}
        r={tamR}
        fill="rgba(33,99,231,0.08)"
        stroke="#2163E7"
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy - tamR + 18}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="#2163E7"
        fontFamily={FONT}
      >
        TAM
      </text>
      <text
        x={cx}
        y={cy - tamR + 32}
        textAnchor="middle"
        fontSize={10}
        fill="#6b7280"
        fontFamily={FONT}
      >
        {formatDollar(tam)}
      </text>

      {/* SAM */}
      <circle
        cx={cx}
        cy={cy}
        r={samR}
        fill="rgba(33,99,231,0.15)"
        stroke="#2163E7"
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy - samR + 18}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="#2163E7"
        fontFamily={FONT}
      >
        SAM
      </text>
      <text
        x={cx}
        y={cy - samR + 32}
        textAnchor="middle"
        fontSize={10}
        fill="#6b7280"
        fontFamily={FONT}
      >
        {formatDollar(sam)}
      </text>

      {/* SOM */}
      <circle
        cx={cx}
        cy={cy}
        r={somR}
        fill="rgba(33,99,231,0.25)"
        stroke="#2163E7"
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="#2163E7"
        fontFamily={FONT}
      >
        SOM
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontSize={10}
        fill="#6b7280"
        fontFamily={FONT}
      >
        {formatDollar(som)}
      </text>
    </svg>
  );
}

/* ─── TAM / SAM / SOM Card (per-region) ─── */

function MarketSizeCard({
  data,
  onChange,
}: {
  data: MarketData;
  onChange: (data: MarketData) => void;
}) {
  const totals = useMemo(() => {
    const t = { tam: 0, sam: 0, som: 0 };
    for (const r of data.regions) {
      t.tam += r.tam;
      t.sam += r.sam;
      t.som += r.som;
    }
    return t;
  }, [data.regions]);

  const handleRegionField = useCallback(
    (id: string, field: keyof MarketRegion, raw: string) => {
      onChange({
        ...data,
        regions: data.regions.map((r) =>
          r.id === id
            ? {
                ...r,
                [field]:
                  field === "name" || field === "source"
                    ? raw
                    : parseDollarInput(raw),
              }
            : r,
        ),
      });
    },
    [data, onChange],
  );

  const [showRegionMenu, setShowRegionMenu] = useState(false);

  const handleAddPreset = useCallback(
    (preset: RegionPreset) => {
      onChange({
        ...data,
        regions: [
          ...data.regions,
          { id: crypto.randomUUID(), ...preset },
        ],
      });
      setShowRegionMenu(false);
    },
    [data, onChange],
  );

  const handleAddCustom = useCallback(() => {
    onChange({
      ...data,
      regions: [
        ...data.regions,
        { id: crypto.randomUUID(), name: "", tam: 0, sam: 0, som: 0, source: "" },
      ],
    });
    setShowRegionMenu(false);
  }, [data, onChange]);

  const handleDelete = useCallback(
    (id: string) => {
      onChange({
        ...data,
        regions: data.regions.filter((r) => r.id !== id),
      });
    },
    [data, onChange],
  );

  // Filter out already-added preset names
  const existingNames = new Set(data.regions.map((r) => r.name));
  const availablePresets = REGION_PRESETS.filter((p) => !existingNames.has(p.name));

  return (
    <motion.div {...FADE_IN} className="bg-white rounded-2xl p-6" style={cardStyle}>
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-[15px] font-bold text-[#1a1a2e]"
          style={{ fontFamily: FONT }}
        >
          Market Size
        </h3>
        <div className="relative">
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={() => setShowRegionMenu((v) => !v)}
          >
            + Add Region
          </button>
          {showRegionMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-[#e5e7eb] shadow-lg z-50 py-1 max-h-64 overflow-y-auto"
              style={{ fontFamily: FONT }}
            >
              {availablePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="w-full text-left px-4 py-2 text-[12px] hover:bg-[#f8f9fc] transition-colors"
                  onClick={() => handleAddPreset(preset)}
                >
                  <span className="font-bold text-[#1a1a2e]">{preset.name}</span>
                  <span className="text-[#9ca3af] ml-2">TAM {formatDollar(preset.tam)}</span>
                </button>
              ))}
              <div className="border-t border-[#e5e7eb] mt-1 pt-1">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-[12px] font-bold text-[#2163E7] hover:bg-[#f8f9fc] transition-colors"
                  onClick={handleAddCustom}
                >
                  + Custom Region
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left: SVG (totals) */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <ConcentricCircles
            tam={totals.tam}
            sam={totals.sam}
            som={totals.som}
          />
          <p
            className="text-[11px] text-[#9ca3af] mt-2"
            style={{ fontFamily: FONT }}
          >
            Total across all regions
          </p>
        </div>

        {/* Right: Region rows */}
        <div className="flex-1 w-full">
          {data.regions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[13px] text-[#9ca3af]" style={{ fontFamily: FONT }}>
                Select a region to get started with pre-filled benchmarks
              </p>
              <button
                type="button"
                className={BTN_SECONDARY + " mt-3"}
                onClick={() => setShowRegionMenu(true)}
              >
                + Add Region
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.regions.map((region) => (
                <div
                  key={region.id}
                  className="relative bg-[#f8f9fc] rounded-xl border border-[#e5e7eb] p-4"
                >
                  {/* Delete */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-[#9ca3af] hover:text-[#EF4444] transition-colors text-lg leading-none"
                    onClick={() => handleDelete(region.id)}
                    aria-label="Delete region"
                  >
                    &times;
                  </button>

                  {/* Region name + source */}
                  <div className="flex gap-3 mb-3 pr-6">
                    <input
                      type="text"
                      className={INPUT_CLASS + " font-bold flex-1"}
                      value={region.name}
                      onChange={(e) =>
                        handleRegionField(region.id, "name", e.target.value)
                      }
                      placeholder="Region (e.g. North America, EU, APAC)"
                    />
                    <input
                      type="text"
                      className={INPUT_CLASS + " flex-1"}
                      value={region.source}
                      onChange={(e) =>
                        handleRegionField(region.id, "source", e.target.value)
                      }
                      placeholder="Source (e.g. Statista)"
                    />
                  </div>

                  {/* TAM / SAM / SOM row */}
                  <div className="grid grid-cols-3 gap-3">
                    {(["tam", "sam", "som"] as const).map((field) => (
                      <div key={field} className="space-y-1">
                        <label
                          className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]"
                          style={{ fontFamily: FONT }}
                        >
                          {field.toUpperCase()}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-sm pointer-events-none">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            className={INPUT_CLASS + " pl-7"}
                            value={region[field] || ""}
                            onChange={(e) =>
                              handleRegionField(region.id, field, e.target.value)
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Totals row */}
              {data.regions.length > 1 && (
                <div
                  className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#eef1fb] border border-[#d4daf0]"
                  style={{ fontFamily: FONT }}
                >
                  <span className="text-[12px] font-bold text-[#1a1a2e]">
                    Total
                  </span>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    {(["tam", "sam", "som"] as const).map((field) => (
                      <span
                        key={field}
                        className="text-[12px] font-semibold text-[#2163E7]"
                      >
                        {field.toUpperCase()}: {formatDollar(totals[field])}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Competitors Card ─── */

function CompetitorsCard({
  data,
  onChange,
}: {
  data: MarketData;
  onChange: (data: MarketData) => void;
}) {
  const handleFieldChange = useCallback(
    (id: string, field: "name" | "price" | "users" | "diff", value: string) => {
      onChange({
        ...data,
        competitors: data.competitors.map((c) =>
          c.id === id ? { ...c, [field]: value } : c,
        ),
      });
    },
    [data, onChange],
  );

  const handleAdd = useCallback(() => {
    onChange({
      ...data,
      competitors: [
        ...data.competitors,
        { id: crypto.randomUUID(), name: "", price: "", users: "", diff: "" },
      ],
    });
  }, [data, onChange]);

  const handleDelete = useCallback(
    (id: string) => {
      onChange({
        ...data,
        competitors: data.competitors.filter((c) => c.id !== id),
      });
    },
    [data, onChange],
  );

  return (
    <motion.div {...FADE_IN} className="bg-white rounded-2xl p-6" style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[15px] font-bold text-[#1a1a2e]"
          style={{ fontFamily: FONT }}
        >
          Competitors
        </h3>
        <button type="button" className={BTN_PRIMARY} onClick={handleAdd}>
          + Add
        </button>
      </div>

      {data.competitors.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-[#9ca3af]" style={{ fontFamily: FONT }}>
            Add your first competitor
          </p>
          <button
            type="button"
            className={BTN_SECONDARY + " mt-3"}
            onClick={handleAdd}
          >
            + Add Competitor
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: FONT }}>
            <thead>
              <tr>
                <th className={TABLE_HEADER + " text-left pb-2 pr-2"}>Name</th>
                <th className={TABLE_HEADER + " text-left pb-2 pr-2"}>Price</th>
                <th className={TABLE_HEADER + " text-left pb-2 pr-2"}>Users</th>
                <th className={TABLE_HEADER + " text-left pb-2 pr-2"}>
                  Differentiator
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {data.competitors.map((comp) => (
                <tr key={comp.id} className="group">
                  <td className="py-1.5 pr-2">
                    <input
                      type="text"
                      className={INPUT_CLASS}
                      value={comp.name}
                      onChange={(e) =>
                        handleFieldChange(comp.id, "name", e.target.value)
                      }
                      placeholder="Competitor name"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="text"
                      className={INPUT_CLASS}
                      value={comp.price}
                      onChange={(e) =>
                        handleFieldChange(comp.id, "price", e.target.value)
                      }
                      placeholder="$29/mo"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="text"
                      className={INPUT_CLASS}
                      value={comp.users}
                      onChange={(e) =>
                        handleFieldChange(comp.id, "users", e.target.value)
                      }
                      placeholder="10K"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="text"
                      className={INPUT_CLASS}
                      value={comp.diff}
                      onChange={(e) =>
                        handleFieldChange(comp.id, "diff", e.target.value)
                      }
                      placeholder="What sets them apart"
                    />
                  </td>
                  <td className="py-1.5 text-center">
                    <button
                      type="button"
                      className="text-[#9ca3af] hover:text-[#EF4444] transition-colors text-lg leading-none"
                      onClick={() => handleDelete(comp.id)}
                      aria-label="Delete competitor"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Target Audience Card ─── */

function AudienceCard({
  data,
  onChange,
}: {
  data: MarketData;
  onChange: (data: MarketData) => void;
}) {
  const handleFieldChange = useCallback(
    (id: string, field: "name" | "age" | "pain", value: string) => {
      onChange({
        ...data,
        audiences: data.audiences.map((a) =>
          a.id === id ? { ...a, [field]: value } : a,
        ),
      });
    },
    [data, onChange],
  );

  const [showAudienceMenu, setShowAudienceMenu] = useState(false);

  const handleAddPreset = useCallback(
    (preset: AudiencePreset) => {
      onChange({
        ...data,
        audiences: [
          ...data.audiences,
          { id: crypto.randomUUID(), ...preset },
        ],
      });
      setShowAudienceMenu(false);
    },
    [data, onChange],
  );

  const handleAddCustom = useCallback(() => {
    onChange({
      ...data,
      audiences: [
        ...data.audiences,
        { id: crypto.randomUUID(), name: "", age: "", pain: "" },
      ],
    });
    setShowAudienceMenu(false);
  }, [data, onChange]);

  const handleDelete = useCallback(
    (id: string) => {
      onChange({
        ...data,
        audiences: data.audiences.filter((a) => a.id !== id),
      });
    },
    [data, onChange],
  );

  const existingAudNames = new Set(data.audiences.map((a) => a.name));
  const availableAudPresets = AUDIENCE_PRESETS.filter((p) => !existingAudNames.has(p.name));

  return (
    <motion.div {...FADE_IN} className="bg-white rounded-2xl p-6" style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[15px] font-bold text-[#1a1a2e]"
          style={{ fontFamily: FONT }}
        >
          Target Audience
        </h3>
        <div className="relative">
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={() => setShowAudienceMenu((v) => !v)}
          >
            + Add
          </button>
          {showAudienceMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-60 bg-white rounded-xl border border-[#e5e7eb] shadow-lg z-50 py-1 max-h-64 overflow-y-auto"
              style={{ fontFamily: FONT }}
            >
              {availableAudPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="w-full text-left px-4 py-2 text-[12px] hover:bg-[#f8f9fc] transition-colors"
                  onClick={() => handleAddPreset(preset)}
                >
                  <span className="font-bold text-[#1a1a2e]">{preset.name}</span>
                  <span className="text-[#9ca3af] ml-1">{preset.age}</span>
                </button>
              ))}
              <div className="border-t border-[#e5e7eb] mt-1 pt-1">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-[12px] font-bold text-[#2163E7] hover:bg-[#f8f9fc] transition-colors"
                  onClick={handleAddCustom}
                >
                  + Custom Persona
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {data.audiences.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-[#9ca3af]" style={{ fontFamily: FONT }}>
            Select a persona template or create custom
          </p>
          <button
            type="button"
            className={BTN_SECONDARY + " mt-3"}
            onClick={() => setShowAudienceMenu(true)}
          >
            + Add Persona
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.audiences.map((aud) => (
            <div
              key={aud.id}
              className="relative bg-[#f8f9fc] rounded-xl border border-[#e5e7eb] p-4 space-y-3"
            >
              {/* Delete */}
              <button
                type="button"
                className="absolute top-3 right-3 text-[#9ca3af] hover:text-[#EF4444] transition-colors text-lg leading-none"
                onClick={() => handleDelete(aud.id)}
                aria-label="Delete persona"
              >
                &times;
              </button>

              {/* Icon + Name */}
              <div className="flex items-center gap-2">
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 28 28"
                  fill="none"
                  className="flex-shrink-0"
                >
                  <circle cx={14} cy={10} r={5} fill="#2163E7" opacity={0.15} />
                  <circle cx={14} cy={10} r={5} stroke="#2163E7" strokeWidth={1.2} />
                  <path
                    d="M5 25c0-5 4-9 9-9s9 4 9 9"
                    stroke="#2163E7"
                    strokeWidth={1.2}
                    fill="rgba(33,99,231,0.08)"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  className={INPUT_CLASS + " font-bold"}
                  value={aud.name}
                  onChange={(e) =>
                    handleFieldChange(aud.id, "name", e.target.value)
                  }
                  placeholder="Persona name"
                />
              </div>

              {/* Age */}
              <div>
                <label
                  className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider"
                  style={{ fontFamily: FONT }}
                >
                  Age Range
                </label>
                <input
                  type="text"
                  className={INPUT_CLASS + " mt-1"}
                  value={aud.age}
                  onChange={(e) =>
                    handleFieldChange(aud.id, "age", e.target.value)
                  }
                  placeholder="e.g. 25-34"
                />
              </div>

              {/* Pain */}
              <div>
                <label
                  className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider"
                  style={{ fontFamily: FONT }}
                >
                  Pain Point
                </label>
                <textarea
                  rows={2}
                  className={INPUT_CLASS + " mt-1 h-auto py-2 resize-none"}
                  value={aud.pain}
                  onChange={(e) =>
                    handleFieldChange(aud.id, "pain", e.target.value)
                  }
                  placeholder="Key frustration or unmet need"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Component ─── */

export function MarketTab({ data, onChange }: MarketTabProps) {
  return (
    <div className="space-y-6" style={{ fontFamily: FONT }}>
      <MarketSizeCard data={data} onChange={onChange} />
      <CompetitorsCard data={data} onChange={onChange} />
      <AudienceCard data={data} onChange={onChange} />
    </div>
  );
}

export default MarketTab;

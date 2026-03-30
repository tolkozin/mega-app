"use client";

import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { FONT, CARD_SHADOW } from "@/components/v2/charts/v2-chart-utils";
import { getPhaseProgress, type DataRow, type PhaseInfo } from "@/lib/scoring";
import type { RoadmapData, RoadmapMilestone, PhaseStatus, PhaseOverride } from "@/lib/types";

/* ─── Props ─── */

interface RoadmapTabProps {
  df: DataRow[];
  config: Record<string, unknown>;
  engine: string;
  roadmapData: RoadmapData;
  onRoadmapChange: (data: RoadmapData) => void;
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
  "h-9 px-3 rounded-lg border border-[#e5e7eb] focus:border-[#2163E7] focus:ring-2 focus:ring-[#2163e7]/20 outline-none text-sm w-full";

const BTN_PRIMARY =
  "bg-[#2163e7] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1a53c7] transition-colors";

const BTN_SECONDARY =
  "border border-[#e5e7eb] text-[#1a1a2e] text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#f8f9fc] transition-colors";

const PHASE_COLORS = ["#2163E7", "#7C3AED", "#059669"];

/* ─── Helpers ─── */

function num(row: DataRow, ...candidates: string[]): number {
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const key = Object.keys(row).find((k) => k.toLowerCase() === lc);
    if (key !== undefined) {
      const v = row[key];
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const n = Number(v);
        if (!isNaN(n)) return n;
      }
    }
  }
  return 0;
}

function detectAutoMilestones(df: DataRow[], engine: string): RoadmapMilestone[] {
  const milestones: RoadmapMilestone[] = [];

  // First revenue month
  for (const row of df) {
    const rev = num(
      row,
      "Total Gross Revenue",
      "Gross Revenue",
      "Revenue",
      "Total Revenue",
    );
    if (rev > 0) {
      milestones.push({
        id: "auto-first-revenue",
        name: "First Revenue",
        month: num(row, "Month"),
        description: "First month with revenue generated",
        type: "auto",
      });
      break;
    }
  }

  // Break-even month (cumulative profit >= 0)
  let cumProfit = 0;
  for (const row of df) {
    const np = num(row, "Net Profit");
    cumProfit += np;
    if (cumProfit >= 0 && np !== 0) {
      milestones.push({
        id: "auto-breakeven",
        name: "Break-Even",
        month: num(row, "Month"),
        description: "Cumulative profit turns positive",
        type: "auto",
      });
      break;
    }
  }

  // Profitability month (first month with positive net profit after month 1)
  for (let i = 1; i < df.length; i++) {
    const np = num(df[i], "Net Profit");
    if (np > 0) {
      milestones.push({
        id: "auto-profitable",
        name: "First Profitable Month",
        month: num(df[i], "Month"),
        description: "First month with positive net profit",
        type: "auto",
      });
      break;
    }
  }

  // Engine-specific milestones
  if (engine === "subscription" || engine === "saas") {
    // 1000 users/customers
    for (const row of df) {
      const users = num(
        row,
        "Active Users",
        "Active Subs",
        "Total Customers",
        "Active Seats",
      );
      if (users >= 1000) {
        milestones.push({
          id: "auto-1k-users",
          name: "1,000 Users",
          month: num(row, "Month"),
          description: "Reached 1,000 active users/customers",
          type: "auto",
        });
        break;
      }
    }
  }

  if (engine === "subscription" || engine === "saas") {
    // $100K MRR / ARR milestone
    for (const row of df) {
      const mrr = num(row, "MRR", "ARR");
      const threshold = num(row, "ARR") > 0 ? 1_000_000 : 100_000;
      const label = num(row, "ARR") > 0 ? "$1M ARR" : "$100K MRR";
      if (mrr >= threshold) {
        milestones.push({
          id: "auto-revenue-milestone",
          name: label,
          month: num(row, "Month"),
          description: `Reached ${label}`,
          type: "auto",
        });
        break;
      }
    }
  }

  return milestones;
}

/* ─── Timeline Visual ─── */

function TimelineVisual({
  phases,
  autoMilestones,
  customMilestones,
  totalMonths,
}: {
  phases: PhaseInfo[];
  autoMilestones: RoadmapMilestone[];
  customMilestones: RoadmapMilestone[];
  totalMonths: number;
}) {
  const allMilestones = [...autoMilestones, ...customMilestones].sort(
    (a, b) => a.month - b.month,
  );

  return (
    <div className="relative">
      {/* Phase bars */}
      <div className="flex gap-1 mb-2">
        {phases.map((phase, i) => {
          const widthPct =
            ((phase.endMonth - phase.startMonth + 1) / totalMonths) * 100;
          return (
            <div key={phase.label} style={{ width: `${widthPct}%`, minWidth: 0 }}>
              <div
                className="h-10 rounded-lg relative overflow-hidden"
                style={{ backgroundColor: `${PHASE_COLORS[i]}15` }}
              >
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{
                    width: `${phase.progress * 100}%`,
                    backgroundColor: `${PHASE_COLORS[i]}30`,
                  }}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold truncate px-1"
                  style={{ color: PHASE_COLORS[i] }}
                >
                  {phase.label} ({phase.startMonth}–{phase.endMonth})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Month markers */}
      <div className="relative h-6 mb-1">
        <div className="absolute inset-x-0 top-2 h-[2px] bg-[#e5e7eb] rounded-full" />
        {[1, Math.round(totalMonths / 4), Math.round(totalMonths / 2), Math.round((totalMonths * 3) / 4), totalMonths].map(
          (m) => (
            <span
              key={m}
              className="absolute -translate-x-1/2 text-[9px] text-[#9ca3af] font-semibold"
              style={{ left: `${((m - 1) / (totalMonths - 1)) * 100}%`, top: 8 }}
            >
              M{m}
            </span>
          ),
        )}
      </div>

      {/* Milestone markers */}
      {allMilestones.length > 0 && (
        <div className="relative h-5">
          {allMilestones.map((m) => {
            const leftPct = ((m.month - 1) / Math.max(totalMonths - 1, 1)) * 100;
            const isAuto = m.type === "auto";
            return (
              <div
                key={m.id}
                className="absolute -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                style={{ left: `${Math.min(Math.max(leftPct, 2), 98)}%` }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 border-white"
                  style={{
                    backgroundColor: isAuto ? "#F59E0B" : "#2163E7",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />
                {/* Tooltip on hover */}
                <span
                  className="absolute top-full mt-1 w-44 p-2 rounded-lg bg-[#1a1a2e] text-white text-[10px] leading-snug opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-center"
                  style={{ fontFamily: FONT }}
                >
                  <span className="font-bold">{m.name}</span>
                  <br />
                  M{m.month}: {m.description}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Milestones List ─── */

function MilestonesList({
  autoMilestones,
  customMilestones,
  onAdd,
  onUpdate,
  onDelete,
}: {
  autoMilestones: RoadmapMilestone[];
  customMilestones: RoadmapMilestone[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof RoadmapMilestone, value: string | number) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Auto milestones */}
      {autoMilestones.length > 0 && (
        <div>
          <h4
            className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2"
            style={{ fontFamily: FONT }}
          >
            Auto-Detected
          </h4>
          <div className="space-y-2">
            {autoMilestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A] px-4 py-3"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#F59E0B" }}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[12px] font-bold text-[#1a1a2e] block"
                    style={{ fontFamily: FONT }}
                  >
                    {m.name}
                  </span>
                  <span
                    className="text-[11px] text-[#6b7280]"
                    style={{ fontFamily: FONT }}
                  >
                    {m.description}
                  </span>
                </div>
                <span
                  className="text-[12px] font-bold text-[#F59E0B] flex-shrink-0"
                  style={{ fontFamily: FONT }}
                >
                  Month {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom milestones */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4
            className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]"
            style={{ fontFamily: FONT }}
          >
            Custom Milestones
          </h4>
          <button type="button" className={BTN_PRIMARY} onClick={onAdd}>
            + Add
          </button>
        </div>

        {customMilestones.length === 0 ? (
          <div className="py-8 text-center">
            <p
              className="text-[13px] text-[#9ca3af]"
              style={{ fontFamily: FONT }}
            >
              Add custom milestones to track your roadmap
            </p>
            <button
              type="button"
              className={BTN_SECONDARY + " mt-3"}
              onClick={onAdd}
            >
              + Add Milestone
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {customMilestones.map((m) => (
              <div
                key={m.id}
                className="relative flex items-start gap-3 bg-[#f8f9fc] rounded-xl border border-[#e5e7eb] px-4 py-3"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2"
                  style={{ backgroundColor: "#2163E7" }}
                />
                <div className="flex-1 min-w-0 grid grid-cols-[1fr_80px] gap-2">
                  <input
                    type="text"
                    className={INPUT_CLASS + " font-bold"}
                    value={m.name}
                    onChange={(e) => onUpdate(m.id, "name", e.target.value)}
                    placeholder="Milestone name"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-xs pointer-events-none">
                      M
                    </span>
                    <input
                      type="number"
                      min={1}
                      className={INPUT_CLASS + " pl-7"}
                      value={m.month || ""}
                      onChange={(e) =>
                        onUpdate(m.id, "month", parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>
                  <input
                    type="text"
                    className={INPUT_CLASS + " col-span-2"}
                    value={m.description}
                    onChange={(e) =>
                      onUpdate(m.id, "description", e.target.value)
                    }
                    placeholder="Description"
                  />
                </div>
                <button
                  type="button"
                  className="text-[#9ca3af] hover:text-[#EF4444] transition-colors text-lg leading-none mt-1"
                  onClick={() => onDelete(m.id)}
                  aria-label="Delete milestone"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Phase Detail Cards ─── */

const STATUS_OPTIONS: { key: PhaseStatus; label: string; color: string }[] = [
  { key: "not_started", label: "Not Started", color: "#9ca3af" },
  { key: "in_progress", label: "In Progress", color: "#2163E7" },
  { key: "completed", label: "Completed", color: "#10B981" },
];

function PhaseDetailCards({
  phases,
  phaseOverrides,
  onPhaseChange,
}: {
  phases: PhaseInfo[];
  phaseOverrides: Record<string, PhaseOverride>;
  onPhaseChange: (label: string, override: PhaseOverride) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {phases.map((phase, i) => {
        const override = phaseOverrides[phase.label] ?? { status: "not_started" as PhaseStatus, notes: "" };
        const statusOpt = STATUS_OPTIONS.find((s) => s.key === override.status) ?? STATUS_OPTIONS[0];

        return (
          <motion.div
            key={phase.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: "easeOut" as const,
              delay: 0.06 * i,
            }}
            className="bg-white rounded-2xl p-5"
            style={cardStyle}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[13px] font-extrabold"
                style={{ color: PHASE_COLORS[i], fontFamily: FONT }}
              >
                {phase.label}
              </span>
              <select
                className="text-[11px] font-bold px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer"
                style={{
                  color: statusOpt.color,
                  backgroundColor: `${statusOpt.color}15`,
                }}
                value={override.status}
                onChange={(e) =>
                  onPhaseChange(phase.label, { ...override, status: e.target.value as PhaseStatus })
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-[#6b7280] mb-3" style={{ fontFamily: FONT }}>
              Month {phase.startMonth} – {phase.endMonth} ({phase.endMonth - phase.startMonth + 1} months)
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-2 rounded-full mb-3"
              style={{ backgroundColor: "#f0f1f7" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${phase.progress * 100}%`,
                  backgroundColor: PHASE_COLORS[i],
                }}
              />
            </div>

            {/* Notes */}
            <textarea
              rows={2}
              className="w-full text-[11px] px-3 py-2 rounded-lg border border-[#e5e7eb] focus:border-[#2163E7] focus:ring-2 focus:ring-[#2163e7]/20 outline-none resize-none"
              style={{ fontFamily: FONT }}
              placeholder="Add notes..."
              value={override.notes}
              onChange={(e) =>
                onPhaseChange(phase.label, { ...override, notes: e.target.value })
              }
            />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */

export function RoadmapTab({
  df,
  config,
  engine,
  roadmapData,
  onRoadmapChange,
}: RoadmapTabProps) {
  const phases = useMemo(
    () => getPhaseProgress(config, df),
    [config, df],
  );

  const totalMonths = Number(config.total_months ?? config.totalMonths ?? 36);

  const autoMilestones = useMemo(
    () => detectAutoMilestones(df, engine),
    [df, engine],
  );

  const customMilestones = roadmapData.milestones.filter(
    (m) => m.type === "custom",
  );

  const handleAdd = useCallback(() => {
    onRoadmapChange({
      ...roadmapData,
      milestones: [
        ...roadmapData.milestones,
        {
          id: crypto.randomUUID(),
          name: "",
          month: 1,
          description: "",
          type: "custom",
        },
      ],
    });
  }, [roadmapData, onRoadmapChange]);

  const handleUpdate = useCallback(
    (id: string, field: keyof RoadmapMilestone, value: string | number) => {
      onRoadmapChange({
        ...roadmapData,
        milestones: roadmapData.milestones.map((m) =>
          m.id === id ? { ...m, [field]: value } : m,
        ),
      });
    },
    [roadmapData, onRoadmapChange],
  );

  const handleDelete = useCallback(
    (id: string) => {
      onRoadmapChange({
        ...roadmapData,
        milestones: roadmapData.milestones.filter((m) => m.id !== id),
      });
    },
    [roadmapData, onRoadmapChange],
  );

  const handlePhaseChange = useCallback(
    (label: string, override: PhaseOverride) => {
      onRoadmapChange({
        ...roadmapData,
        phaseOverrides: {
          ...(roadmapData.phaseOverrides ?? {}),
          [label]: override,
        },
      });
    },
    [roadmapData, onRoadmapChange],
  );

  if (df.length < 2) {
    return (
      <div
        className="flex items-center justify-center py-24"
        style={{ fontFamily: FONT }}
      >
        <p className="text-[15px]" style={{ color: "#9ca3af" }}>
          Not enough data to display roadmap.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: FONT }}>
      {/* Timeline */}
      <motion.div
        {...FADE_IN}
        className="bg-white rounded-2xl p-6"
        style={cardStyle}
      >
        <h3
          className="text-[15px] font-bold text-[#1a1a2e] mb-5"
          style={{ fontFamily: FONT }}
        >
          Timeline
        </h3>
        <TimelineVisual
          phases={phases}
          autoMilestones={autoMilestones}
          customMilestones={customMilestones}
          totalMonths={totalMonths}
        />
      </motion.div>

      {/* Phase Details */}
      <PhaseDetailCards
        phases={phases}
        phaseOverrides={roadmapData.phaseOverrides ?? {}}
        onPhaseChange={handlePhaseChange}
      />

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" as const, delay: 0.1 }}
        className="bg-white rounded-2xl p-6"
        style={cardStyle}
      >
        <h3
          className="text-[15px] font-bold text-[#1a1a2e] mb-5"
          style={{ fontFamily: FONT }}
        >
          Milestones
        </h3>
        <MilestonesList
          autoMilestones={autoMilestones}
          customMilestones={customMilestones}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </motion.div>
    </div>
  );
}

export default RoadmapTab;

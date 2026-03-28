"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { smooth, PALETTE, FONT, CARD_SHADOW } from "./v2-chart-utils";

/* ─── types ─── */
export type HealthStatus = "good" | "caution" | "bad" | "neutral";

export interface KPICardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  trendNeutral?: boolean;
  health: HealthStatus;
  sparkline?: number[];
  description?: string;
}

export interface V2KPIMetricGridProps {
  kpis: KPICardProps[];
  columns?: 2 | 3 | 4;
  initialCount?: number;
}

/* ─── health colors ─── */
const HEALTH_COLOR: Record<HealthStatus, string> = {
  good: PALETTE.green,
  caution: PALETTE.amber,
  bad: PALETTE.red,
  neutral: PALETTE.muted,
};

/* ─── single card ─── */
function V2KPICard({ label, value, trend, trendUp, trendNeutral, health, sparkline, description }: KPICardProps) {
  const [hovered, setHovered] = useState(false);
  const borderColor = HEALTH_COLOR[health];

  /* sparkline path */
  const sparkPath = useMemo(() => {
    if (!sparkline || sparkline.length < 2) return "";
    const w = 64;
    const h = 22;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const pts: [number, number][] = sparkline.map((v, i) => [
      (i / (sparkline.length - 1)) * w,
      h - ((v - min) / range) * h,
    ]);
    return smooth(pts);
  }, [sparkline]);

  /* trend badge color */
  const trendColor = trendNeutral ? PALETTE.muted : trendUp ? PALETTE.green : PALETTE.red;
  const trendBg = trendNeutral ? "#9ca3af18" : trendUp ? "#10B98118" : "#EF444418";

  return (
    <motion.div
      className="relative bg-white overflow-hidden cursor-default"
      style={{
        borderRadius: 12,
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.1)" : CARD_SHADOW,
        fontFamily: FONT,
        borderLeft: `3px solid ${borderColor}`,
        transition: "box-shadow 0.2s",
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="px-3.5 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* label row */}
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="inline-block w-[5px] h-[5px] rounded-full flex-shrink-0"
              style={{ background: borderColor }}
            />
            <span className="text-[10px] text-[#9ca3af] font-medium truncate">{label}</span>
          </div>

          {/* value + trend */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[18px] font-extrabold text-[#1a1a2e] leading-none tabular-nums">
              {value}
            </span>
            {trend && (
              <span
                className="text-[9.5px] font-bold rounded-full px-1.5 py-0.5 leading-none whitespace-nowrap"
                style={{ color: trendColor, background: trendBg }}
              >
                {trend}
              </span>
            )}
          </div>
        </div>

        {/* sparkline */}
        {sparkPath && (
          <svg viewBox="0 0 64 22" width={64} height={22} className="flex-shrink-0 mt-1">
            <motion.path
              d={sparkPath}
              fill="none"
              stroke={borderColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
        )}
      </div>

      {/* description tooltip on hover */}
      <AnimatePresence>
        {hovered && description && (
          <motion.div
            className="absolute left-0 right-0 bottom-0 px-3.5 pb-2.5 pt-1"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              background: "linear-gradient(to top, white 70%, transparent)",
            }}
          >
            <p className="text-[9px] text-[#9ca3af] leading-relaxed">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── grid wrapper ─── */
export function V2KPIMetricGrid({
  kpis,
  columns = 3,
  initialCount,
}: V2KPIMetricGridProps) {
  const [expanded, setExpanded] = useState(false);

  const showCount = initialCount && !expanded ? initialCount : kpis.length;
  const visible = kpis.slice(0, showCount);
  const hasMore = initialCount !== undefined && initialCount < kpis.length;

  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
        ? "grid-cols-2 sm:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3";

  return (
    <div>
      <div className={`grid ${colClass} gap-3`}>
        <AnimatePresence initial={false}>
          {visible.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
            >
              <V2KPICard {...kpi} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-3 mx-auto block text-[11px] font-bold rounded-full px-4 py-1.5 transition-colors"
          style={{
            color: PALETTE.blue,
            background: PALETTE.blue + "12",
            border: `1px solid ${PALETTE.blue}30`,
            fontFamily: FONT,
          }}
        >
          {expanded ? "Show less" : `Show all ${kpis.length} metrics`}
        </button>
      )}
    </div>
  );
}

export { V2KPICard };
export default V2KPIMetricGrid;

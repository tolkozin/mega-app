"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fmtK, fmtNum, PALETTE, FONT, CARD_SHADOW } from "./v2-chart-utils";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface V2DonutChartProps {
  title: string;
  subtitle?: string;
  segments: DonutSegment[];
  centerLabel?: string;
  centerSub?: string;
}

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 72;
const STROKE = 28;
const GAP_DEG = 1.5;

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = ((startAngle - 90) * Math.PI) / 180;
  const end = ((endAngle - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

export function V2DonutChart({
  title,
  subtitle,
  segments,
  centerLabel,
  centerSub,
}: V2DonutChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const total = useMemo(() => segments.reduce((s, seg) => s + seg.value, 0), [segments]);

  const arcs = useMemo(() => {
    const gapTotal = GAP_DEG * segments.length;
    const available = 360 - gapTotal;
    let cursor = 0;
    return segments.map((seg) => {
      const sweep = (seg.value / (total || 1)) * available;
      const start = cursor + GAP_DEG / 2;
      const end = start + sweep;
      cursor = end + GAP_DEG / 2;
      return { start, end, sweep };
    });
  }, [segments, total]);

  const hoveredSeg = hoverIdx !== null ? segments[hoverIdx] : null;
  const centerVal = hoveredSeg ? fmtK(hoveredSeg.value) : centerLabel ?? fmtK(total);
  const centerSubVal = hoveredSeg ? hoveredSeg.label : centerSub ?? "Total";

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ borderRadius: 16, boxShadow: CARD_SHADOW, fontFamily: FONT }}
    >
      {/* header */}
      <div className="px-5 pt-4 pb-0">
        <span className="text-[13px] font-extrabold text-[#1a1a2e]">{title}</span>
        {subtitle && <div className="text-[11px] text-[#9ca3af] mt-0.5">{subtitle}</div>}
      </div>

      <div className="flex items-center gap-4 px-5 pt-3 pb-4">
        {/* donut SVG */}
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="flex-shrink-0">
          <defs>
            <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
            </filter>
          </defs>

          {arcs.map((arc, i) => {
            const isHovered = hoverIdx === i;
            const isFaded = hoverIdx !== null && !isHovered;
            return (
              <motion.path
                key={i}
                d={describeArc(CX, CY, R, arc.start, arc.end)}
                fill="none"
                stroke={segments[i].color}
                strokeWidth={isHovered ? STROKE + 6 : STROKE}
                strokeLinecap="round"
                opacity={isFaded ? 0.35 : 1}
                filter={isHovered ? "url(#donutShadow)" : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                onPointerEnter={() => setHoverIdx(i)}
                onPointerLeave={() => setHoverIdx(null)}
                style={{ cursor: "pointer", transition: "stroke-width 0.18s, opacity 0.18s" }}
              />
            );
          })}

          {/* center text */}
          <AnimatePresence mode="wait">
            <motion.g
              key={centerVal}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <text x={CX} y={CY - 2} textAnchor="middle" fontSize={18} fontWeight={800} fill={PALETTE.text}>
                {centerVal}
              </text>
              <text x={CX} y={CY + 14} textAnchor="middle" fontSize={10} fill={PALETTE.muted}>
                {centerSubVal}
              </text>
            </motion.g>
          </AnimatePresence>
        </svg>

        {/* legend */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {segments.map((seg, i) => {
            const isHovered = hoverIdx === i;
            const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : "0";
            return (
              <motion.div
                key={seg.label}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 cursor-pointer"
                style={{
                  background: isHovered ? seg.color + "12" : "transparent",
                  border: `1px solid ${isHovered ? seg.color + "40" : "transparent"}`,
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onPointerEnter={() => setHoverIdx(i)}
                onPointerLeave={() => setHoverIdx(null)}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: seg.color }}
                />
                <span className="text-[10.5px] text-[#6b7280] flex-1 truncate">{seg.label}</span>
                <span className="text-[10px] text-[#9ca3af] tabular-nums">{pct}%</span>
                <span className="text-[10.5px] font-bold text-[#1a1a2e] tabular-nums">{fmtK(seg.value)}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default V2DonutChart;

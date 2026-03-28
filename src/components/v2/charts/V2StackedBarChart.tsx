"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  roundedTopBar,
  makeYMapper,
  padRange,
  fmtK,
  PALETTE,
  FONT,
} from "./v2-chart-utils";
import { V2ChartCard, FloatingTooltip, TipLabel, TipRow } from "./V2ChartCard";

export interface BarSegment {
  label: string;
  data: number[];
  color: string;
}

export interface V2StackedBarChartProps {
  title: string;
  subtitle?: string;
  segments: BarSegment[];
  months: number[];
}

const W = 640;
const H = 230;
const PAD = { t: 16, r: 14, b: 28, l: 52 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const BASE_Y = PAD.t + PLOT_H;
const GRID_ROWS = 5;
const BAR_GAP = 0.3; // fraction of slot

export function V2StackedBarChart({
  title,
  subtitle,
  segments,
  months,
}: V2StackedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const n = months.length;

  /* compute stacked totals */
  const totals = useMemo(() => {
    return Array.from({ length: n }, (_, i) =>
      segments.reduce((sum, seg) => sum + (seg.data[i] ?? 0), 0)
    );
  }, [segments, n]);

  const [yMin, yMax] = useMemo(() => padRange(totals), [totals]);
  const mapY = useMemo(() => makeYMapper(0, yMax, BASE_Y, PLOT_H), [yMax]);

  const slotW = PLOT_W / n;
  const barW = slotW * (1 - BAR_GAP);
  const barOffset = (slotW - barW) / 2;

  const yTicks = useMemo(() => {
    const step = yMax / GRID_ROWS;
    return Array.from({ length: GRID_ROWS + 1 }, (_, i) => step * i);
  }, [yMax]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const idx = Math.floor((mx - PAD.l) / slotW);
      setHover(Math.max(0, Math.min(n - 1, idx)));
      setTip({ x: e.clientX, y: e.clientY });
    },
    [n, slotW]
  );

  const legend = useMemo(
    () => segments.map((s) => ({ color: s.color, label: s.label })),
    [segments]
  );

  return (
    <V2ChartCard title={title} subtitle={subtitle} legend={legend}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ fontFamily: FONT }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => { setHover(null); setTip(null); }}
      >
        {/* grid */}
        {yTicks.map((t) => (
          <line key={t} x1={PAD.l} y1={mapY(t)} x2={W - PAD.r} y2={mapY(t)} stroke={PALETTE.grid} strokeWidth={1} />
        ))}

        {/* Y labels */}
        {yTicks.map((t) => (
          <text key={`yl-${t}`} x={PAD.l - 8} y={mapY(t) + 3.5} textAnchor="end" fontSize={9.5} fill={PALETTE.axis}>
            {fmtK(t)}
          </text>
        ))}

        {/* X labels */}
        {months.map((m, i) => (
          <text key={i} x={PAD.l + i * slotW + slotW / 2} y={BASE_Y + 16} textAnchor="middle" fontSize={9} fill={hover === i ? PALETTE.blue : PALETTE.axis} fontWeight={hover === i ? 700 : 400}>
            M{m}
          </text>
        ))}

        {/* bars */}
        {months.map((_, i) => {
          let cumY = BASE_Y;
          return (
            <g key={i} opacity={hover !== null && hover !== i ? 0.5 : 1} style={{ transition: "opacity 0.15s" }}>
              {segments.map((seg, si) => {
                const val = seg.data[i] ?? 0;
                const h = ((val) / (yMax || 1)) * PLOT_H;
                const y = cumY - h;
                cumY = y;
                const isTop = si === segments.length - 1;
                const bx = PAD.l + i * slotW + barOffset;
                const path = isTop
                  ? roundedTopBar(bx, y, barW, h, 4)
                  : `M${bx},${y + h} V${y} H${bx + barW} V${y + h} Z`;
                return (
                  <motion.path
                    key={`${i}-${si}`}
                    d={path}
                    fill={seg.color}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.02 + si * 0.05, ease: "easeOut" }}
                    style={{ transformOrigin: `${bx + barW / 2}px ${BASE_Y}px` }}
                  />
                );
              })}
            </g>
          );
        })}

        {/* hover highlight */}
        {hover !== null && (
          <rect
            x={PAD.l + hover * slotW}
            y={PAD.t}
            width={slotW}
            height={PLOT_H}
            fill={PALETTE.blue}
            opacity={0.04}
            rx={3}
          />
        )}
      </svg>

      {hover !== null && tip && (
        <FloatingTooltip x={tip.x} y={tip.y}>
          <TipLabel>M{months[hover]}</TipLabel>
          {segments.map((seg) => (
            <TipRow key={seg.label} label={seg.label} value={fmtK(seg.data[hover] ?? 0)} color={seg.color} />
          ))}
          <TipRow label="Total" value={fmtK(totals[hover])} color="#fff" />
        </FloatingTooltip>
      )}
    </V2ChartCard>
  );
}

export default V2StackedBarChart;

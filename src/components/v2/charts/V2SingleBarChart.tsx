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

export interface V2SingleBarChartProps {
  title: string;
  subtitle?: string;
  data: number[];
  months: number[];
  color?: string;
  dataLabel?: string;
  formatter?: (v: number) => string;
}

const W = 640;
const H = 224;
const PAD = { t: 16, r: 14, b: 28, l: 52 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const BASE_Y = PAD.t + PLOT_H;
const GRID_ROWS = 5;
const BAR_GAP = 0.3;

export function V2SingleBarChart({
  title,
  subtitle,
  data,
  months,
  color = PALETTE.blue,
  dataLabel = "Value",
  formatter = fmtK,
}: V2SingleBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const n = data.length;
  const [, yMax] = useMemo(() => padRange(data), [data]);
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

  const momGrowth = useCallback(
    (i: number) => {
      if (i === 0 || data[i - 1] === 0) return null;
      return ((data[i] - data[i - 1]) / Math.abs(data[i - 1])) * 100;
    },
    [data]
  );

  const gradId = `singleBarGrad-${color.replace("#", "")}`;

  return (
    <V2ChartCard title={title} subtitle={subtitle}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ fontFamily: FONT }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") { setHover(null); setTip(null); } }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.55} />
          </linearGradient>
        </defs>

        {/* grid */}
        {yTicks.map((t) => (
          <line key={t} x1={PAD.l} y1={mapY(t)} x2={W - PAD.r} y2={mapY(t)} stroke={PALETTE.grid} strokeWidth={1} />
        ))}

        {/* Y labels */}
        {yTicks.map((t) => (
          <text key={`yl-${t}`} x={PAD.l - 8} y={mapY(t) + 3.5} textAnchor="end" fontSize={9.5} fill={PALETTE.axis}>
            {formatter(t)}
          </text>
        ))}

        {/* X labels */}
        {months.map((m, i) => {
          const show = n <= 18 || i % Math.ceil(n / 12) === 0 || i === n - 1;
          if (!show) return null;
          return (
            <text key={i} x={PAD.l + i * slotW + slotW / 2} y={BASE_Y + 16} textAnchor="middle" fontSize={9} fill={hover === i ? PALETTE.blue : PALETTE.axis} fontWeight={hover === i ? 700 : 400}>
              M{m}
            </text>
          );
        })}

        {/* bars */}
        {data.map((val, i) => {
          const h = (Math.max(val, 0) / (yMax || 1)) * PLOT_H;
          const bx = PAD.l + i * slotW + barOffset;
          const by = BASE_Y - h;
          return (
            <motion.path
              key={i}
              d={roundedTopBar(bx, by, barW, h, 4)}
              fill={`url(#${gradId})`}
              opacity={hover !== null && hover !== i ? 0.45 : 1}
              style={{ transition: "opacity 0.15s", transformOrigin: `${bx + barW / 2}px ${BASE_Y}px` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.45, delay: i * 0.02, ease: "easeOut" }}
            />
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
          <TipRow label={dataLabel} value={formatter(data[hover])} color={PALETTE.ltBlue} />
          {(() => {
            const g = momGrowth(hover);
            if (g === null) return null;
            const col = g >= 0 ? PALETTE.green : PALETTE.red;
            return <TipRow label="MoM" value={`${g >= 0 ? "+" : ""}${g.toFixed(1)}%`} color={col} />;
          })()}
        </FloatingTooltip>
      )}
    </V2ChartCard>
  );
}

export default V2SingleBarChart;

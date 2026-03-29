"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  smooth,
  areaPath,
  makeYMapper,
  padRange,
  fmtK,
  PALETTE,
  FONT,
} from "./v2-chart-utils";
import { V2ChartCard, FloatingTooltip, TipLabel, TipRow } from "./V2ChartCard";

export interface V2LineReferenceChartProps {
  title: string;
  subtitle?: string;
  data: number[];
  reference: number;
  referenceLabel: string;
  months: number[];
  color?: string;
  unit?: string;
  metricLabel?: string;
  goodAbove?: boolean;
  formatter?: (v: number) => string;
}

const W = 640;
const H = 224;
const PAD = { t: 18, r: 14, b: 28, l: 52 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const BASE_Y = PAD.t + PLOT_H;
const GRID_ROWS = 5;

export function V2LineReferenceChart({
  title,
  subtitle,
  data,
  reference,
  referenceLabel,
  months,
  color = PALETTE.blue,
  unit,
  metricLabel = "Value",
  goodAbove = true,
  formatter = fmtK,
}: V2LineReferenceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const n = data.length;

  const allVals = useMemo(() => [...data, reference], [data, reference]);
  const [yMin, yMax] = useMemo(() => padRange(allVals), [allVals]);
  const mapY = useMemo(() => makeYMapper(yMin, yMax, BASE_Y, PLOT_H), [yMin, yMax]);
  const xAt = useCallback((i: number) => PAD.l + (i / Math.max(n - 1, 1)) * PLOT_W, [n]);

  const pts = useMemo<[number, number][]>(() => data.map((v, i) => [xAt(i), mapY(v)]), [data, xAt, mapY]);
  const linePath = useMemo(() => smooth(pts), [pts]);

  const refY = mapY(reference);

  /* zone fill: above or below reference */
  const goodColor = PALETTE.green;
  const badColor = PALETTE.red;

  /* clipping above reference line => "good" zone */
  const aboveClipId = "refAbove";
  const belowClipId = "refBelow";

  const yTicks = useMemo(() => {
    const step = (yMax - yMin) / GRID_ROWS;
    return Array.from({ length: GRID_ROWS + 1 }, (_, i) => yMin + step * i);
  }, [yMin, yMax]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const idx = Math.round(((mx - PAD.l) / PLOT_W) * (n - 1));
      setHover(Math.max(0, Math.min(n - 1, idx)));
      setTip({ x: e.clientX, y: e.clientY });
    },
    [n]
  );

  useEffect(() => {
    if (hover === null) return;
    const handler = (e: TouchEvent) => {
      if (!svgRef.current?.contains(e.target as Node)) {
        setHover(null);
        setTip(null);
      }
    };
    document.addEventListener("touchstart", handler);
    return () => document.removeEventListener("touchstart", handler);
  }, [hover]);

  const monthLabel = useCallback(
    (i: number) => (months[i] !== undefined ? `M${months[i]}` : `M${i + 1}`),
    [months]
  );

  const legend = useMemo(
    () => [
      { color, label: metricLabel },
      { color: PALETTE.muted, label: referenceLabel, dash: true },
    ],
    [color, metricLabel, referenceLabel]
  );

  const areaD = useMemo(() => areaPath(pts, BASE_Y), [pts]);

  return (
    <V2ChartCard title={title} subtitle={subtitle} legend={legend}>
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
          {/* clip above reference */}
          <clipPath id={aboveClipId}>
            <rect x={PAD.l} y={PAD.t} width={PLOT_W} height={refY - PAD.t} />
          </clipPath>
          {/* clip below reference */}
          <clipPath id={belowClipId}>
            <rect x={PAD.l} y={refY} width={PLOT_W} height={BASE_Y - refY} />
          </clipPath>
        </defs>

        {/* grid */}
        {yTicks.map((t) => (
          <line key={t} x1={PAD.l} y1={mapY(t)} x2={W - PAD.r} y2={mapY(t)} stroke={PALETTE.grid} strokeWidth={1} />
        ))}

        {/* zone fill above reference */}
        <path
          d={areaD}
          fill={goodAbove ? goodColor : badColor}
          opacity={0.06}
          clipPath={`url(#${aboveClipId})`}
        />

        {/* zone fill below reference */}
        <path
          d={areaD}
          fill={goodAbove ? badColor : goodColor}
          opacity={0.06}
          clipPath={`url(#${belowClipId})`}
        />

        {/* reference line */}
        <line
          x1={PAD.l}
          y1={refY}
          x2={W - PAD.r}
          y2={refY}
          stroke={PALETTE.muted}
          strokeWidth={1.2}
          strokeDasharray="6 4"
        />
        <text
          x={W - PAD.r + 4}
          y={refY + 3.5}
          fontSize={8.5}
          fill={PALETTE.muted}
          fontWeight={600}
        >
          {referenceLabel}
        </text>

        {/* Y labels */}
        {yTicks.map((t) => (
          <text key={`yl-${t}`} x={PAD.l - 8} y={mapY(t) + 3.5} textAnchor="end" fontSize={9.5} fill={PALETTE.axis}>
            {formatter(t)}
          </text>
        ))}

        {/* X labels */}
        {data.map((_, i) => {
          const show = n <= 18 || i % Math.ceil(n / 12) === 0 || i === n - 1;
          if (!show) return null;
          return (
            <text key={i} x={xAt(i)} y={BASE_Y + 16} textAnchor="middle" fontSize={9} fill={hover === i ? PALETTE.blue : PALETTE.axis} fontWeight={hover === i ? 700 : 400}>
              {monthLabel(i)}
            </text>
          );
        })}

        {/* metric line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* hover */}
        {hover !== null && (
          <g>
            <line x1={xAt(hover)} y1={PAD.t} x2={xAt(hover)} y2={BASE_Y} stroke={color} strokeWidth={1} opacity={0.2} />
            <circle cx={xAt(hover)} cy={pts[hover][1]} r={4.5} fill="#fff" stroke={color} strokeWidth={2} />
          </g>
        )}
      </svg>

      {hover !== null && tip && (
        <FloatingTooltip x={tip.x} y={tip.y}>
          <TipLabel>{monthLabel(hover)}</TipLabel>
          <TipRow label={metricLabel} value={formatter(data[hover])} color={color} />
          <TipRow label={referenceLabel} value={formatter(reference)} color={PALETTE.muted} />
          {(() => {
            const delta = data[hover] - reference;
            const isGood = goodAbove ? delta >= 0 : delta <= 0;
            const sign = delta >= 0 ? "+" : "";
            return (
              <TipRow
                label="Delta"
                value={`${sign}${formatter(delta)}`}
                color={isGood ? PALETTE.green : PALETTE.red}
              />
            );
          })()}
        </FloatingTooltip>
      )}
    </V2ChartCard>
  );
}

export default V2LineReferenceChart;

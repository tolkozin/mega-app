"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
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
import { V2ChartCard, FloatingTooltip, TipLabel, TipRow, type LegendItem } from "./V2ChartCard";

/* ─── types ─── */
export interface V2GradientAreaChartProps {
  title: string;
  subtitle?: string;
  data: number[];
  pessimistic?: number[];
  optimistic?: number[];
  months: number[];
  phaseLines?: number[];
  breakEvenMonth?: number | null;
  formatter?: (v: number) => string;
}

/* ─── constants ─── */
const W = 640;
const H = 230;
const PAD = { t: 18, r: 14, b: 28, l: 52 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const BASE_Y = PAD.t + PLOT_H;
const GRID_ROWS = 5;

export function V2GradientAreaChart({
  title,
  subtitle,
  data,
  pessimistic,
  optimistic,
  months,
  phaseLines,
  breakEvenMonth,
  formatter = fmtK,
}: V2GradientAreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const n = data.length;

  /* combine all series for range */
  const allVals = useMemo(() => {
    const vals = [...data];
    if (pessimistic) vals.push(...pessimistic);
    if (optimistic) vals.push(...optimistic);
    return vals;
  }, [data, pessimistic, optimistic]);

  const [yMin, yMax] = useMemo(() => padRange(allVals), [allVals]);
  const mapY = useMemo(() => makeYMapper(yMin, yMax, BASE_Y, PLOT_H), [yMin, yMax]);

  /* points */
  const xAt = useCallback(
    (i: number) => PAD.l + (i / Math.max(n - 1, 1)) * PLOT_W,
    [n]
  );

  const basePts = useMemo<[number, number][]>(
    () => data.map((v, i) => [xAt(i), mapY(v)]),
    [data, xAt, mapY]
  );
  const pessPts = useMemo<[number, number][] | null>(
    () => pessimistic?.map((v, i) => [xAt(i), mapY(v)]) ?? null,
    [pessimistic, xAt, mapY]
  );
  const optPts = useMemo<[number, number][] | null>(
    () => optimistic?.map((v, i) => [xAt(i), mapY(v)]) ?? null,
    [optimistic, xAt, mapY]
  );

  /* paths */
  const baseLine = useMemo(() => smooth(basePts), [basePts]);
  const baseArea = useMemo(() => areaPath(basePts, BASE_Y), [basePts]);
  const pessLine = useMemo(() => (pessPts ? smooth(pessPts) : ""), [pessPts]);
  const optLine = useMemo(() => (optPts ? smooth(optPts) : ""), [optPts]);

  /* Y axis ticks */
  const yTicks = useMemo(() => {
    const step = (yMax - yMin) / GRID_ROWS;
    return Array.from({ length: GRID_ROWS + 1 }, (_, i) => yMin + step * i);
  }, [yMin, yMax]);

  /* hover handler */
  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = W / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      const idx = Math.round(((mx - PAD.l) / PLOT_W) * (n - 1));
      const clamped = Math.max(0, Math.min(n - 1, idx));
      setHover(clamped);
      setTip({ x: e.clientX, y: e.clientY });
    },
    [n]
  );

  const legend = useMemo((): LegendItem[] => {
    const items: LegendItem[] = [{ color: PALETTE.blue, label: "Base" }];
    if (optimistic) items.push({ color: PALETTE.green, label: "Optimistic", dot: true });
    if (pessimistic) items.push({ color: PALETTE.red, label: "Pessimistic", dash: true });
    return items;
  }, [optimistic, pessimistic]);

  const monthLabel = useCallback(
    (i: number) => (months[i] !== undefined ? `M${months[i]}` : `M${i + 1}`),
    [months]
  );

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
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.blue} stopOpacity={0.18} />
            <stop offset="100%" stopColor={PALETTE.blue} stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* grid lines */}
        {yTicks.map((t) => (
          <line
            key={t}
            x1={PAD.l}
            y1={mapY(t)}
            x2={W - PAD.r}
            y2={mapY(t)}
            stroke={PALETTE.grid}
            strokeWidth={1}
          />
        ))}

        {/* Y labels */}
        {yTicks.map((t) => (
          <text
            key={`yl-${t}`}
            x={PAD.l - 8}
            y={mapY(t) + 3.5}
            textAnchor="end"
            fontSize={9.5}
            fill={PALETTE.axis}
          >
            {formatter(t)}
          </text>
        ))}

        {/* X labels */}
        {data.map((_, i) => {
          const show = n <= 18 || i % Math.ceil(n / 12) === 0 || i === n - 1;
          if (!show) return null;
          return (
            <text
              key={`xl-${i}`}
              x={xAt(i)}
              y={BASE_Y + 16}
              textAnchor="middle"
              fontSize={9}
              fill={hover === i ? PALETTE.blue : PALETTE.axis}
              fontWeight={hover === i ? 700 : 400}
            >
              {monthLabel(i)}
            </text>
          );
        })}

        {/* phase lines */}
        {phaseLines?.map((m) => {
          const idx = months.indexOf(m);
          if (idx < 0) return null;
          return (
            <line
              key={`ph-${m}`}
              x1={xAt(idx)}
              y1={PAD.t}
              x2={xAt(idx)}
              y2={BASE_Y}
              stroke={PALETTE.axis}
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.5}
            />
          );
        })}

        {/* area fill */}
        <motion.path
          d={baseArea}
          fill="url(#areaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* base line */}
        <motion.path
          d={baseLine}
          fill="none"
          stroke={PALETTE.blue}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* optimistic line */}
        {optLine && (
          <motion.path
            d={optLine}
            fill="none"
            stroke={PALETTE.green}
            strokeWidth={1.8}
            strokeDasharray="3 4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
          />
        )}

        {/* pessimistic line */}
        {pessLine && (
          <motion.path
            d={pessLine}
            fill="none"
            stroke={PALETTE.red}
            strokeWidth={1.8}
            strokeDasharray="6 4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
          />
        )}

        {/* break-even annotation */}
        {breakEvenMonth != null && (() => {
          const idx = months.indexOf(breakEvenMonth);
          if (idx < 0) return null;
          const bx = xAt(idx);
          return (
            <g>
              <line x1={bx} y1={PAD.t} x2={bx} y2={BASE_Y} stroke={PALETTE.green} strokeWidth={1.5} strokeDasharray="4 3" />
              <rect x={bx - 36} y={PAD.t - 2} width={72} height={16} rx={4} fill={PALETTE.green} />
              <text x={bx} y={PAD.t + 10} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#fff">
                Break-even
              </text>
            </g>
          );
        })()}

        {/* crosshair + dots on hover */}
        {hover !== null && (
          <g>
            <line
              x1={xAt(hover)}
              y1={PAD.t}
              x2={xAt(hover)}
              y2={BASE_Y}
              stroke={PALETTE.blue}
              strokeWidth={1}
              opacity={0.3}
            />
            <circle cx={xAt(hover)} cy={basePts[hover][1]} r={4.5} fill="#fff" stroke={PALETTE.blue} strokeWidth={2} />
            {optPts && (
              <circle cx={xAt(hover)} cy={optPts[hover][1]} r={3.5} fill="#fff" stroke={PALETTE.green} strokeWidth={1.5} />
            )}
            {pessPts && (
              <circle cx={xAt(hover)} cy={pessPts[hover][1]} r={3.5} fill="#fff" stroke={PALETTE.red} strokeWidth={1.5} />
            )}
          </g>
        )}
      </svg>

      {/* tooltip */}
      {hover !== null && tip && (
        <FloatingTooltip x={tip.x} y={tip.y}>
          <TipLabel>{monthLabel(hover)}</TipLabel>
          <TipRow label="Base" value={formatter(data[hover])} color={PALETTE.ltBlue} />
          {optimistic && <TipRow label="Optimistic" value={formatter(optimistic[hover])} color={PALETTE.green} />}
          {pessimistic && <TipRow label="Pessimistic" value={formatter(pessimistic[hover])} color={PALETTE.red} />}
          {hover > 0 && data[hover - 1] !== 0 && (() => {
            const g = ((data[hover] - data[hover - 1]) / Math.abs(data[hover - 1])) * 100;
            return <TipRow label="MoM" value={`${g >= 0 ? "+" : ""}${g.toFixed(1)}%`} color={g >= 0 ? "#10B981" : "#EF4444"} />;
          })()}
        </FloatingTooltip>
      )}
    </V2ChartCard>
  );
}

export default V2GradientAreaChart;

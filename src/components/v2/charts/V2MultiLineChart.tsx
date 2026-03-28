"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  smooth,
  makeYMapper,
  padRange,
  fmtK,
  PALETTE,
  FONT,
} from "./v2-chart-utils";
import { V2ChartCard, FloatingTooltip, TipLabel, TipRow, type LegendItem } from "./V2ChartCard";

export interface V2MultiLineChartProps {
  title: string;
  subtitle?: string;
  data: number[];
  pessimistic?: number[];
  optimistic?: number[];
  months: number[];
  phaseLines?: number[];
  formatter?: (v: number) => string;
  metricName?: string;
}

const W = 640;
const H = 224;
const PAD = { t: 16, r: 14, b: 28, l: 52 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const BASE_Y = PAD.t + PLOT_H;
const GRID_ROWS = 5;

export function V2MultiLineChart({
  title,
  subtitle,
  data,
  pessimistic,
  optimistic,
  months,
  phaseLines,
  formatter = fmtK,
  metricName,
}: V2MultiLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const n = data.length;

  const allVals = useMemo(() => {
    const vals = [...data];
    if (pessimistic) vals.push(...pessimistic);
    if (optimistic) vals.push(...optimistic);
    return vals;
  }, [data, pessimistic, optimistic]);

  const [yMin, yMax] = useMemo(() => padRange(allVals), [allVals]);
  const mapY = useMemo(() => makeYMapper(yMin, yMax, BASE_Y, PLOT_H), [yMin, yMax]);
  const xAt = useCallback((i: number) => PAD.l + (i / Math.max(n - 1, 1)) * PLOT_W, [n]);

  const basePts = useMemo<[number, number][]>(() => data.map((v, i) => [xAt(i), mapY(v)]), [data, xAt, mapY]);
  const pessPts = useMemo<[number, number][] | null>(() => pessimistic?.map((v, i) => [xAt(i), mapY(v)]) ?? null, [pessimistic, xAt, mapY]);
  const optPts = useMemo<[number, number][] | null>(() => optimistic?.map((v, i) => [xAt(i), mapY(v)]) ?? null, [optimistic, xAt, mapY]);

  const baseLine = useMemo(() => smooth(basePts), [basePts]);
  const pessLine = useMemo(() => (pessPts ? smooth(pessPts) : ""), [pessPts]);
  const optLine = useMemo(() => (optPts ? smooth(optPts) : ""), [optPts]);

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

  const monthLabel = useCallback(
    (i: number) => (months[i] !== undefined ? `M${months[i]}` : `M${i + 1}`),
    [months]
  );

  const legend = useMemo((): LegendItem[] => {
    const items: LegendItem[] = [{ color: PALETTE.blue, label: metricName ?? "Base" }];
    if (optimistic) items.push({ color: PALETTE.green, label: "Optimistic", dot: true });
    if (pessimistic) items.push({ color: PALETTE.red, label: "Pessimistic", dash: true });
    return items;
  }, [optimistic, pessimistic, metricName]);

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

        {/* phase lines */}
        {phaseLines?.map((m) => {
          const idx = months.indexOf(m);
          if (idx < 0) return null;
          return <line key={`ph-${m}`} x1={xAt(idx)} y1={PAD.t} x2={xAt(idx)} y2={BASE_Y} stroke={PALETTE.axis} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />;
        })}

        {/* lines */}
        <motion.path d={baseLine} fill="none" stroke={PALETTE.blue} strokeWidth={2.5} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeOut" }} />

        {optLine && (
          <motion.path d={optLine} fill="none" stroke={PALETTE.green} strokeWidth={1.8} strokeDasharray="3 4" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.12, ease: "easeOut" }} />
        )}
        {pessLine && (
          <motion.path d={pessLine} fill="none" stroke={PALETTE.red} strokeWidth={1.8} strokeDasharray="6 4" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.22, ease: "easeOut" }} />
        )}

        {/* hover dots */}
        {hover !== null && (
          <g>
            <line x1={xAt(hover)} y1={PAD.t} x2={xAt(hover)} y2={BASE_Y} stroke={PALETTE.blue} strokeWidth={1} opacity={0.2} />
            <circle cx={xAt(hover)} cy={basePts[hover][1]} r={4.5} fill="#fff" stroke={PALETTE.blue} strokeWidth={2} />
            {optPts && <circle cx={xAt(hover)} cy={optPts[hover][1]} r={3.5} fill="#fff" stroke={PALETTE.green} strokeWidth={1.5} />}
            {pessPts && <circle cx={xAt(hover)} cy={pessPts[hover][1]} r={3.5} fill="#fff" stroke={PALETTE.red} strokeWidth={1.5} />}
          </g>
        )}
      </svg>

      {hover !== null && tip && (
        <FloatingTooltip x={tip.x} y={tip.y}>
          <TipLabel>{monthLabel(hover)}</TipLabel>
          <TipRow label={metricName ?? "Base"} value={formatter(data[hover])} color={PALETTE.ltBlue} />
          {optimistic && <TipRow label="Optimistic" value={formatter(optimistic[hover])} color={PALETTE.green} />}
          {pessimistic && <TipRow label="Pessimistic" value={formatter(pessimistic[hover])} color={PALETTE.red} />}
        </FloatingTooltip>
      )}
    </V2ChartCard>
  );
}

export default V2MultiLineChart;

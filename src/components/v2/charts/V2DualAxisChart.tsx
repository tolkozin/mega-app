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
import { V2ChartCard, FloatingTooltip, TipLabel, TipRow } from "./V2ChartCard";

export interface V2DualAxisChartProps {
  title: string;
  subtitle?: string;
  leftData: number[];
  rightData: (number | null)[];
  months: number[];
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
}

const W = 640;
const H = 230;
const PAD = { t: 16, r: 52, b: 28, l: 52 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const BASE_Y = PAD.t + PLOT_H;
const GRID_ROWS = 5;

export function V2DualAxisChart({
  title,
  subtitle,
  leftData,
  rightData,
  months,
  leftLabel = "Left",
  rightLabel = "Right",
  leftColor = PALETTE.blue,
  rightColor = PALETTE.purple,
}: V2DualAxisChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const n = leftData.length;

  /* separate Y ranges */
  const [lMin, lMax] = useMemo(() => padRange(leftData), [leftData]);
  const rightNonNull = useMemo(() => rightData.filter((v): v is number => v !== null), [rightData]);
  const [rMin, rMax] = useMemo(() => (rightNonNull.length > 0 ? padRange(rightNonNull) : [0, 10]), [rightNonNull]);

  const mapYL = useMemo(() => makeYMapper(lMin, lMax, BASE_Y, PLOT_H), [lMin, lMax]);
  const mapYR = useMemo(() => makeYMapper(rMin, rMax, BASE_Y, PLOT_H), [rMin, rMax]);

  const xAt = useCallback((i: number) => PAD.l + (i / Math.max(n - 1, 1)) * PLOT_W, [n]);

  const leftPts = useMemo<[number, number][]>(() => leftData.map((v, i) => [xAt(i), mapYL(v)]), [leftData, xAt, mapYL]);
  const rightPts = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [];
    rightData.forEach((v, i) => {
      if (v !== null) pts.push([xAt(i), mapYR(v)]);
    });
    return pts;
  }, [rightData, xAt, mapYR]);

  const leftLine = useMemo(() => smooth(leftPts), [leftPts]);
  const rightLine = useMemo(() => (rightPts.length >= 2 ? smooth(rightPts) : ""), [rightPts]);

  /* Y ticks for left axis */
  const lTicks = useMemo(() => {
    const step = (lMax - lMin) / GRID_ROWS;
    return Array.from({ length: GRID_ROWS + 1 }, (_, i) => lMin + step * i);
  }, [lMin, lMax]);

  /* Y ticks for right axis */
  const rTicks = useMemo(() => {
    const step = (rMax - rMin) / GRID_ROWS;
    return Array.from({ length: GRID_ROWS + 1 }, (_, i) => rMin + step * i);
  }, [rMin, rMax]);

  /* profitable zone: where leftData > 0 (positive) */
  const profitableZone = useMemo(() => {
    const zones: { start: number; end: number }[] = [];
    let start: number | null = null;
    leftData.forEach((v, i) => {
      if (v > 0 && start === null) start = i;
      if ((v <= 0 || i === leftData.length - 1) && start !== null) {
        zones.push({ start, end: v > 0 ? i : i - 1 });
        start = null;
      }
    });
    return zones;
  }, [leftData]);

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

  const legend = useMemo(
    () => [
      { color: leftColor, label: leftLabel },
      { color: rightColor, label: rightLabel, dash: true },
    ],
    [leftColor, rightColor, leftLabel, rightLabel]
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
        {/* grid */}
        {lTicks.map((t) => (
          <line key={t} x1={PAD.l} y1={mapYL(t)} x2={W - PAD.r} y2={mapYL(t)} stroke={PALETTE.grid} strokeWidth={1} />
        ))}

        {/* profitable zones */}
        {profitableZone.map((z, i) => (
          <rect
            key={i}
            x={xAt(z.start)}
            y={PAD.t}
            width={xAt(z.end) - xAt(z.start)}
            height={PLOT_H}
            fill={PALETTE.green}
            opacity={0.04}
          />
        ))}

        {/* left Y labels */}
        {lTicks.map((t) => (
          <text key={`ll-${t}`} x={PAD.l - 8} y={mapYL(t) + 3.5} textAnchor="end" fontSize={9.5} fill={leftColor} opacity={0.7}>
            {fmtK(t)}
          </text>
        ))}

        {/* right Y labels */}
        {rTicks.map((t) => (
          <text key={`rl-${t}`} x={W - PAD.r + 8} y={mapYR(t) + 3.5} textAnchor="start" fontSize={9.5} fill={rightColor} opacity={0.7}>
            {fmtK(t)}
          </text>
        ))}

        {/* X labels */}
        {months.map((m, i) => {
          const show = n <= 18 || i % Math.ceil(n / 12) === 0 || i === n - 1;
          if (!show) return null;
          return (
            <text key={i} x={xAt(i)} y={BASE_Y + 16} textAnchor="middle" fontSize={9} fill={hover === i ? PALETTE.blue : PALETTE.axis} fontWeight={hover === i ? 700 : 400}>
              M{m}
            </text>
          );
        })}

        {/* left line (solid) */}
        <motion.path
          d={leftLine}
          fill="none"
          stroke={leftColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* right line (dashed) */}
        {rightLine && (
          <motion.path
            d={rightLine}
            fill="none"
            stroke={rightColor}
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
          />
        )}

        {/* hover */}
        {hover !== null && (
          <g>
            <line x1={xAt(hover)} y1={PAD.t} x2={xAt(hover)} y2={BASE_Y} stroke={PALETTE.blue} strokeWidth={1} opacity={0.2} />
            <circle cx={xAt(hover)} cy={leftPts[hover][1]} r={4.5} fill="#fff" stroke={leftColor} strokeWidth={2} />
            {rightData[hover] !== null && (
              <circle cx={xAt(hover)} cy={mapYR(rightData[hover] as number)} r={3.5} fill="#fff" stroke={rightColor} strokeWidth={1.5} />
            )}
          </g>
        )}
      </svg>

      {hover !== null && tip && (
        <FloatingTooltip x={tip.x} y={tip.y}>
          <TipLabel>M{months[hover]}</TipLabel>
          <TipRow label={leftLabel} value={fmtK(leftData[hover])} color={leftColor} />
          {rightData[hover] !== null && (
            <TipRow label={rightLabel} value={fmtK(rightData[hover] as number)} color={rightColor} />
          )}
        </FloatingTooltip>
      )}
    </V2ChartCard>
  );
}

export default V2DualAxisChart;

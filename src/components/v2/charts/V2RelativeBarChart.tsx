"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  makeYMapper,
  padRange,
  fmtK,
  PALETTE,
  FONT,
} from "./v2-chart-utils";
import { V2ChartCard, FloatingTooltip, TipLabel, TipRow } from "./V2ChartCard";

export interface V2RelativeBarChartProps {
  title: string;
  subtitle?: string;
  positive: { data: number[]; label: string };
  negative: { data: number[]; label: string };
  months: number[];
}

const W = 640;
const H = 240;
const PAD = { t: 16, r: 14, b: 28, l: 52 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const GRID_ROWS = 6;
const BAR_GAP = 0.3;

export function V2RelativeBarChart({
  title,
  subtitle,
  positive,
  negative,
  months,
}: V2RelativeBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const n = months.length;

  /* range encompasses positive and negative */
  const allVals = useMemo(
    () => [...positive.data, ...negative.data.map((v) => -Math.abs(v))],
    [positive.data, negative.data]
  );
  const [yMin, yMax] = useMemo(() => {
    const [lo, hi] = padRange(allVals);
    const absMax = Math.max(Math.abs(lo), Math.abs(hi));
    return [-absMax, absMax]; // symmetric
  }, [allVals]);

  const BASE_Y_POS = PAD.t + PLOT_H;
  const mapY = useMemo(() => makeYMapper(yMin, yMax, BASE_Y_POS, PLOT_H), [yMin, yMax]);
  const zeroY = mapY(0);

  const slotW = PLOT_W / n;
  const barW = slotW * (1 - BAR_GAP);
  const barOffset = (slotW - barW) / 2;

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
      const idx = Math.floor((mx - PAD.l) / slotW);
      setHover(Math.max(0, Math.min(n - 1, idx)));
      setTip({ x: e.clientX, y: e.clientY });
    },
    [n, slotW]
  );

  const legend = useMemo(
    () => [
      { color: PALETTE.green, label: positive.label },
      { color: PALETTE.red, label: negative.label },
    ],
    [positive.label, negative.label]
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

        {/* zero line */}
        <line x1={PAD.l} y1={zeroY} x2={W - PAD.r} y2={zeroY} stroke={PALETTE.axis} strokeWidth={1} />

        {/* Y labels */}
        {yTicks.map((t) => (
          <text key={`yl-${t}`} x={PAD.l - 8} y={mapY(t) + 3.5} textAnchor="end" fontSize={9.5} fill={PALETTE.axis}>
            {fmtK(t)}
          </text>
        ))}

        {/* X labels */}
        {months.map((m, i) => (
          <text key={i} x={PAD.l + i * slotW + slotW / 2} y={BASE_Y_POS + 16} textAnchor="middle" fontSize={9} fill={hover === i ? PALETTE.blue : PALETTE.axis} fontWeight={hover === i ? 700 : 400}>
            M{m}
          </text>
        ))}

        {/* positive bars */}
        {positive.data.map((val, i) => {
          const h = Math.abs(mapY(0) - mapY(val));
          const bx = PAD.l + i * slotW + barOffset;
          const by = zeroY - h;
          const r = Math.min(4, h / 2, barW / 2);
          return (
            <motion.rect
              key={`p-${i}`}
              x={bx}
              y={by}
              width={barW}
              height={h}
              rx={r}
              fill={PALETTE.green}
              opacity={hover !== null && hover !== i ? 0.4 : 0.85}
              style={{ transition: "opacity 0.15s" }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.45, delay: i * 0.02, ease: "easeOut" }}
              // @ts-expect-error -- framer motion style transform-origin workaround
              transformOrigin={`${bx + barW / 2}px ${zeroY}px`}
            />
          );
        })}

        {/* negative bars */}
        {negative.data.map((val, i) => {
          const absVal = Math.abs(val);
          const h = Math.abs(mapY(0) - mapY(absVal));
          const bx = PAD.l + i * slotW + barOffset;
          const r = Math.min(4, h / 2, barW / 2);
          return (
            <motion.rect
              key={`n-${i}`}
              x={bx}
              y={zeroY}
              width={barW}
              height={h}
              rx={r}
              fill={PALETTE.red}
              opacity={hover !== null && hover !== i ? 0.4 : 0.85}
              style={{ transition: "opacity 0.15s" }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.45, delay: i * 0.02 + 0.05, ease: "easeOut" }}
              // @ts-expect-error -- framer motion style transform-origin workaround
              transformOrigin={`${bx + barW / 2}px ${zeroY}px`}
            />
          );
        })}

        {/* hover column highlight */}
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
          <TipRow label={positive.label} value={fmtK(positive.data[hover])} color={PALETTE.green} />
          <TipRow label={negative.label} value={fmtK(negative.data[hover])} color={PALETTE.red} />
          <TipRow label="Net" value={fmtK(positive.data[hover] - Math.abs(negative.data[hover]))} color="#fff" />
        </FloatingTooltip>
      )}
    </V2ChartCard>
  );
}

export default V2RelativeBarChart;

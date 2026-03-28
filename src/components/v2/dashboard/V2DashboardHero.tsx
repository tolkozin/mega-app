"use client";

/**
 * v2 Dashboard Hero Components
 * Stacked bar chart with revenue breakdown, sparklines,
 * donut chart, metric strip, milestones, break-even callout.
 *
 * All components accept real data and are composable independently.
 */

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Users,
  BarChart3,
  Target,
  Activity,
  Percent,
  Clock,
  Milestone,
} from "lucide-react";
import { V2_CHART_COLORS, V2_CARD_CLASS } from "@/components/v2/charts/tokens";

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

export interface RevenueBarData {
  month: number;
  segments: { label: string; value: number; color: string }[];
}

interface DataRow {
  Month: number;
  [key: string]: number | string | undefined;
}

type EngineType = "subscription" | "ecommerce" | "saas";

/* ═══════════════════════════════════════════════════════════════════
   Design Tokens (local)
   ═══════════════════════════════════════════════════════════════════ */

const CARD_SHADOW =
  "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.07)";
const CARD_RADIUS = "20px";

const COLORS = {
  primaryBlue: "#2163E7",
  darkBlue: "#1650b0",
  lightBlue: "#7BA3F0",
  veryLightBlue: "#BDD0F8",
  darkBg: "#1a1a2e",
  textPrimary: "#1a1a2e",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  textFaint: "#c4c9d8",
  green: "#10B981",
  red: "#EF4444",
  yellow: "#F59E0B",
} as const;

const SEGMENT_COLORS: Record<string, string> = {
  annual: "#4A6FA5",
  monthly: "#6B8FCC",
  weekly: "#94B3E0",
  projected: "#C5D7F0",
};

/* ═══════════════════════════════════════════════════════════════════
   Shared Helpers
   ═══════════════════════════════════════════════════════════════════ */

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n.toFixed(0)}`;
}

function formatPercent(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

/** Column resolution helpers — pick the best matching column from the dataframe */
function isNumeric(v: unknown): boolean {
  if (typeof v === "number") return true;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return true;
  return false;
}

function findCol(row: DataRow, ...candidates: string[]): string | null {
  // Pass 1: exact case-insensitive match with any row (even first row may have 0)
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(row).find((k) => k.toLowerCase() === lc);
    if (match && isNumeric(row[match])) return match;
  }
  // Pass 2: exact match ignoring value type (column exists but value might be null/string in row 0)
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(row).find((k) => k.toLowerCase() === lc);
    if (match) return match;
  }
  // Pass 3: includes-based fuzzy match
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(row).find(
      (k) => k.toLowerCase().includes(lc) && isNumeric(row[k])
    );
    if (match) return match;
  }
  return null;
}

function num(row: DataRow, col: string | null): number {
  if (!col) return 0;
  const v = row[col];
  if (typeof v === "number") return v;
  if (typeof v === "string") { const n = Number(v); return isNaN(n) ? 0 : n; }
  return 0;
}

/* ═══════════════════════════════════════════════════════════════════
   1. MiniSpark — 56x28 sparkline
   ═══════════════════════════════════════════════════════════════════ */

interface MiniSparkProps {
  data: number[];
  color: string;
}

export const MiniSpark = memo(function MiniSpark({ data, color }: MiniSparkProps) {
  const W = 56;
  const H = 28;
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * H * 0.75 - H * 0.1,
  ]);

  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 5;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 5;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 5;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 5;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block flex-shrink-0">
      <defs>
        <linearGradient id={`spark-fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${d} L${W},${H} L0,${H} Z`}
        fill={`url(#spark-fill-${color.replace("#", "")})`}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   2. MiniDonut — Cost structure donut chart (Figma Make design)
   ═══════════════════════════════════════════════════════════════════ */

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface MiniDonutProps {
  segments: DonutSegment[];
  totalLabel: string;
}

export const MiniDonut = memo(function MiniDonut({ segments, totalLabel }: MiniDonutProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const SIZE = 140;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const outerR = 58;
  const innerR = 38;
  const GAP_DEGREES = 2;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
    const rad = (Math.PI / 180) * angleDeg;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function arcSectorPath(
    cx: number,
    cy: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ): string {
    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;
    const [osx, osy] = polarToCartesian(cx, cy, outerRadius, startAngle);
    const [oex, oey] = polarToCartesian(cx, cy, outerRadius, endAngle);
    const [isx, isy] = polarToCartesian(cx, cy, innerRadius, endAngle);
    const [iex, iey] = polarToCartesian(cx, cy, innerRadius, startAngle);
    return [
      `M${osx},${osy}`,
      `A${outerRadius},${outerRadius} 0 ${largeArc} 1 ${oex},${oey}`,
      `L${isx},${isy}`,
      `A${innerRadius},${innerRadius} 0 ${largeArc} 0 ${iex},${iey}`,
      "Z",
    ].join(" ");
  }

  let cumAngle = -90;
  const arcs = segments.map((seg, i) => {
    const angle = (seg.value / total) * (360 - GAP_DEGREES * segments.length);
    const startAngle = cumAngle + GAP_DEGREES / 2;
    cumAngle += angle + GAP_DEGREES;
    return { ...seg, startAngle, endAngle: startAngle + angle, index: i };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="flex-shrink-0">
        {arcs.map((arc) => {
          const isHovered = hovered === arc.index;
          const expand = isHovered ? 3 : 0;
          const opacity = hovered !== null && !isHovered ? 0.35 : 1;
          return (
            <path
              key={arc.index}
              d={arcSectorPath(CX, CY, outerR + expand, innerR - expand / 2, arc.startAngle, arc.endAngle)}
              fill={arc.color}
              style={{ transition: "all 0.2s ease", cursor: "pointer", opacity }}
              onMouseEnter={() => setHovered(arc.index)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {/* Center label */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.textPrimary}
          fontSize="14"
          fontWeight="800"
          fontFamily="Lato, system-ui, sans-serif"
        >
          {formatCurrency(total)}
        </text>
        <text
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.textMuted}
          fontSize="9"
          fontFamily="Lato, system-ui, sans-serif"
        >
          {totalLabel}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 min-w-0">
        {segments.map((seg, i) => {
          const pct = ((seg.value / total) * 100).toFixed(1);
          return (
            <div
              key={i}
              className="flex items-center gap-2 text-[11px] font-lato"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                cursor: "pointer",
                opacity: hovered !== null && hovered !== i ? 0.5 : 1,
                transition: "opacity 0.15s",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-[#6b7280] truncate">{seg.label}</span>
              <span className="font-bold text-[#1a1a2e] ml-auto tabular-nums whitespace-nowrap">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   3. RevenueHeroChart — Stacked SVG bar chart (780x240)
   ═══════════════════════════════════════════════════════════════════ */

interface RevenueHeroChartProps {
  data: RevenueBarData[];
  breakEvenMonth?: number | null;
  legendItems?: { label: string; color: string; striped?: boolean }[];
}

export const RevenueHeroChart = memo(function RevenueHeroChart({
  data,
  breakEvenMonth,
  legendItems,
}: RevenueHeroChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: RevenueBarData;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const VW = 780;
  const VH = 190;
  const PADDING = { top: 20, right: 16, bottom: 28, left: 52 };
  const chartW = VW - PADDING.left - PADDING.right;
  const chartH = VH - PADDING.top - PADDING.bottom;

  /* Guard: nothing to draw */
  if (!data.length) return null;

  const maxVal = useMemo(() => {
    return Math.max(
      ...data.map((d) => d.segments.reduce((sum, s) => sum + s.value, 0)),
      1
    );
  }, [data]);

  const yTicks = useMemo(() => {
    const step = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const nice = maxVal <= step * 2 ? step / 2 : maxVal <= step * 5 ? step : step * 2;
    const ticks: number[] = [];
    for (let v = 0; v <= maxVal * 1.15; v += nice) {
      ticks.push(v);
    }
    return ticks;
  }, [maxVal]);

  const yMax = yTicks[yTicks.length - 1] || maxVal * 1.15;

  const barGroupW = chartW / data.length;
  const barWidth = barGroupW * 0.56;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = VW / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * (VH / rect.height);

      const idx = Math.floor((mouseX - PADDING.left) / barGroupW);
      if (idx >= 0 && idx < data.length) {
        setTooltip({ x: mouseX, y: mouseY, item: data[idx] });
      } else {
        setTooltip(null);
      }
    },
    [data, barGroupW]
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className="block"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      <defs>
        {/* Projected stripe pattern */}
        <pattern id="pat-projected" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill={SEGMENT_COLORS.projected} />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#94B3E0" strokeWidth="2" opacity="0.5" />
        </pattern>
        {/* Clip paths for bar rounded corners — must be in root <defs> */}
        {data.map((d, i) => {
          const cx = PADDING.left + i * barGroupW + barGroupW / 2;
          const bx = cx - barWidth / 2;
          const baseY = PADDING.top + chartH;
          const totalH = d.segments.reduce((sum, s) => sum + s.value, 0);
          const totalBarH = (totalH / yMax) * chartH;
          return (
            <clipPath key={`clip-${i}`} id={`bar-clip-${i}`}>
              <rect
                x={bx}
                y={baseY - totalBarH - 1}
                width={barWidth}
                height={totalBarH + 1}
                rx={5}
                ry={5}
              />
            </clipPath>
          );
        })}
      </defs>

      {/* Y-axis grid lines */}
      {yTicks.map((tick) => {
        const y = PADDING.top + chartH - (tick / yMax) * chartH;
        return (
          <g key={tick}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={VW - PADDING.right}
              y2={y}
              stroke={V2_CHART_COLORS.grid}
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={y + 3}
              textAnchor="end"
              fill={COLORS.textMuted}
              fontSize="9.5"
              fontFamily="Lato, system-ui, sans-serif"
            >
              {formatK(tick)}
            </text>
          </g>
        );
      })}

      {/* Bars — using CSS transitions instead of framer-motion for SVG compat */}
      {data.map((d, i) => {
        const cx = PADDING.left + i * barGroupW + barGroupW / 2;
        const bx = cx - barWidth / 2;
        const baseY = PADDING.top + chartH;

        let currentY = baseY;
        const segmentRects = d.segments.map((seg, si) => {
          const segH = (seg.value / yMax) * chartH;
          currentY -= segH;
          return { ...seg, y: currentY, h: segH, si };
        });

        return (
          <g key={i}>
            <g clipPath={`url(#bar-clip-${i})`}>
              {segmentRects.map((sr) => (
                <rect
                  key={sr.si}
                  x={bx}
                  width={barWidth}
                  y={sr.y}
                  height={sr.h}
                  fill={sr.label === "Projected" ? "url(#pat-projected)" : sr.color}
                  style={{
                    transition: `y 0.5s ease-out ${i * 0.03 + sr.si * 0.04}s, height 0.5s ease-out ${i * 0.03 + sr.si * 0.04}s`,
                  }}
                />
              ))}
            </g>

            {/* X-axis month label */}
            <text
              x={cx}
              y={baseY + 16}
              textAnchor="middle"
              fill={COLORS.textMuted}
              fontSize="10"
              fontFamily="Lato, system-ui, sans-serif"
            >
              {d.month}
            </text>
          </g>
        );
      })}

      {/* Break-even dashed line */}
      {breakEvenMonth != null && breakEvenMonth > 0 && (() => {
        const idx = data.findIndex((d) => d.month === breakEvenMonth);
        if (idx < 0) return null;
        const cx = PADDING.left + idx * barGroupW + barGroupW / 2;
        return (
          <g>
            <line
              x1={cx}
              y1={PADDING.top}
              x2={cx}
              y2={PADDING.top + chartH}
              stroke={COLORS.green}
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <rect
              x={cx - 42}
              y={PADDING.top - 2}
              width={84}
              height={18}
              rx={9}
              fill={COLORS.green}
              opacity={0.12}
            />
            <text
              x={cx}
              y={PADDING.top + 10}
              textAnchor="middle"
              fill={COLORS.green}
              fontSize="9.5"
              fontWeight="700"
              fontFamily="Lato, system-ui, sans-serif"
            >
              Break-even
            </text>
          </g>
        );
      })()}

      {/* Legend moved to card header — no longer rendered inside SVG */}

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {(() => {
              const lineCount = 1 + tooltip.item.segments.length;
              const tooltipH = 20 + lineCount * 16;
              const tooltipW = 160;
              const tx = Math.min(tooltip.x + 12, VW - tooltipW - 8);
              const ty = Math.max(tooltip.y - tooltipH - 8, 4);
              return (
                <>
                  <rect
                    x={tx}
                    y={ty}
                    width={tooltipW}
                    height={tooltipH}
                    rx={8}
                    fill={COLORS.darkBg}
                    opacity={0.95}
                  />
                  <text
                    x={tx + 10}
                    y={ty + 18}
                    fill="#fff"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="Lato, system-ui, sans-serif"
                  >
                    Month {tooltip.item.month}
                  </text>
                  {tooltip.item.segments.map((seg, si) => (
                    <g key={si}>
                      <rect
                        x={tx + 10}
                        y={ty + 26 + si * 16}
                        width={6}
                        height={6}
                        rx={1}
                        fill={seg.color}
                      />
                      <text
                        x={tx + 22}
                        y={ty + 32 + si * 16}
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="Lato, system-ui, sans-serif"
                      >
                        {seg.label}: {formatCurrency(seg.value)}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   4. MetricStripCard — Metrics with sparklines, expandable
   ═══════════════════════════════════════════════════════════════════ */

interface MetricStripItem {
  label: string;
  description: string;
  value: string;
  trend: string;
  good: boolean;
  spark: number[];
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

interface MetricStripCardProps {
  metrics: MetricStripItem[];
}

export const MetricStripCard = memo(function MetricStripCard({ metrics }: MetricStripCardProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleCount = 3;
  const shown = expanded ? metrics : metrics.slice(0, visibleCount);
  const hasMore = metrics.length > visibleCount;

  return (
    <div
      className="bg-white font-lato overflow-hidden"
      style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
    >
      <div className="px-5 pt-4 pb-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">
          Metrics
        </div>
      </div>
      <div className="divide-y divide-[#f0f1f7]">
        <AnimatePresence initial={false}>
          {shown.map((m, i) => (
            <motion.div
              key={m.label}
              className="flex items-center justify-between px-5 py-3.5 gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon circle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: m.iconBg, color: m.iconColor }}
              >
                {m.icon}
              </div>

              {/* Label + value + description */}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">
                  {m.label}
                </div>
                <div className="text-[20px] font-black text-[#1a1a2e] leading-none tabular-nums mt-0.5">
                  {m.value}
                </div>
                {m.description && (
                  <div className="text-[9px] text-[#9ca3af] mt-0.5 leading-tight">
                    {m.description}
                  </div>
                )}
              </div>

              {/* Trend badge */}
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold flex-shrink-0 ${
                  m.good
                    ? "bg-[#ecfdf5] text-[#10B981]"
                    : "bg-[#fef2f2] text-[#EF4444]"
                }`}
              >
                {m.good ? (
                  <TrendingUp size={10} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={10} strokeWidth={2.5} />
                )}
                {m.trend}
              </span>

              {/* Sparkline with label */}
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <MiniSpark
                  data={m.spark}
                  color={m.good ? COLORS.green : COLORS.red}
                />
                <span className="text-[8px] text-[#c4c9d8]">
                  {m.spark.length}-month trend
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-[11px] font-bold text-[#2163E7] hover:bg-[#f8f9fc] transition-colors"
        >
          {expanded ? "Show less" : `Show more (${metrics.length - visibleCount})`}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   5. BreakEvenCallout — Break-even + Key Milestones combined card
   ═══════════════════════════════════════════════════════════════════ */

interface MilestoneItem {
  key: string;
  label: string;
  description: string;
  value: number | null | undefined;
  icon: React.ReactNode;
}

interface BreakEvenCalloutProps {
  month: number | null;
  description: string;
  milestones?: Record<string, unknown>;
}

function formatMilestoneValue(val: unknown): string {
  if (val === null || val === undefined) return "\u2014";
  const n = typeof val === "string" ? Number(val) : val;
  if (typeof n === "number" && !isNaN(n) && n > 0) return `Month ${n}`;
  return "\u2014";
}

export const BreakEvenCallout = memo(function BreakEvenCallout({
  month,
  description,
  milestones,
}: BreakEvenCalloutProps) {
  const [showAll, setShowAll] = useState(false);

  const keyMilestones: MilestoneItem[] = useMemo(() => [
    {
      key: "break_even_month",
      label: "Break-even (P&L)",
      description: "When monthly revenue first exceeds monthly expenses",
      value: milestones?.break_even_month as number | null | undefined,
      icon: <Zap size={14} />,
    },
    {
      key: "cf_positive_month",
      label: "Cash Flow Positive",
      description: "When net cash inflow turns positive for the first time",
      value: milestones?.cf_positive_month as number | null | undefined,
      icon: <DollarSign size={14} />,
    },
    {
      key: "investment_payback_month",
      label: "Investment Payback",
      description: "When cumulative profit repays the initial investment",
      value: milestones?.investment_payback_month as number | null | undefined,
      icon: <Clock size={14} />,
    },
  ], [milestones]);

  const extraMilestones: MilestoneItem[] = useMemo(() => {
    if (!milestones) return [];
    const extras: MilestoneItem[] = [
      { key: "cumulative_break_even", label: "Cumulative Break-even", description: "When total revenue exceeds total expenses since launch", value: milestones.cumulative_break_even as number | null | undefined, icon: <BarChart3 size={14} /> },
      { key: "runway_out_month", label: "Runway Exhausted", description: "When cash reserves run out at the current burn rate", value: milestones.runway_out_month as number | null | undefined, icon: <Activity size={14} /> },
      { key: "users_1000", label: "1,000 Users", description: "When total active users reach 1,000", value: milestones.users_1000 as number | null | undefined, icon: <Users size={14} /> },
      { key: "users_10000", label: "10,000 Users", description: "When total active users reach 10,000", value: milestones.users_10000 as number | null | undefined, icon: <Users size={14} /> },
      { key: "mrr_10000", label: "$10K MRR", description: "When monthly recurring revenue hits $10,000", value: milestones.mrr_10000 as number | null | undefined, icon: <Target size={14} /> },
      { key: "mrr_100000", label: "$100K MRR", description: "When monthly recurring revenue hits $100,000", value: milestones.mrr_100000 as number | null | undefined, icon: <Target size={14} /> },
    ];
    return extras;
  }, [milestones]);

  return (
    <div
      className="font-lato overflow-hidden"
      style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
    >
      {/* Blue gradient break-even header */}
      <div
        className="relative overflow-hidden p-5"
        style={{
          background: "linear-gradient(135deg, #2163E7 0%, #1650b0 100%)",
        }}
      >
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7BA3F0 0%, transparent 70%)" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">
              Break-Even Projection
            </div>
          </div>
          <div className="text-[28px] font-black text-white leading-none tabular-nums mb-1">
            {month != null ? `Month ${month}` : "Not yet"}
          </div>
          <div className="text-[12px] text-white/70 leading-snug">
            {description}
          </div>
        </div>
      </div>

      {/* Key Milestones section */}
      <div className="bg-white p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af] mb-3">
          Key Milestones
        </div>
        <div className="flex flex-col gap-3">
          {keyMilestones.map((m) => (
            <div key={m.key} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EBF0FD] text-[#2163E7] flex items-center justify-center flex-shrink-0">
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-[#1a1a2e] font-medium">{m.label}</div>
                <div className="text-[9px] text-[#9ca3af] leading-tight">{m.description}</div>
              </div>
              <div className="text-[13px] font-bold text-[#1a1a2e] tabular-nums flex-shrink-0">
                {formatMilestoneValue(m.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Expandable extra milestones */}
        <AnimatePresence initial={false}>
          {showAll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#f0f1f7] mt-3 pt-3 flex flex-col gap-3">
                {extraMilestones.map((m) => (
                  <div key={m.key} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f8f9fc] text-[#9ca3af] flex items-center justify-center flex-shrink-0">
                      {m.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[#6b7280]">{m.label}</div>
                      <div className="text-[9px] text-[#9ca3af] leading-tight">{m.description}</div>
                    </div>
                    <div className="text-[13px] font-bold text-[#1a1a2e] tabular-nums flex-shrink-0">
                      {formatMilestoneValue(m.value)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#2163E7] hover:text-[#1650b0] transition-colors"
        >
          {showAll ? (
            <>
              <ChevronDown size={14} className="rotate-180 transition-transform" />
              Hide milestones
            </>
          ) : (
            <>
              <ChevronRight size={14} />
              Show all milestones
            </>
          )}
        </button>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   6. V2DashboardHero — Main wrapper / composer
   ═══════════════════════════════════════════════════════════════════ */

interface V2DashboardHeroProps {
  data: DataRow[];
  milestones?: Record<string, unknown>;
  engine?: EngineType;
}

export const V2DashboardHero = memo(function V2DashboardHero({
  data,
  milestones,
  engine = "subscription",
}: V2DashboardHeroProps) {
  /* ── Resolve columns from the dataframe ── */
  const columns = useMemo(() => {
    if (!data.length) return {
      revenue: null, mrrWeekly: null, mrrMonthly: null, mrrAnnual: null,
      cost: null, profit: null, customers: null, churn: null,
      arpu: null, cac: null, ltv: null, ltvCac: null, margin: null,
    };
    const sample = data[0];
    return {
      revenue: findCol(sample, "Total MRR", "Total Gross Revenue", "Total Revenue", "Revenue", "MRR", "Monthly Revenue", "Gross Revenue"),
      mrrWeekly: findCol(sample, "MRR Weekly"),
      mrrMonthly: findCol(sample, "MRR Monthly"),
      mrrAnnual: findCol(sample, "MRR Annual"),
      cost: findCol(sample, "Total Costs", "Costs", "Total Expenses", "Expenses", "COGS"),
      profit: findCol(sample, "Net Profit", "Profit", "Net Income", "EBITDA"),
      customers: findCol(sample, "Total Active Users", "Total Customers", "Customers", "Active Subscribers", "Users", "Subscribers"),
      churn: findCol(sample, "Blended Churn", "Logo Churn %", "Churn Rate", "Churn", "Monthly Churn"),
      arpu: findCol(sample, "ARPU", "Average Revenue Per User", "Avg Revenue"),
      cac: findCol(sample, "Blended CAC", "CAC", "Customer Acquisition Cost"),
      ltv: findCol(sample, "LTV", "Lifetime Value", "Customer Lifetime Value"),
      ltvCac: findCol(sample, "LTV/CAC", "LTV CAC Ratio"),
      margin: findCol(sample, "Gross Margin %", "Gross Margin", "Margin"),
    };
  }, [data]);

  /* ── Dynamic color palette for extra plan segments ── */
  const DYNAMIC_PALETTE = [
    "#4A6FA5", "#6B8FCC", "#94B3E0", "#C5D7F0", // blues (muted)
    "#7BA88E", "#A3C4B5", "#5B8F9E", "#B0A3C8", // green/teal/purple (muted)
    "#C9A96E", "#D4A5A5", "#8FA3BF", "#A8B5A0", // warm neutrals
  ];

  /* ── Build chart data with segments ── */
  const { chartData, legendItems } = useMemo(() => {
    const hasBreakdown = engine === "subscription" && columns.mrrWeekly && columns.mrrMonthly && columns.mrrAnnual;

    // Detect all MRR-related columns dynamically (for extra plans)
    const mrrCols: { key: string; label: string }[] = [];
    if (hasBreakdown && data.length > 0) {
      const sample = data[0];
      const knownMrr = new Set([
        columns.mrrAnnual?.toLowerCase(),
        columns.mrrMonthly?.toLowerCase(),
        columns.mrrWeekly?.toLowerCase(),
      ].filter(Boolean));
      // Find additional MRR columns (e.g., "MRR Enterprise", "MRR Pro")
      for (const key of Object.keys(sample)) {
        const lk = key.toLowerCase();
        if (lk.startsWith("mrr") && !knownMrr.has(lk) && lk !== "mrr" && isNumeric(sample[key])) {
          mrrCols.push({ key, label: key });
        }
      }
    }

    // Build color map for all segments
    const colorMap: Record<string, string> = {
      "MRR Annual": SEGMENT_COLORS.annual,
      "MRR Monthly": SEGMENT_COLORS.monthly,
      "MRR Weekly": SEGMENT_COLORS.weekly,
      Revenue: SEGMENT_COLORS.monthly,
    };
    mrrCols.forEach((col, i) => {
      colorMap[col.label] = DYNAMIC_PALETTE[(i + 4) % DYNAMIC_PALETTE.length];
    });

    const legend: { label: string; color: string; striped?: boolean }[] = [];
    if (hasBreakdown) {
      legend.push(
        { label: "MRR Annual", color: colorMap["MRR Annual"] },
        { label: "MRR Monthly", color: colorMap["MRR Monthly"] },
        { label: "MRR Weekly", color: colorMap["MRR Weekly"] },
      );
      mrrCols.forEach((col) => {
        legend.push({ label: col.label, color: colorMap[col.label] });
      });
    } else {
      legend.push({ label: "Revenue", color: colorMap.Revenue });
    }

    const bars: RevenueBarData[] = data.map((row) => {
      const month = typeof row.Month === "number" ? row.Month : 0;
      const segments: RevenueBarData["segments"] = [];

      if (hasBreakdown) {
        const annual = Math.max(0, num(row, columns.mrrAnnual));
        const monthly = Math.max(0, num(row, columns.mrrMonthly));
        const weekly = Math.max(0, num(row, columns.mrrWeekly));
        segments.push({ label: "MRR Annual", value: annual, color: colorMap["MRR Annual"] });
        segments.push({ label: "MRR Monthly", value: monthly, color: colorMap["MRR Monthly"] });
        if (weekly > 0) segments.push({ label: "MRR Weekly", value: weekly, color: colorMap["MRR Weekly"] });
        // Dynamic extra MRR columns
        for (const col of mrrCols) {
          const val = Math.max(0, num(row, col.key));
          if (val > 0) segments.push({ label: col.label, value: val, color: colorMap[col.label] });
        }
      } else {
        const rev = Math.max(0, num(row, columns.revenue));
        segments.push({ label: "Revenue", value: rev, color: colorMap.Revenue });
      }

      return { month, segments };
    });

    return { chartData: bars, legendItems: legend };
  }, [data, columns, engine]);

  /* ── Break-even ── */
  const breakEvenMonth = useMemo(() => {
    if (!milestones) return null;
    const raw = milestones.break_even_month;
    if (typeof raw === "number" && raw > 0) return raw;
    if (typeof raw === "string" && !isNaN(Number(raw))) return Number(raw);
    return null;
  }, [milestones]);

  /* ── Metrics from last vs penultimate row ── */
  const metrics: MetricStripItem[] = useMemo(() => {
    if (data.length < 2) return [];
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const items: MetricStripItem[] = [];

    const addMetric = (
      label: string,
      description: string,
      col: string | null,
      format: (v: number) => string,
      goodWhen: "up" | "down",
      icon: React.ReactNode,
      iconBg: string,
      iconColor: string,
      transform?: (v: number) => number
    ) => {
      if (!col) return;
      let curr = num(last, col);
      let prv = num(prev, col);
      if (transform) { curr = transform(curr); prv = transform(prv); }
      const pct = prv ? ((curr - prv) / Math.abs(prv)) * 100 : 0;
      const good = goodWhen === "up" ? pct >= 0 : pct <= 0;
      items.push({
        label,
        description,
        value: format(curr),
        trend: formatPercent(pct),
        good,
        spark: data.map((r) => {
          let v = num(r, col);
          if (transform) v = transform(v);
          return v;
        }),
        icon,
        iconBg,
        iconColor,
      });
    };

    // Revenue
    addMetric(
      engine === "subscription" ? "MRR" : "Revenue",
      engine === "subscription" ? "Monthly recurring revenue. % shows change vs prior month." : "Total revenue generated. % shows month-over-month change.",
      columns.revenue,
      formatCurrency,
      "up",
      <DollarSign size={14} />,
      "#EBF0FD",
      "#2163E7"
    );

    // Customers
    addMetric(
      "Customers",
      "Total active paying customers. % shows growth vs prior month.",
      columns.customers,
      (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${Math.round(v)}`),
      "up",
      <Users size={14} />,
      "#ecfdf5",
      "#10B981"
    );

    // Churn
    if (engine !== "ecommerce" && columns.churn) {
      addMetric(
        "Churn",
        "Blended customer churn rate. Lower is better — % shows rate change.",
        columns.churn,
        (v) => `${v.toFixed(1)}%`,
        "down",
        <Activity size={14} />,
        "#fef2f2",
        "#EF4444",
        (v) => (v < 1 ? v * 100 : v)
      );
    }

    // CAC
    addMetric("CAC", "Cost to acquire one customer. Lower is better — % shows change.", columns.cac, formatCurrency, "down", <Target size={14} />, "#FFF7ED", "#F59E0B");

    // LTV
    addMetric("LTV", "Predicted lifetime value of a customer. % shows change vs prior month.", columns.ltv, formatCurrency, "up", <BarChart3 size={14} />, "#EBF0FD", "#2163E7");

    // LTV/CAC
    if (columns.ltvCac) {
      addMetric(
        "LTV/CAC",
        "Return on acquisition spend. Above 3x is healthy — % shows change.",
        columns.ltvCac,
        (v) => `${v.toFixed(1)}x`,
        "up",
        <Milestone size={14} />,
        "#ecfdf5",
        "#10B981"
      );
    }

    // Margin
    if (columns.margin) {
      addMetric(
        "Margin",
        "Gross profit margin after direct costs. % shows change vs prior month.",
        columns.margin,
        (v) => `${(v < 1 ? v * 100 : v).toFixed(1)}%`,
        "up",
        <Percent size={14} />,
        "#ecfdf5",
        "#10B981",
        (v) => (v < 1 ? v * 100 : v)
      );
    }

    // ARPU
    addMetric("ARPU", "Average revenue per user per month. % shows change vs prior month.", columns.arpu, formatCurrency, "up", <DollarSign size={14} />, "#EBF0FD", "#2163E7");

    return items;
  }, [data, columns, engine]);

  /* ── Cost donut segments ── */
  const donutSegments: DonutSegment[] = useMemo(() => {
    if (!data.length) return [];
    const last = data[data.length - 1];
    const segments: DonutSegment[] = [];

    const costKeywords = ["cost", "expense", "salary", "marketing", "server", "infrastructure", "cogs", "opex", "ad budget"];

    Object.keys(last).forEach((key) => {
      const lk = key.toLowerCase();
      if (
        typeof last[key] === "number" &&
        (last[key] as number) > 0 &&
        lk !== "month" &&
        !lk.includes("revenue") &&
        !lk.includes("profit") &&
        !lk.includes("customer") &&
        !lk.includes("subscriber") &&
        !lk.includes("churn") &&
        !lk.includes("arpu") &&
        !lk.includes("cac") &&
        !lk.includes("ltv") &&
        !lk.includes("margin") &&
        costKeywords.some((ck) => lk.includes(ck))
      ) {
        segments.push({
          label: key,
          value: last[key] as number,
          color: ["#1650b0", "#2163E7", "#7BA3F0", "#BDD0F8", "#F59E0B", "#10B981"][
            segments.length % 6
          ],
        });
      }
    });

    if (segments.length === 0 && columns.cost) {
      const v = num(last, columns.cost);
      if (v > 0) {
        segments.push({ label: "Total Costs", value: v, color: "#2163E7" });
      }
    }

    return segments;
  }, [data, columns]);

  /* ── MRR / Revenue big number — sum for entire period ── */
  const heroValue = useMemo(() => {
    if (!data.length || !columns.revenue) return 0;
    return data.reduce((sum, row) => sum + num(row, columns.revenue), 0);
  }, [data, columns.revenue]);
  const heroLabel = engine === "subscription" ? "Total Recurring Revenue" : "Total Revenue";

  /* ── Break-even description ── */
  const breakEvenDescription = breakEvenMonth
    ? `Your model projects break-even at month ${breakEvenMonth}. Adjust inputs to explore different scenarios.`
    : "Break-even has not been reached within the modeled timeframe.";

  return (
    <div className="flex flex-col gap-5 font-lato">
      {/* ── Row 1: Hero MRR Card + Chart (full width) ── */}
      <div
        className="bg-white overflow-hidden"
        style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
      >
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af] mb-1">
                {heroLabel}
              </div>
              <div className="text-[44px] font-black text-[#1a1a2e] leading-none tabular-nums">
                {formatCurrency(heroValue)}
              </div>
              {data.length >= 2 && columns.revenue && (() => {
                const lastVal = num(data[data.length - 1], columns.revenue);
                const prevVal = num(data[data.length - 2], columns.revenue);
                const pct = prevVal ? ((lastVal - prevVal) / prevVal) * 100 : 0;
                const good = pct >= 0;
                return (
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        good
                          ? "bg-[#ecfdf5] text-[#10B981]"
                          : "bg-[#fef2f2] text-[#EF4444]"
                      }`}
                    >
                      {good ? (
                        <TrendingUp size={12} strokeWidth={2.5} />
                      ) : (
                        <TrendingDown size={12} strokeWidth={2.5} />
                      )}
                      {formatPercent(pct)}
                    </span>
                    <span className="text-[11px] text-[#c4c9d8]">last month vs prior</span>
                  </div>
                );
              })()}
            </div>

            {/* Legend — rendered in card header, not inside SVG */}
            {legendItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 shrink-0 pt-1">
                {legendItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span
                      className="block w-2.5 h-2.5 rounded-[3px] shrink-0"
                      style={{ background: item.striped ? `repeating-linear-gradient(45deg, ${item.color}, ${item.color} 2px, #fff 2px, #fff 4px)` : item.color }}
                    />
                    <span className="text-[10px] text-[#6b7280] font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-2 pb-4">
          <RevenueHeroChart
            data={chartData}
            breakEvenMonth={breakEvenMonth}
          />
        </div>
      </div>

      {/* ── Row 2: Cost Structure donut (wider) + Metrics (narrower) ── */}
      <div className="flex flex-col lg:flex-row gap-5">
        {donutSegments.length > 0 && (
          <div
            className="bg-white p-5 w-full lg:w-[420px] lg:flex-shrink-0"
            style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af] mb-3">
              Cost Structure
            </div>
            <MiniDonut segments={donutSegments} totalLabel="monthly" />
          </div>
        )}
        {metrics.length > 0 && (
          <div className="flex-1 min-w-0">
            <MetricStripCard metrics={metrics} />
          </div>
        )}
      </div>

      {/* ── Row 3: Break-Even + Milestones (full width) ── */}
      <BreakEvenCallout
        month={breakEvenMonth}
        description={breakEvenDescription}
        milestones={milestones}
      />
    </div>
  );
});

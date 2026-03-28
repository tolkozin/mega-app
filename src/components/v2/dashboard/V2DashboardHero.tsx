"use client";

/**
 * v2 Dashboard Hero Components
 * Ported from Figma Make design — stacked bar chart, sparklines,
 * donut chart, metric strip, activity feed, break-even callout.
 *
 * All components accept real data and are composable independently.
 */

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Zap,
  AlertCircle,
} from "lucide-react";
import { V2_CHART_COLORS, V2_CARD_CLASS } from "@/components/v2/charts/tokens";

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
  gradientBarSub: ["#1650b0", "#2980ff"],
  gradientBarOneTime: ["#7BA3F0", "#92b6f5"],
  darkBg: "#1a1a2e",
  textPrimary: "#1a1a2e",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  textFaint: "#c4c9d8",
  green: "#10B981",
  red: "#EF4444",
  yellow: "#F59E0B",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   Shared Helpers
   ═══════════════════════════════════════════════════════════════════ */

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPercent(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

/* ═══════════════════════════════════════════════════════════════════
   1. MiniSpark — 56×28 sparkline
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

  // Build smooth bezier path
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
   2. MiniDonut — Cost structure donut chart
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

  const SIZE = 120;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 44;
  const STROKE = 14;

  // Build arcs
  let cumAngle = -90; // start at top
  const arcs = segments.map((seg, i) => {
    const angle = (seg.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    return { ...seg, startAngle, angle, index: i };
  });

  function polarToCartesian(angle: number, r: number): [number, number] {
    const rad = (Math.PI / 180) * angle;
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
  }

  function arcPath(startAngle: number, sweepAngle: number, r: number): string {
    const end = startAngle + sweepAngle;
    const [sx, sy] = polarToCartesian(startAngle, r);
    const [ex, ey] = polarToCartesian(end, r);
    const large = sweepAngle > 180 ? 1 : 0;
    return `M${sx},${sy} A${r},${r} 0 ${large} 1 ${ex},${ey}`;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Donut SVG */}
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="flex-shrink-0">
        {arcs.map((arc) => {
          const expand = hovered === arc.index ? 3 : 0;
          return (
            <path
              key={arc.index}
              d={arcPath(arc.startAngle + 0.8, arc.angle - 1.6, R + expand)}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE + (hovered === arc.index ? 3 : 0)}
              strokeLinecap="round"
              style={{ transition: "all 0.2s ease", cursor: "pointer" }}
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
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-[11px] font-lato"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer", opacity: hovered !== null && hovered !== i ? 0.5 : 1, transition: "opacity 0.15s" }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[#6b7280] truncate">{seg.label}</span>
            <span className="font-bold text-[#1a1a2e] ml-auto tabular-nums">
              {formatCurrency(seg.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   3. RevenueHeroChart — Stacked SVG bar chart with animation
   ═══════════════════════════════════════════════════════════════════ */

export interface RevenueBarData {
  month: number;
  revenue: number;
  oneTime?: number;
  projected?: number;
}

interface RevenueHeroChartProps {
  data: RevenueBarData[];
  breakEvenMonth?: number | null;
}

export const RevenueHeroChart = memo(function RevenueHeroChart({
  data,
  breakEvenMonth,
}: RevenueHeroChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: RevenueBarData;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Chart dimensions within viewBox
  const VW = 640;
  const VH = 320;
  const PADDING = { top: 24, right: 16, bottom: 36, left: 52 };
  const chartW = VW - PADDING.left - PADDING.right;
  const chartH = VH - PADDING.top - PADDING.bottom;

  // Compute max stack height
  const maxVal = useMemo(() => {
    return Math.max(
      ...data.map((d) => (d.revenue || 0) + (d.oneTime || 0) + (d.projected || 0)),
      1
    );
  }, [data]);

  // Y-axis grid
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

  const barWidth = Math.min((chartW / data.length) * 0.6, 32);
  const barGap = chartW / data.length;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = VW / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * (VH / rect.height);

      // Find which bar
      const idx = Math.floor((mouseX - PADDING.left) / barGap);
      if (idx >= 0 && idx < data.length) {
        setTooltip({ x: mouseX, y: mouseY, item: data[idx] });
      } else {
        setTooltip(null);
      }
    },
    [data, barGap]
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
        {/* Subscription gradient */}
        <linearGradient id="grad-sub" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={COLORS.gradientBarSub[0]} />
          <stop offset="100%" stopColor={COLORS.gradientBarSub[1]} />
        </linearGradient>
        {/* One-time gradient */}
        <linearGradient id="grad-onetime" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={COLORS.gradientBarOneTime[0]} />
          <stop offset="100%" stopColor={COLORS.gradientBarOneTime[1]} />
        </linearGradient>
        {/* Projected pattern */}
        <pattern id="pat-projected" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill={COLORS.veryLightBlue} />
          <line x1="0" y1="0" x2="0" y2="6" stroke={COLORS.lightBlue} strokeWidth="2" opacity="0.5" />
        </pattern>
        {/* Rounded top clip for each bar */}
        <clipPath id="bar-clip">
          <rect x="-1" y="-6" width={barWidth + 2} height={chartH + 6} rx="5" ry="5" />
        </clipPath>
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
              {formatCurrency(tick)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const cx = PADDING.left + i * barGap + barGap / 2;
        const bx = cx - barWidth / 2;
        const baseY = PADDING.top + chartH;

        const subH = ((d.revenue || 0) / yMax) * chartH;
        const oneTimeH = ((d.oneTime || 0) / yMax) * chartH;
        const projH = ((d.projected || 0) / yMax) * chartH;
        const totalH = subH + oneTimeH + projH;

        // Stack from bottom: subscription → one-time → projected
        const subY = baseY - subH;
        const oneTimeY = subY - oneTimeH;
        const projY = oneTimeY - projH;

        return (
          <g key={i}>
            {/* Bar group with rounded top clip */}
            <g clipPath={`url(#bar-clip-${i})`}>
              <defs>
                <clipPath id={`bar-clip-${i}`}>
                  <rect
                    x={bx}
                    y={baseY - totalH - 1}
                    width={barWidth}
                    height={totalH + 1}
                    rx="5"
                    ry="5"
                  />
                </clipPath>
              </defs>

              {/* Subscription (bottom) */}
              {subH > 0 && (
                <motion.rect
                  x={bx}
                  width={barWidth}
                  y={baseY}
                  height={0}
                  fill="url(#grad-sub)"
                  animate={{ y: subY, height: subH }}
                  transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
                />
              )}

              {/* One-time (middle) */}
              {oneTimeH > 0 && (
                <motion.rect
                  x={bx}
                  width={barWidth}
                  y={baseY}
                  height={0}
                  fill="url(#grad-onetime)"
                  animate={{ y: oneTimeY, height: oneTimeH }}
                  transition={{ duration: 0.5, delay: i * 0.03 + 0.05, ease: "easeOut" }}
                />
              )}

              {/* Projected (top) */}
              {projH > 0 && (
                <motion.rect
                  x={bx}
                  width={barWidth}
                  y={baseY}
                  height={0}
                  fill="url(#pat-projected)"
                  animate={{ y: projY, height: projH }}
                  transition={{ duration: 0.5, delay: i * 0.03 + 0.1, ease: "easeOut" }}
                />
              )}
            </g>

            {/* X-axis month label */}
            <text
              x={cx}
              y={baseY + 18}
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

      {/* Break-even annotation line */}
      {breakEvenMonth != null && breakEvenMonth > 0 && (
        (() => {
          const idx = data.findIndex((d) => d.month === breakEvenMonth);
          if (idx < 0) return null;
          const cx = PADDING.left + idx * barGap + barGap / 2;
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
        })()
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <rect
              x={Math.min(tooltip.x + 12, VW - 150)}
              y={Math.max(tooltip.y - 70, 4)}
              width={136}
              height={64}
              rx={8}
              fill={COLORS.darkBg}
              opacity={0.95}
            />
            <text
              x={Math.min(tooltip.x + 20, VW - 142)}
              y={Math.max(tooltip.y - 70, 4) + 18}
              fill="#fff"
              fontSize="11"
              fontWeight="700"
              fontFamily="Lato, system-ui, sans-serif"
            >
              Month {tooltip.item.month}
            </text>
            <text
              x={Math.min(tooltip.x + 20, VW - 142)}
              y={Math.max(tooltip.y - 70, 4) + 34}
              fill="#cbd5e1"
              fontSize="10"
              fontFamily="Lato, system-ui, sans-serif"
            >
              Revenue: {formatCurrency(tooltip.item.revenue)}
            </text>
            {(tooltip.item.oneTime ?? 0) > 0 && (
              <text
                x={Math.min(tooltip.x + 20, VW - 142)}
                y={Math.max(tooltip.y - 70, 4) + 48}
                fill="#cbd5e1"
                fontSize="10"
                fontFamily="Lato, system-ui, sans-serif"
              >
                One-time: {formatCurrency(tooltip.item.oneTime!)}
              </text>
            )}
            {(tooltip.item.projected ?? 0) > 0 && (
              <text
                x={Math.min(tooltip.x + 20, VW - 142)}
                y={Math.max(tooltip.y - 70, 4) + ((tooltip.item.oneTime ?? 0) > 0 ? 56 : 48)}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="Lato, system-ui, sans-serif"
                fontStyle="italic"
              >
                Projected: {formatCurrency(tooltip.item.projected!)}
              </text>
            )}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   4. MetricStripCard — Secondary metrics with sparklines
   ═══════════════════════════════════════════════════════════════════ */

interface MetricStripItem {
  label: string;
  value: string;
  trend: string;
  good: boolean;
  spark: number[];
}

interface MetricStripCardProps {
  metrics: MetricStripItem[];
}

export const MetricStripCard = memo(function MetricStripCard({ metrics }: MetricStripCardProps) {
  return (
    <div
      className="bg-white font-lato"
      style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
    >
      <div className="divide-y divide-[#f0f1f7]">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-3">
            {/* Left: label + value */}
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">
                {m.label}
              </div>
              <div className="text-[20px] font-black text-[#1a1a2e] leading-none tabular-nums mt-0.5">
                {m.value}
              </div>
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

            {/* Sparkline */}
            <MiniSpark
              data={m.spark}
              color={m.good ? COLORS.green : COLORS.red}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   5. ActivityFeed — Recent activity list
   ═══════════════════════════════════════════════════════════════════ */

interface ActivityFeedItem {
  icon: React.ReactNode;
  color: string;
  bg: string;
  text: string;
  time: string;
}

interface ActivityFeedProps {
  items: ActivityFeedItem[];
}

export const ActivityFeed = memo(function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div
      className="bg-white font-lato p-5"
      style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af] mb-3">
        Recent Activity
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.bg, color: item.color }}
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-[#1a1a2e] leading-snug">{item.text}</div>
              <div className="text-[10px] text-[#c4c9d8] mt-0.5">{item.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   6. BreakEvenCallout — Break-even projected card
   ═══════════════════════════════════════════════════════════════════ */

interface BreakEvenCalloutProps {
  month: number | null;
  description: string;
  onModelScenarios?: () => void;
}

export const BreakEvenCallout = memo(function BreakEvenCallout({
  month,
  description,
  onModelScenarios,
}: BreakEvenCalloutProps) {
  return (
    <div
      className="font-lato relative overflow-hidden p-5"
      style={{
        borderRadius: CARD_RADIUS,
        background: "linear-gradient(135deg, #2163E7 0%, #1650b0 100%)",
        boxShadow: CARD_SHADOW,
      }}
    >
      {/* Decorative glow */}
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

        <div className="text-[12px] text-white/70 leading-snug mb-4">
          {description}
        </div>

        {onModelScenarios && (
          <button
            onClick={onModelScenarios}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold px-4 py-1.5 transition-colors"
          >
            <AlertCircle size={12} />
            Model scenarios
            <ArrowUpRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   7. V2DashboardHero — Main wrapper / composer
   ═══════════════════════════════════════════════════════════════════ */

interface DataRow {
  Month: number;
  [key: string]: number | string | undefined;
}

type EngineType = "subscription" | "ecommerce" | "saas";

interface V2DashboardHeroProps {
  data: DataRow[];
  milestones?: Record<string, unknown>;
  engine?: EngineType;
  onModelScenarios?: () => void;
}

/** Column resolution helpers — pick the best matching column from the dataframe */
function findCol(row: DataRow, ...candidates: string[]): string | null {
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(row).find((k) => k.toLowerCase() === lc);
    if (match && typeof row[match] === "number") return match;
  }
  // Fuzzy: find first column whose name includes the keyword
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(row).find(
      (k) => k.toLowerCase().includes(lc) && typeof row[k] === "number"
    );
    if (match) return match;
  }
  return null;
}

function num(row: DataRow, col: string | null): number {
  if (!col) return 0;
  const v = row[col];
  return typeof v === "number" ? v : 0;
}

export const V2DashboardHero = memo(function V2DashboardHero({
  data,
  milestones,
  engine = "subscription",
  onModelScenarios,
}: V2DashboardHeroProps) {
  // ── Resolve columns from the dataframe ──
  const columns = useMemo(() => {
    if (!data.length) return { revenue: null, oneTime: null, cost: null, profit: null, customers: null, churn: null, arpu: null, cac: null };
    const sample = data[0];
    const revenueCol = findCol(sample, "Total Revenue", "Revenue", "MRR", "Monthly Revenue", "Gross Revenue");
    const oneTimeCol = findCol(sample, "One-Time Revenue", "Setup Fees", "One Time");
    const costCol = findCol(sample, "Total Costs", "Costs", "Total Expenses", "Expenses", "COGS");
    const profitCol = findCol(sample, "Net Profit", "Profit", "Net Income", "EBITDA");
    const customersCol = findCol(sample, "Total Customers", "Customers", "Active Subscribers", "Users", "Subscribers");
    const churnCol = findCol(sample, "Churn Rate", "Churn", "Monthly Churn");
    const arpuCol = findCol(sample, "ARPU", "Average Revenue Per User", "Avg Revenue");
    const cacCol = findCol(sample, "CAC", "Customer Acquisition Cost");
    return { revenue: revenueCol, oneTime: oneTimeCol, cost: costCol, profit: profitCol, customers: customersCol, churn: churnCol, arpu: arpuCol, cac: cacCol };
  }, [data]);

  // ── Build chart data ──
  const chartData: RevenueBarData[] = useMemo(() => {
    return data.map((row) => ({
      month: typeof row.Month === "number" ? row.Month : 0,
      revenue: num(row, columns.revenue),
      oneTime: num(row, columns.oneTime),
      projected: 0,
    }));
  }, [data, columns]);

  // ── Break-even ──
  const breakEvenMonth = useMemo(() => {
    if (!milestones) return null;
    const raw = milestones.break_even_month;
    if (typeof raw === "number" && raw > 0) return raw;
    if (typeof raw === "string" && !isNaN(Number(raw))) return Number(raw);
    return null;
  }, [milestones]);

  // ── Metrics from last vs penultimate row ──
  const metrics: MetricStripItem[] = useMemo(() => {
    if (data.length < 2) return [];
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const items: MetricStripItem[] = [];

    // Revenue metric
    if (columns.revenue) {
      const curr = num(last, columns.revenue);
      const prv = num(prev, columns.revenue);
      const pct = prv ? ((curr - prv) / prv) * 100 : 0;
      items.push({
        label: engine === "subscription" ? "MRR" : "Revenue",
        value: formatCurrency(curr),
        trend: formatPercent(pct),
        good: pct >= 0,
        spark: data.map((r) => num(r, columns.revenue)),
      });
    }

    // Customers
    if (columns.customers) {
      const curr = num(last, columns.customers);
      const prv = num(prev, columns.customers);
      const pct = prv ? ((curr - prv) / prv) * 100 : 0;
      items.push({
        label: "Customers",
        value: curr >= 1000 ? `${(curr / 1000).toFixed(1)}K` : `${Math.round(curr)}`,
        trend: formatPercent(pct),
        good: pct >= 0,
        spark: data.map((r) => num(r, columns.customers)),
      });
    }

    // Profit
    if (columns.profit) {
      const curr = num(last, columns.profit);
      const prv = num(prev, columns.profit);
      const pct = prv ? ((curr - prv) / Math.abs(prv)) * 100 : 0;
      items.push({
        label: "Net Profit",
        value: formatCurrency(curr),
        trend: formatPercent(pct),
        good: curr >= 0,
        spark: data.map((r) => num(r, columns.profit)),
      });
    }

    // Churn (only for subscription / saas)
    if (columns.churn && engine !== "ecommerce") {
      const curr = num(last, columns.churn);
      const prv = num(prev, columns.churn);
      const pct = prv ? ((curr - prv) / prv) * 100 : 0;
      items.push({
        label: "Churn Rate",
        value: `${(curr * (curr < 1 ? 100 : 1)).toFixed(1)}%`,
        trend: formatPercent(pct),
        good: pct <= 0, // lower churn is good
        spark: data.map((r) => num(r, columns.churn)),
      });
    }

    return items;
  }, [data, columns, engine]);

  // ── Cost donut segments ──
  const donutSegments: DonutSegment[] = useMemo(() => {
    if (!data.length) return [];
    const last = data[data.length - 1];
    const segments: DonutSegment[] = [];

    // Collect numeric cost-like columns
    const costKeywords = ["cost", "expense", "salary", "marketing", "server", "hosting", "infrastructure", "support", "cogs", "opex"];
    const usedKeys = new Set<string>();

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
        costKeywords.some((ck) => lk.includes(ck))
      ) {
        usedKeys.add(key);
        segments.push({
          label: key,
          value: last[key] as number,
          color: ["#1650b0", "#2163E7", "#7BA3F0", "#BDD0F8", "#F59E0B", "#10B981"][
            segments.length % 6
          ],
        });
      }
    });

    // Fallback: if no cost breakdown found but total cost exists, show single segment
    if (segments.length === 0 && columns.cost) {
      const v = num(last, columns.cost);
      if (v > 0) {
        segments.push({ label: "Total Costs", value: v, color: "#2163E7" });
      }
    }

    return segments;
  }, [data, columns]);

  // ── MRR / Revenue big number ──
  const heroValue = data.length > 0 ? num(data[data.length - 1], columns.revenue) : 0;
  const heroLabel = engine === "subscription" ? "Monthly Recurring Revenue" : "Total Revenue";

  // ── Break-even description ──
  const breakEvenDescription = breakEvenMonth
    ? `Your model projects break-even at month ${breakEvenMonth}. Adjust inputs to explore different scenarios.`
    : "Break-even has not been reached within the modeled timeframe.";

  return (
    <div className="flex flex-col gap-5 font-lato">
      {/* ── Hero MRR Card + Chart ── */}
      <div
        className="bg-white overflow-hidden"
        style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
      >
        <div className="px-6 pt-6 pb-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af] mb-1">
            {heroLabel}
          </div>
          <div className="text-[44px] font-black text-[#1a1a2e] leading-none tabular-nums">
            {formatCurrency(heroValue)}
          </div>
          {data.length >= 2 && columns.revenue && (
            <div className="flex items-center gap-2 mt-2">
              {(() => {
                const prev = num(data[data.length - 2], columns.revenue);
                const pct = prev ? ((heroValue - prev) / prev) * 100 : 0;
                const good = pct >= 0;
                return (
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
                );
              })()}
              <span className="text-[11px] text-[#c4c9d8]">vs previous month</span>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="px-2 pb-4">
          <RevenueHeroChart data={chartData} breakEvenMonth={breakEvenMonth} />
        </div>
      </div>

      {/* ── Secondary Row: Metrics + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {metrics.length > 0 && <MetricStripCard metrics={metrics} />}
        {donutSegments.length > 0 && (
          <div
            className="bg-white p-5"
            style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af] mb-3">
              Cost Structure
            </div>
            <MiniDonut segments={donutSegments} totalLabel="Total / mo" />
          </div>
        )}
      </div>

      {/* ── Bottom Row: Break-Even + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BreakEvenCallout
          month={breakEvenMonth}
          description={breakEvenDescription}
          onModelScenarios={onModelScenarios}
        />
        <ActivityFeed
          items={buildActivityItems(data, columns, engine)}
        />
      </div>
    </div>
  );
});

/* ── Activity feed auto-generation from data ── */

function buildActivityItems(
  data: DataRow[],
  columns: { revenue: string | null; customers: string | null; profit: string | null },
  engine: EngineType
): ActivityFeedItem[] {
  if (data.length < 2) return [];
  const items: ActivityFeedItem[] = [];
  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  // Revenue milestone
  if (columns.revenue) {
    const curr = num(last, columns.revenue);
    const prv = num(prev, columns.revenue);
    if (curr > prv) {
      items.push({
        icon: <TrendingUp size={14} />,
        color: COLORS.green,
        bg: "#ecfdf5",
        text: `Revenue grew ${formatPercent(((curr - prv) / (prv || 1)) * 100)} to ${formatCurrency(curr)}`,
        time: `Month ${last.Month}`,
      });
    }
  }

  // Customer growth
  if (columns.customers) {
    const curr = num(last, columns.customers);
    const prv = num(prev, columns.customers);
    const diff = Math.round(curr - prv);
    if (diff > 0) {
      items.push({
        icon: <ArrowUpRight size={14} />,
        color: COLORS.primaryBlue,
        bg: "#EBF0FD",
        text: `${diff} new ${engine === "ecommerce" ? "customers" : "subscribers"} added`,
        time: `Month ${last.Month}`,
      });
    }
  }

  // Profitability check
  if (columns.profit) {
    const curr = num(last, columns.profit);
    const prv = num(prev, columns.profit);
    if (curr >= 0 && prv < 0) {
      items.push({
        icon: <Zap size={14} />,
        color: COLORS.yellow,
        bg: "#fffbeb",
        text: "Reached profitability this month!",
        time: `Month ${last.Month}`,
      });
    } else if (curr < 0) {
      items.push({
        icon: <AlertCircle size={14} />,
        color: COLORS.red,
        bg: "#fef2f2",
        text: `Net loss of ${formatCurrency(Math.abs(curr))}`,
        time: `Month ${last.Month}`,
      });
    }
  }

  // Pad with earlier data if we have few items
  if (items.length < 3 && data.length >= 3) {
    const m2 = data[data.length - 3];
    if (columns.revenue) {
      const r2 = num(prev, columns.revenue);
      const r3 = num(m2, columns.revenue);
      if (r2 > r3) {
        items.push({
          icon: <TrendingUp size={14} />,
          color: COLORS.green,
          bg: "#ecfdf5",
          text: `Revenue was ${formatCurrency(r2)} in month ${prev.Month}`,
          time: `Month ${prev.Month}`,
        });
      }
    }
  }

  return items.slice(0, 5);
}

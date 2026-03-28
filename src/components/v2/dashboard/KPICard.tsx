"use client";

/**
 * v2 KPI Metric Card with sparkline and trend badge.
 * Matches Figma Make design: compact card, sparkline, trend pill.
 */

import { memo } from "react";
import { V2_CARD_HOVER_CLASS } from "@/components/v2/charts/tokens";

/* ─── Types ─── */

interface KPICardProps {
  label: string;
  value: string;
  trend?: {
    value: string;
    /** Whether this trend direction is good (green) or bad (red) */
    positive: boolean;
  };
  /** Optional subtitle below value (e.g. "vs last month") */
  subtitle?: string;
  /** Array of numbers for sparkline (last 6-12 data points) */
  sparkData?: number[];
  /** Color override for sparkline (defaults to primary or red based on trend) */
  sparkColor?: string;
}

/* ─── Mini Sparkline ─── */

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const W = 56;
  const H = 28;
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

  // Area fill path
  const areaD = `${d} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block flex-shrink-0">
      <path d={areaD} fill={color} opacity={0.08} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

/* ─── Card ─── */

export const KPICard = memo(function KPICard({
  label,
  value,
  trend,
  subtitle,
  sparkData,
  sparkColor,
}: KPICardProps) {
  const resolvedColor =
    sparkColor ??
    (trend?.positive !== false ? "#2163E7" : "#EF4444");

  return (
    <div className={`${V2_CARD_HOVER_CLASS} p-5 flex flex-col gap-3 min-w-0`}>
      {/* Label */}
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">
        {label}
      </div>

      {/* Value */}
      <div className="text-[22px] font-black text-[#1a1a2e] leading-none tabular-nums">
        {value}
      </div>

      {/* Trend + Sparkline row */}
      <div className="flex items-center justify-between gap-2">
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              trend.positive
                ? "bg-[#ecfdf5] text-[#10B981]"
                : "bg-[#fef2f2] text-[#EF4444]"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}

        {subtitle && !trend && (
          <span className="text-[11px] text-[#9ca3af]">{subtitle}</span>
        )}

        {sparkData && sparkData.length > 2 && (
          <MiniSparkline data={sparkData} color={resolvedColor} />
        )}
      </div>

      {subtitle && trend && (
        <div className="text-[11px] text-[#c4c9d8] -mt-1">{subtitle}</div>
      )}
    </div>
  );
});

/* ─── Milestones Card (simpler, no sparkline) ─── */

interface MilestoneCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export const MilestoneCard = memo(function MilestoneCard({
  label,
  value,
  icon,
}: MilestoneCardProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#eef0f6] px-4 py-3 flex items-center gap-3 min-w-0">
      {icon && (
        <div className="w-8 h-8 rounded-[8px] bg-[#EBF0FD] flex items-center justify-center flex-shrink-0 text-[#2163E7]">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#9ca3af] truncate">
          {label}
        </div>
        <div className="text-[15px] font-extrabold text-[#1a1a2e] leading-tight tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
});

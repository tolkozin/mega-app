"use client";

/**
 * v2 PlotlyChart — Drop-in replacement for the original PlotlyChart.
 *
 * Changes from v1:
 *  - New color palette (blue scale instead of purple primary)
 *  - Rounded card with shadow-v2-card
 *  - Lato font, refined grid/axis styling
 *  - Better tooltip defaults
 *  - Same API — swap import path and all charts update
 *
 * Migration:
 *   - import { PlotlyChart, CHART_COLORS, ... } from "@/components/dashboard/charts/PlotlyChart"
 *   + import { PlotlyChart, CHART_COLORS, ... } from "@/components/v2/charts/PlotlyChart"
 */

import { memo } from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  V2_CHART_COLORS,
  V2_DONUT_COLORS,
  V2_CHART_LAYOUT,
  V2_CHART_HEIGHTS,
  V2_CARD_CLASS,
  type V2ChartSize,
} from "./tokens";

/* ─── Lazy Plotly ─── */

function ChartSkeleton({ height }: { height: string }) {
  return (
    <div
      className="w-full animate-pulse rounded-[16px] bg-[#f0f1f7]"
      style={{ height }}
    />
  );
}

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <ChartSkeleton height="320px" />,
});

/* ─── Types ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartLayout = Partial<Omit<Plotly.Layout, "title">> & { title?: any; [key: string]: any };

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout?: ChartLayout;
  title?: string;
  description?: string;
  className?: string;
  size?: V2ChartSize;
  /** Optional trend badge next to title — e.g. "+18.3%" */
  trend?: { value: string; positive: boolean };
}

/* ─── Backward-compatible exports (same names as v1) ─── */

export const CHART_COLORS = {
  primary: V2_CHART_COLORS.primary,
  primaryLight: "rgba(33,99,231,0.12)",
  green: V2_CHART_COLORS.positive,
  greenLight: V2_CHART_COLORS.positiveLight,
  red: V2_CHART_COLORS.negative,
  redLight: V2_CHART_COLORS.negativeLight,
  amber: V2_CHART_COLORS.warning,
  amberLight: V2_CHART_COLORS.warningLight,
  purple: V2_CHART_COLORS.light,
  purpleLight: "rgba(123,163,240,0.12)",
  teal: "#14B8A6",
  tealLight: "rgba(20,184,166,0.12)",
  muted: V2_CHART_COLORS.muted,
  grid: V2_CHART_COLORS.grid,
  bg: V2_CHART_COLORS.card,
};

export const DONUT_COLORS = V2_DONUT_COLORS;

/* ─── Component ─── */

export const PlotlyChart = memo(function PlotlyChart({
  data,
  layout,
  title,
  description,
  className,
  size = "medium",
  trend,
}: PlotlyChartProps) {
  const isMobile = useIsMobile();
  const h = V2_CHART_HEIGHTS[size];
  const chartHeight = isMobile ? h.mobile : h.desktop;
  const fontSize = isMobile
    ? V2_CHART_LAYOUT.fontSize.mobile
    : size === "small"
      ? V2_CHART_LAYOUT.fontSize.small
      : V2_CHART_LAYOUT.fontSize.desktop;
  const hasPlotlyTitle = !!(layout as Record<string, unknown>)?.title;
  const topMargin = hasPlotlyTitle ? 30 : 12;
  const margins = isMobile ? V2_CHART_LAYOUT.margin.mobile : V2_CHART_LAYOUT.margin.desktop;

  return (
    <div
      className={`${V2_CARD_CLASS} p-5 md:p-6 ${className ?? ""}`}
      style={{ minHeight: chartHeight }}
    >
      {(title || description) && (
        <div className="mb-3">
          <div className="flex items-center gap-2.5">
            {title && (
              <h3 className="text-[15px] font-extrabold text-[#1a1a2e] leading-tight">
                {title}
              </h3>
            )}
            {trend && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                  trend.positive
                    ? "bg-[#ecfdf5] text-[#10B981]"
                    : "bg-[#fef2f2] text-[#EF4444]"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          {description && (
            <p className="text-[12px] text-[#9ca3af] mt-1 font-medium">
              {description}
            </p>
          )}
        </div>
      )}

      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: { ...margins, t: topMargin },
          font: {
            size: fontSize,
            family: V2_CHART_LAYOUT.font.family,
            color: V2_CHART_LAYOUT.font.color,
          },
          legend: {
            orientation: V2_CHART_LAYOUT.legend.orientation,
            y: V2_CHART_LAYOUT.legend.y,
            x: V2_CHART_LAYOUT.legend.x,
            xanchor: V2_CHART_LAYOUT.legend.xanchor,
            font: { size: isMobile ? 9 : 11, family: V2_CHART_LAYOUT.font.family },
          },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          xaxis: {
            gridcolor: V2_CHART_COLORS.grid,
            zerolinecolor: V2_CHART_COLORS.grid,
            tickfont: { color: V2_CHART_COLORS.axis, size: fontSize },
            showline: false,
            ...((layout as Record<string, unknown>)?.xaxis as object ?? {}),
          },
          yaxis: {
            gridcolor: V2_CHART_COLORS.grid,
            zerolinecolor: V2_CHART_COLORS.grid,
            tickfont: { color: V2_CHART_COLORS.axis, size: fontSize },
            showline: false,
            ...((layout as Record<string, unknown>)?.yaxis as object ?? {}),
          },
          hoverlabel: {
            bgcolor: "#1a1a2e",
            font: { color: "#fff", size: 12, family: V2_CHART_LAYOUT.font.family },
            bordercolor: "rgba(123,163,240,0.2)",
          },
          ...layout,
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
        useResizeHandler
        style={{ width: "100%", height: chartHeight }}
      />
    </div>
  );
});

/* ─── Helpers (same API as v1, updated colors) ─── */

/** Vertical dashed lines at phase boundaries */
export function phaseLines(p1End: number, p2End: number): Partial<Plotly.Shape>[] {
  return [
    {
      type: "line",
      x0: p1End + 0.5, x1: p1End + 0.5,
      y0: 0, y1: 1, yref: "paper",
      line: { dash: "dash", color: V2_CHART_COLORS.axis, width: 1 },
    },
    {
      type: "line",
      x0: p2End + 0.5, x1: p2End + 0.5,
      y0: 0, y1: 1, yref: "paper",
      line: { dash: "dash", color: V2_CHART_COLORS.axis, width: 1 },
    },
  ];
}

/** Area trace with gradient fill */
export function gradientArea(
  x: number[],
  y: number[],
  name: string,
  color: string,
  lightColor: string,
): Partial<Plotly.Data> {
  return {
    x,
    y,
    mode: "lines",
    name,
    fill: "tozeroy",
    fillcolor: lightColor,
    line: { color, width: 2.5, shape: "spline" },
  } as Partial<Plotly.Data>;
}

/** Base + Pessimistic + Optimistic scenario lines */
export function scenarioLines(
  months: number[],
  base: number[],
  pess: number[],
  opt: number[],
  baseName = "Base",
): Partial<Plotly.Data>[] {
  return [
    {
      x: months,
      y: base,
      mode: "lines",
      name: baseName,
      line: { color: V2_CHART_COLORS.primary, width: 2.5, shape: "spline" },
    } as Partial<Plotly.Data>,
    {
      x: months,
      y: pess,
      mode: "lines",
      name: "Pessimistic",
      line: { dash: "dot", color: V2_CHART_COLORS.negative, width: 1.5 },
    } as Partial<Plotly.Data>,
    {
      x: months,
      y: opt,
      mode: "lines",
      name: "Optimistic",
      line: { dash: "dash", color: V2_CHART_COLORS.positive, width: 1.5 },
    } as Partial<Plotly.Data>,
  ];
}

/** Stacked bar traces (v2 style — blue sequential palette) */
export function stackedBars(
  x: number[],
  segments: { y: number[]; name: string }[],
): Partial<Plotly.Data>[] {
  const colors = [
    V2_CHART_COLORS.deep,
    V2_CHART_COLORS.primary,
    V2_CHART_COLORS.light,
    V2_CHART_COLORS.pale,
  ];
  return segments.map((seg, i) => ({
    x,
    y: seg.y,
    name: seg.name,
    type: "bar" as const,
    marker: {
      color: colors[i % colors.length],
      line: { width: 0 },
    },
  }));
}

/** Break-even annotation marker */
export function breakEvenAnnotation(
  month: number,
  label = "Break-even",
): Partial<Plotly.Shape>[] {
  return [
    {
      type: "line",
      x0: month, x1: month,
      y0: 0, y1: 1, yref: "paper",
      line: { dash: "dash", color: V2_CHART_COLORS.positive, width: 1.5 },
    },
  ];
}

export function breakEvenLabel(
  month: number,
  label = "Break-even",
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return [
    {
      x: month,
      y: 1,
      yref: "paper",
      text: `<b>${label} · M${month}</b>`,
      showarrow: false,
      font: { size: 10, color: V2_CHART_COLORS.positive, family: V2_CHART_LAYOUT.font.family },
      bgcolor: V2_CHART_COLORS.positiveLight,
      borderpad: 4,
    },
  ];
}

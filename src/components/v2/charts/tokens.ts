/**
 * v2 Chart Design Tokens
 * Single source of truth for all chart styling across the app.
 * Maps to CSS variables in globals.css (--v2-chart-*)
 *
 * Usage:
 *   import { V2_CHART_COLORS, V2_CHART_LAYOUT } from "@/components/v2/charts/tokens";
 */

/* ─── Color Palette ─── */

export const V2_CHART_COLORS = {
  // Sequential blue scale (for stacked bars, multi-series)
  deep: "#1650b0",
  primary: "#2163E7",
  light: "#7BA3F0",
  pale: "#BDD0F8",

  // Semantic
  positive: "#10B981",
  positiveLight: "rgba(16,185,129,0.12)",
  negative: "#EF4444",
  negativeLight: "rgba(239,68,68,0.10)",
  warning: "#F59E0B",
  warningLight: "rgba(245,158,11,0.12)",

  // UI
  grid: "#f0f1f7",
  axis: "#c4c9d8",
  label: "#6b7280",
  text: "#1a1a2e",
  muted: "#9ca3af",
  card: "#ffffff",
  bg: "#f8f9fc",
};

/** Ordered palette for donut/pie charts and multi-series */
export const V2_DONUT_COLORS = [
  V2_CHART_COLORS.deep,
  V2_CHART_COLORS.primary,
  V2_CHART_COLORS.light,
  V2_CHART_COLORS.pale,
  V2_CHART_COLORS.warning,
  V2_CHART_COLORS.positive,
];

/** Scenario line styles */
export const V2_SCENARIO_STYLES = {
  base: { color: V2_CHART_COLORS.primary, width: 2.5, dash: undefined as string | undefined },
  pessimistic: { color: V2_CHART_COLORS.negative, width: 1.5, dash: "dot" },
  optimistic: { color: V2_CHART_COLORS.positive, width: 1.5, dash: "dash" },
} as const;

/* ─── Layout Defaults ─── */

export const V2_CHART_LAYOUT = {
  font: {
    family: "Lato, system-ui, sans-serif",
    color: V2_CHART_COLORS.label,
  },
  margin: {
    desktop: { l: 52, r: 16, t: 12, b: 36 },
    mobile: { l: 36, r: 8, t: 8, b: 30 },
  },
  fontSize: {
    desktop: 11,
    mobile: 9,
    small: 10,
  },
  legend: {
    orientation: "h" as const,
    y: -0.18,
    x: 0.5,
    xanchor: "center" as const,
  },
  grid: {
    color: V2_CHART_COLORS.grid,
    width: 1,
  },
  axis: {
    tickcolor: V2_CHART_COLORS.axis,
    gridcolor: V2_CHART_COLORS.grid,
    zerolinecolor: V2_CHART_COLORS.grid,
    showline: false,
  },
  bar: {
    cornerRadius: 6,
  },
  phase: {
    lineColor: "#d1d5db",
    lineWidth: 1,
    dash: "dash" as const,
  },
} as const;

/* ─── Heights ─── */

export type V2ChartSize = "hero" | "medium" | "small";

export const V2_CHART_HEIGHTS: Record<V2ChartSize, { mobile: string; desktop: string }> = {
  hero: { mobile: "260px", desktop: "400px" },
  medium: { mobile: "200px", desktop: "320px" },
  small: { mobile: "160px", desktop: "240px" },
};

/* ─── Card Wrapper Classes ─── */

export const V2_CARD_CLASS = "bg-white rounded-[16px] shadow-v2-card";
export const V2_CARD_HOVER_CLASS = "bg-white rounded-[16px] shadow-v2-card hover:shadow-v2-md hover:-translate-y-0.5 transition-all duration-200";

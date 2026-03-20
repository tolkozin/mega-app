"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useMediaQuery";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type ChartSize = "hero" | "medium" | "small";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartLayout = Partial<Omit<Plotly.Layout, "title">> & { title?: any; [key: string]: any };

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout?: ChartLayout;
  title?: string;
  description?: string;
  className?: string;
  size?: ChartSize;
}

const HEIGHTS: Record<ChartSize, { mobile: string; desktop: string }> = {
  hero: { mobile: "240px", desktop: "420px" },
  medium: { mobile: "180px", desktop: "320px" },
  small: { mobile: "140px", desktop: "220px" },
};

/* Consistent color palette */
export const CHART_COLORS = {
  primary: "#5E81F4",
  primaryLight: "rgba(94,129,244,0.15)",
  green: "#14A660",
  greenLight: "rgba(20,166,96,0.12)",
  red: "#E54545",
  redLight: "rgba(229,69,69,0.10)",
  amber: "#F4A93E",
  amberLight: "rgba(244,169,62,0.12)",
  purple: "#8B5CF6",
  purpleLight: "rgba(139,92,246,0.12)",
  teal: "#14B8A6",
  tealLight: "rgba(20,184,166,0.12)",
  muted: "#8181A5",
  grid: "#ECECF2",
  bg: "#FFFFFF",
};

export const DONUT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  CHART_COLORS.purple,
  CHART_COLORS.teal,
  CHART_COLORS.red,
];

export function PlotlyChart({ data, layout, title, description, className, size = "medium" }: PlotlyChartProps) {
  const isMobile = useIsMobile();
  const h = HEIGHTS[size];
  const chartHeight = isMobile ? h.mobile : h.desktop;
  const fontSize = isMobile ? 9 : size === "small" ? 10 : 11;
  const hasPlotlyTitle = !!(layout as Record<string, unknown>)?.title;
  const topMargin = hasPlotlyTitle ? 30 : 10;

  return (
    <div className={`bg-white rounded-xl border border-[#ECECF2] p-4 ${className ?? ""}`}>
      {(title || description) && (
        <div className="mb-2">
          {title && <h3 className="text-sm font-bold text-[#1C1D21]">{title}</h3>}
          {description && <p className="text-[11px] text-[#8181A5] mt-0.5">{description}</p>}
        </div>
      )}
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: isMobile
            ? { l: 35, r: 10, t: topMargin, b: 30 }
            : { l: 50, r: 20, t: topMargin, b: 35 },
          font: { size: fontSize, family: "Lato, sans-serif", color: "#8181A5" },
          legend: {
            orientation: "h",
            y: -0.18,
            x: 0.5,
            xanchor: "center",
            font: { size: isMobile ? 9 : 11 },
          },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          xaxis: {
            gridcolor: CHART_COLORS.grid,
            zerolinecolor: CHART_COLORS.grid,
            tickfont: { color: "#8181A5" },
            ...((layout as Record<string, unknown>)?.xaxis as object ?? {}),
          },
          yaxis: {
            gridcolor: CHART_COLORS.grid,
            zerolinecolor: CHART_COLORS.grid,
            tickfont: { color: "#8181A5" },
            ...((layout as Record<string, unknown>)?.yaxis as object ?? {}),
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
}

// Helper: add vertical phase boundary lines
export function phaseLines(p1End: number, p2End: number): Partial<Plotly.Shape>[] {
  return [
    { type: "line", x0: p1End + 0.5, x1: p1End + 0.5, y0: 0, y1: 1, yref: "paper", line: { dash: "dash", color: "#D1D5DB", width: 1 } },
    { type: "line", x0: p2End + 0.5, x1: p2End + 0.5, y0: 0, y1: 1, yref: "paper", line: { dash: "dash", color: "#D1D5DB", width: 1 } },
  ];
}

/* Gradient area trace helper */
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

/* Scenario lines (base + pess + opt) helper */
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
      line: { color: CHART_COLORS.primary, width: 2.5, shape: "spline" },
    } as Partial<Plotly.Data>,
    {
      x: months,
      y: pess,
      mode: "lines",
      name: "Pessimistic",
      line: { dash: "dot", color: CHART_COLORS.red, width: 1.5 },
    } as Partial<Plotly.Data>,
    {
      x: months,
      y: opt,
      mode: "lines",
      name: "Optimistic",
      line: { dash: "dash", color: CHART_COLORS.green, width: 1.5 },
    } as Partial<Plotly.Data>,
  ];
}

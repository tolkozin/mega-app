"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useMediaQuery";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  title?: string;
  description?: string;
  className?: string;
}

export function PlotlyChart({ data, layout, title, description, className }: PlotlyChartProps) {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? "180px" : "350px";

  return (
    <div className={className}>
      {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
      {description && <p className="text-xs text-muted-foreground mb-2">{description}</p>}
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: isMobile ? { l: 35, r: 10, t: 20, b: 30 } : { l: 50, r: 20, t: 30, b: 40 },
          font: { size: isMobile ? 9 : 11 },
          legend: { orientation: "h", y: -0.15 },
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
    { type: "line", x0: p1End + 0.5, x1: p1End + 0.5, y0: 0, y1: 1, yref: "paper", line: { dash: "dash", color: "#9ca3af", width: 1 } },
    { type: "line", x0: p2End + 0.5, x1: p2End + 0.5, y0: 0, y1: 1, yref: "paper", line: { dash: "dash", color: "#9ca3af", width: 1 } },
  ];
}

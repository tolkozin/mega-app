declare module "react-plotly.js" {
  import { Component } from "react";

  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
  }

  export default class Plot extends Component<PlotParams> {}
}

declare namespace Plotly {
  interface Data {
    x?: (number | string)[];
    y?: (number | string)[];
    z?: number[][];
    type?: string;
    mode?: string;
    name?: string;
    fill?: string;
    stackgroup?: string;
    line?: Record<string, unknown>;
    marker?: Record<string, unknown>;
    visible?: boolean | "legendonly";
    yaxis?: string;
    [key: string]: unknown;
  }

  interface Layout {
    title?: string;
    autosize?: boolean;
    margin?: { l?: number; r?: number; t?: number; b?: number };
    font?: Record<string, unknown>;
    legend?: Record<string, unknown>;
    shapes?: Partial<Shape>[];
    barmode?: string;
    yaxis?: Record<string, unknown>;
    yaxis2?: Record<string, unknown>;
    xaxis?: Record<string, unknown>;
    [key: string]: unknown;
  }

  interface Shape {
    type: string;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    yref?: string;
    xref?: string;
    line?: Record<string, unknown>;
  }

  interface Config {
    responsive?: boolean;
    displayModeBar?: boolean;
    [key: string]: unknown;
  }

  interface Figure {
    data: Data[];
    layout: Layout;
  }
}

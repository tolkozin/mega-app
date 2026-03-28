/**
 * v2 Design System — barrel export
 *
 * NEW components go here. Once migration is complete,
 * delete /components/dashboard/ and /components/layout/ (old v1).
 */

// Charts
export { PlotlyChart, CHART_COLORS, DONUT_COLORS, phaseLines, gradientArea, scenarioLines, stackedBars, breakEvenAnnotation, breakEvenLabel } from "./charts/PlotlyChart";
export { V2_CHART_COLORS, V2_DONUT_COLORS, V2_SCENARIO_STYLES, V2_CHART_LAYOUT, V2_CHART_HEIGHTS, V2_CARD_CLASS, V2_CARD_HOVER_CLASS } from "./charts/tokens";
export type { V2ChartSize } from "./charts/tokens";

// Dashboard
export { KPICard, MilestoneCard } from "./dashboard/KPICard";

// Layout
export { V2Sidebar } from "./layout/V2Sidebar";
export { V2Header, V2DateRangeBar } from "./layout/V2Header";
export type { V2HeaderProps } from "./layout/V2Header";
export { V2BottomTabs } from "./layout/V2BottomTabs";
export { V2Shell } from "./layout/V2Shell";

// UI
export { FadeIn, StaggerGroup } from "./ui/FadeIn";
export { InfoTooltip, MetricTooltip } from "./ui/Tooltip";

// Reports
export { V2ReportSection } from "./dashboard/V2ReportSection";

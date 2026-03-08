export interface Benchmark {
  /**
   * Threshold at or beyond which the metric is considered healthy.
   * For "higher_better" metrics this is the minimum good value.
   * For "lower_better" metrics this is the maximum good value.
   */
  good: number;
  /**
   * Threshold at or beyond which the metric is considered acceptable but warrants attention.
   * For "higher_better" metrics this is the minimum warning value (below this is red).
   * For "lower_better" metrics this is the maximum warning value (above this is red).
   */
  warning: number;
  direction: "higher_better" | "lower_better";
}

/**
 * Industry benchmark thresholds for key SaaS, subscription, and ecommerce metrics.
 *
 * Color interpretation:
 *   - "higher_better": green >= good, yellow >= warning, red < warning
 *   - "lower_better":  green <= good, yellow <= warning, red > warning
 */
export const benchmarks: Record<string, Benchmark> = {
  "LTV/CAC": {
    good: 3,
    warning: 1.5,
    direction: "higher_better",
  },
  "NRR %": {
    good: 120,
    warning: 100,
    direction: "higher_better",
  },
  "Gross Margin %": {
    good: 70,
    warning: 50,
    direction: "higher_better",
  },
  "Rule of 40": {
    good: 40,
    warning: 20,
    direction: "higher_better",
  },
  "Quick Ratio": {
    good: 4,
    warning: 1,
    direction: "higher_better",
  },
  "ROAS": {
    good: 3,
    warning: 1.5,
    direction: "higher_better",
  },
  "Cumulative ROAS": {
    good: 3,
    warning: 1.5,
    direction: "higher_better",
  },
  "CAC Payback": {
    good: 12,
    warning: 18,
    direction: "lower_better",
  },
  "Monthly Churn %": {
    good: 3,
    warning: 7,
    direction: "lower_better",
  },
  "Magic Number": {
    good: 1,
    warning: 0.5,
    direction: "higher_better",
  },
  "GRR %": {
    good: 90,
    warning: 80,
    direction: "higher_better",
  },
};

/**
 * Returns a traffic-light color for a given metric value based on its benchmark thresholds,
 * or null if no benchmark is defined for the metric.
 */
export function getBenchmarkColor(
  metricKey: string,
  value: number
): "green" | "yellow" | "red" | null {
  const benchmark = benchmarks[metricKey];
  if (!benchmark) return null;

  if (benchmark.direction === "higher_better") {
    if (value >= benchmark.good) return "green";
    if (value >= benchmark.warning) return "yellow";
    return "red";
  } else {
    // lower_better
    if (value <= benchmark.good) return "green";
    if (value <= benchmark.warning) return "yellow";
    return "red";
  }
}

/**
 * Returns a human-readable benchmark label describing the threshold context for a metric,
 * or null if no benchmark is defined for the metric.
 *
 * Example: "LTV/CAC" → "Good: >3x, Warning: >1.5x"
 */
export function getBenchmarkLabel(metricKey: string): string | null {
  const benchmark = benchmarks[metricKey];
  if (!benchmark) return null;

  if (benchmark.direction === "higher_better") {
    return `Good: >${benchmark.good}, Warning: >${benchmark.warning}`;
  } else {
    return `Good: <${benchmark.good}, Warning: <${benchmark.warning}`;
  }
}

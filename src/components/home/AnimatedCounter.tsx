"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
}

export function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  duration = 1500,
  decimals = 0,
}: AnimatedCounterProps) {
  const { value, ref } = useCountUp(
    decimals > 0 ? end * Math.pow(10, decimals) : end,
    duration,
    true
  );

  const display =
    decimals > 0
      ? (value / Math.pow(10, decimals)).toFixed(decimals)
      : value.toLocaleString();

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

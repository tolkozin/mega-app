"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
  const { value, ref } = useCountUp(
    decimals > 0 ? end * Math.pow(10, decimals) : end,
    duration,
    true
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before hydration (SSR + bots): show the final value
  // After hydration (client): show animated value
  const display = mounted
    ? decimals > 0
      ? (value / Math.pow(10, decimals)).toFixed(decimals)
      : value.toLocaleString()
    : decimals > 0
      ? end.toFixed(decimals)
      : end.toLocaleString();

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

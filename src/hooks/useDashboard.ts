"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { runSubscriptionModel, runEcommerceModel, type RunResult } from "@/lib/api";

interface DashboardState {
  results: Record<string, RunResult> | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(modelType: "subscription" | "ecommerce") {
  const [state, setState] = useState<DashboardState>({
    results: null,
    loading: false,
    error: null,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const runModel = useCallback(
    async (config: Record<string, unknown>, scenarioParams?: Record<string, Record<string, number>>) => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const runFn = modelType === "subscription" ? runSubscriptionModel : runEcommerceModel;

        // Run 3 scenarios in parallel
        const scenarios = scenarioParams || {
          base: {}, pessimistic: {}, optimistic: {},
        };

        const [base, pessimistic, optimistic] = await Promise.all([
          runFn(config, scenarios.base),
          runFn(config, scenarios.pessimistic),
          runFn(config, scenarios.optimistic),
        ]);

        setState({
          results: { base, pessimistic, optimistic },
          loading: false,
          error: null,
        });
      } catch (err) {
        setState({
          results: null,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to run model",
        });
      }
    },
    [modelType]
  );

  const debouncedRun = useCallback(
    (config: Record<string, unknown>, scenarioParams?: Record<string, Record<string, number>>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runModel(config, scenarioParams), 500);
    },
    [runModel]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { ...state, runModel, debouncedRun };
}

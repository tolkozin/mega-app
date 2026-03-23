"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { runModelByEngine, type RunResult } from "@/lib/api";
import { getBaseEngine, type BaseEngine } from "@/lib/model-registry";

interface DashboardState {
  results: Record<string, RunResult> | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(modelType: string, engineOverride?: BaseEngine) {
  const [state, setState] = useState<DashboardState>({
    results: null,
    loading: false,
    error: null,
  });
  const [monthRange, setMonthRange] = useState<[number, number] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const runModel = useCallback(
    async (config: Record<string, unknown>, scenarioParams?: Record<string, Record<string, number>>) => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const engine = engineOverride ?? getBaseEngine(modelType);
        const runFn = (config: Record<string, unknown>, sensitivity?: Record<string, number>) =>
          runModelByEngine(engine, config, sensitivity);

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
        const raw = err instanceof Error ? err.message : "Failed to run model";
        // Map technical backend errors to user-friendly messages
        let message = raw;
        if (raw === "Invalid configuration") {
          message = "This configuration is not compatible with the selected model engine. Please check your settings or try a different engine.";
        } else if (raw.includes("timed out")) {
          message = "The model took too long to compute. Try reducing the number of months or Monte Carlo iterations.";
        } else if (raw === "Model execution failed") {
          message = "Something went wrong running the model. Please adjust your settings and try again.";
        }
        setState({
          results: null,
          loading: false,
          error: message,
        });
      }
    },
    [modelType, engineOverride]
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

  // Memoized filtered results based on month range
  const filteredResults = useMemo(() => {
    if (!state.results) return null;
    if (!monthRange) return state.results;

    const [start, end] = monthRange;
    const filterDataframe = (result: RunResult): RunResult => ({
      ...result,
      dataframe: result.dataframe.filter((row) => {
        const month = Number(row["Month"]);
        return month >= start && month <= end;
      }),
    });

    return {
      base: filterDataframe(state.results.base),
      pessimistic: filterDataframe(state.results.pessimistic),
      optimistic: filterDataframe(state.results.optimistic),
    };
  }, [state.results, monthRange]);

  // Total months available (for date range picker)
  const totalMonths = useMemo(() => {
    if (!state.results?.base?.dataframe?.length) return 0;
    return state.results.base.dataframe.length;
  }, [state.results]);

  return {
    results: filteredResults,
    rawResults: state.results,
    loading: state.loading,
    error: state.error,
    runModel,
    debouncedRun,
    monthRange,
    setMonthRange,
    totalMonths,
  };
}

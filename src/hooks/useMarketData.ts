"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MarketData } from "@/lib/types";

const EMPTY_MARKET_DATA: MarketData = {
  tam: { value: 0, source: "" },
  sam: { value: 0, source: "" },
  som: { value: 0, source: "" },
  competitors: [],
  audiences: [],
};

export function useMarketData(projectId: string | null) {
  const [data, setData] = useState<MarketData>(EMPTY_MARKET_DATA);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load market data from project
  useEffect(() => {
    if (!projectId) return;
    const supabase = createClient();
    supabase
      .from("projects")
      .select("market_data")
      .eq("id", projectId)
      .single()
      .then(({ data: row }) => {
        if (row?.market_data) {
          setData(row.market_data as MarketData);
        }
      });
  }, [projectId]);

  // Save with 1s debounce
  const save = useCallback(
    (newData: MarketData) => {
      setData(newData);
      if (!projectId) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaving(true);
        const supabase = createClient();
        await supabase
          .from("projects")
          .update({ market_data: newData })
          .eq("id", projectId);
        setSaving(false);
      }, 1000);
    },
    [projectId],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { data, save, saving };
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MarketData } from "@/lib/types";

const EMPTY_MARKET_DATA: MarketData = {
  regions: [],
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
          const raw = row.market_data as Record<string, unknown>;
          // Migrate old single-value format → regions
          if (raw.tam && !raw.regions) {
            const old = raw as {
              tam: { value: number; source: string };
              sam: { value: number; source: string };
              som: { value: number; source: string };
              competitors: MarketData["competitors"];
              audiences: MarketData["audiences"];
            };
            setData({
              regions: [
                {
                  id: crypto.randomUUID(),
                  name: "Global",
                  tam: old.tam.value,
                  sam: old.sam.value,
                  som: old.som.value,
                  source: old.tam.source || old.sam.source || old.som.source,
                },
              ],
              competitors: old.competitors || [],
              audiences: old.audiences || [],
            });
          } else {
            setData(raw as unknown as MarketData);
          }
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

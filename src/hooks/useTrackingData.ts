"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TrackingData } from "@/lib/types";

const EMPTY: TrackingData = { rows: [] };

export function useTrackingData(projectId: string | null) {
  const [data, setData] = useState<TrackingData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const supabase = createClient();
    supabase
      .from("projects")
      .select("tracking_data")
      .eq("id", projectId)
      .single()
      .then(({ data: row }) => {
        if (row?.tracking_data) {
          setData(row.tracking_data as unknown as TrackingData);
        }
      });
  }, [projectId]);

  const save = useCallback(
    (newData: TrackingData) => {
      setData(newData);
      if (!projectId) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaving(true);
        const supabase = createClient();
        await supabase
          .from("projects")
          .update({ tracking_data: newData })
          .eq("id", projectId);
        setSaving(false);
      }, 1000);
    },
    [projectId],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { data, save, saving };
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RoadmapData } from "@/lib/types";

const EMPTY: RoadmapData = { milestones: [] };

export function useRoadmapData(projectId: string | null) {
  const [data, setData] = useState<RoadmapData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const supabase = createClient();
    supabase
      .from("projects")
      .select("roadmap_data")
      .eq("id", projectId)
      .single()
      .then(({ data: row }) => {
        if (row?.roadmap_data) {
          setData(row.roadmap_data as unknown as RoadmapData);
        }
      });
  }, [projectId]);

  const save = useCallback(
    (newData: RoadmapData) => {
      setData(newData);
      if (!projectId) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaving(true);
        const supabase = createClient();
        await supabase
          .from("projects")
          .update({ roadmap_data: newData })
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

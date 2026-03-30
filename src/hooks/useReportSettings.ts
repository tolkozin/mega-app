"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReportSettings } from "@/lib/types";

const DEFAULT_SETTINGS: ReportSettings = {
  template: "minimal",
  accentColor: "#2163E7",
  fontFamily: "helvetica",
  logoUrl: null,
  companyName: "",
  sections: {
    executiveSummary: true,
    milestones: true,
    pnl: true,
    cashFlow: true,
    engineMetrics: true,
    scores: true,
    market: true,
    roadmap: true,
  },
  sectionOrder: [
    "executiveSummary",
    "milestones",
    "pnl",
    "cashFlow",
    "engineMetrics",
    "scores",
    "market",
    "roadmap",
  ],
};

export { DEFAULT_SETTINGS };

export function useReportSettings(projectId: string | null) {
  const [settings, setSettings] = useState<ReportSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const supabase = createClient();
    supabase
      .from("projects")
      .select("report_settings")
      .eq("id", projectId)
      .single()
      .then(({ data: row }) => {
        if (row?.report_settings) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...(row.report_settings as unknown as ReportSettings),
          });
        }
      });
  }, [projectId]);

  const save = useCallback(
    (newSettings: ReportSettings) => {
      setSettings(newSettings);
      if (!projectId) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaving(true);
        const supabase = createClient();
        await supabase
          .from("projects")
          .update({ report_settings: newSettings })
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

  return { settings, save, saving };
}

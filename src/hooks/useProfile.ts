"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { getPlanLimits, type PlanLimits } from "@/lib/plan-limits";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const activeRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (activeRef.current) {
      setProfile(data ?? null);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    activeRef.current = true;
    fetchProfile();
    return () => { activeRef.current = false; };
  }, [fetchProfile]);

  const limits: PlanLimits = getPlanLimits(profile?.plan ?? "expired");

  return { profile, loading, limits, refetch: fetchProfile };
}

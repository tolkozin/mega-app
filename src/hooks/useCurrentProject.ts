"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

export function useCurrentProject(productType: "subscription" | "ecommerce" | "saas") {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("product_type", productType)
      .order("created_at", { ascending: true })
      .limit(1);

    if (data && data.length > 0) {
      setProject(data[0] as Project);
    }
    setLoading(false);
  }, [productType]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const setProjectId = useCallback((id: string) => {
    // Optimistically set the project id, then refetch full data
    setProject((prev) => prev ? { ...prev, id } : { id, name: "", product_type: productType } as Project);
    fetchProject();
  }, [fetchProject, productType]);

  return { project, loading, refetch: fetchProject, setProjectId };
}

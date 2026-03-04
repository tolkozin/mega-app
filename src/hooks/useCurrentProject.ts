"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

export function useCurrentProject(productType: "subscription" | "ecommerce") {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get user's first project of this type
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
    };
    fetch();
  }, [productType]);

  return { project, loading };
}

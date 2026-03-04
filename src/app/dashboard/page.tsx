"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToProject = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Get first project to determine dashboard type
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1);

      if (projects && projects.length > 0) {
        const project = projects[0] as Project;
        router.push(`/dashboard/${project.product_type}`);
      } else {
        router.push("/onboarding");
      }
      setLoading(false);
    };

    redirectToProject();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return null;
}

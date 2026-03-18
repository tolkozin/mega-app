"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
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

      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1);

      if (projects && projects.length > 0) {
        const project = projects[0] as Project;
        router.push(`/dashboard/${project.product_type}`);
      } else {
        // No projects — check if user has an active plan
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        const plan = profile?.plan ?? "free";
        if (plan === "free" || plan === "expired") {
          router.push("/plans");
        } else {
          router.push("/onboarding");
        }
      }
      setLoading(false);
    };

    redirectToProject();
  }, [router]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <div className="text-[#8181A5]">Loading dashboard...</div>
        </div>
      </AppShell>
    );
  }

  return null;
}

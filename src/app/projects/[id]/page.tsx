"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProjectShares } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const { shares, addShare, removeShare } = useProjectShares(projectId);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<"viewer" | "editor">("viewer");
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (data) setProject(data);
    };
    fetch();
  }, [projectId]);

  const handleAddShare = async () => {
    setShareError("");
    try {
      await addShare(shareEmail, shareRole);
      setShareEmail("");
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Failed to share");
    }
  };

  if (!project) return <div className="container mx-auto p-6 text-muted-foreground">Loading...</div>;

  const isOwner = user?.id === project.user_id;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      <p className="text-muted-foreground mb-6">{project.description || "No description"}</p>

      <div className="flex gap-2 mb-8">
        <Link href={`/dashboard/${project.product_type}`}>
          <Button>Open Dashboard</Button>
        </Link>
        <Link href={`/projects/${project.id}/scenarios`}>
          <Button variant="outline">Scenarios</Button>
        </Link>
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1"
              />
              <Select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value as "viewer" | "editor")}
                options={[
                  { value: "viewer", label: "Viewer" },
                  { value: "editor", label: "Editor" },
                ]}
                className="w-32"
              />
              <Button onClick={handleAddShare} disabled={!shareEmail.trim()}>Share</Button>
            </div>
            {shareError && <p className="text-sm text-destructive">{shareError}</p>}

            {shares.length > 0 && (
              <div className="space-y-2">
                {shares.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm border rounded-md p-2">
                    <span>{s.email || s.shared_with_id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{s.role}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeShare(s.id)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

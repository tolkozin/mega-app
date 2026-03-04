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
  const { shares, addShare, updateRole, removeShare } = useProjectShares(projectId);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<"viewer" | "editor">("viewer");
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (data) setProject(data);
    };
    fetchProject();
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

  const handleRoleChange = async (shareId: string, newRole: "viewer" | "editor") => {
    try {
      await updateRole(shareId, newRole);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleRemove = async (shareId: string, email: string) => {
    if (!confirm(`Remove access for ${email}?`)) return;
    try {
      await removeShare(shareId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove share");
    }
  };

  if (!project) return <div className="container mx-auto p-6 text-muted-foreground">Loading...</div>;

  const isOwner = user?.id === project.user_id;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Link href="/projects" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
        &larr; Back to Projects
      </Link>

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
                <p className="text-sm font-medium text-muted-foreground">Shared with</p>
                {shares.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm border rounded-md p-2">
                    <span>{s.email || s.shared_with_id}</span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={s.role}
                        onChange={(e) => handleRoleChange(s.id, e.target.value as "viewer" | "editor")}
                        options={[
                          { value: "viewer", label: "Viewer" },
                          { value: "editor", label: "Editor" },
                        ]}
                        className="h-7 text-xs w-28"
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleRemove(s.id, s.email || s.shared_with_id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {shares.length === 0 && (
              <p className="text-sm text-muted-foreground">Not shared with anyone yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {!isOwner && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This project is shared with you. Only the owner can manage sharing settings.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

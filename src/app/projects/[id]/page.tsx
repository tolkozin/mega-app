"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProjectShares } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { V2Shell as AppShell } from "@/components/v2/layout/V2Shell";
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

  if (!project) {
    return (
      <AppShell title="Project">
        <div className="p-6 text-[#8181A5]">Loading...</div>
      </AppShell>
    );
  }

  const isOwner = user?.id === project.user_id;

  return (
    <AppShell title={project.name}>
      <div className="p-6 max-w-2xl">
        <Link href="/projects" className="text-sm text-[#8181A5] hover:text-[#2163E7] transition-colors mb-4 inline-flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Back to Projects
        </Link>

        <div className="mt-4 mb-6">
          <p className="text-[#8181A5] text-sm">{project.description || "No description"}</p>
        </div>

        <div className="flex gap-2 mb-8">
          <Link href={`/dashboard/${project.product_type}`}>
            <button className="h-9 px-4 bg-[#2163E7] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors">
              Open Dashboard
            </button>
          </Link>
          <Link href={`/projects/${project.id}/scenarios`}>
            <button className="h-9 px-4 border border-[#ECECF2] text-[#1C1D21] text-sm font-bold rounded-lg hover:bg-[#F8F8FC] transition-colors">
              Scenarios
            </button>
          </Link>
        </div>

        {isOwner && (
          <div className="bg-white rounded-xl border border-[#ECECF2] p-5">
            <h3 className="text-[15px] font-bold text-[#1C1D21] mb-4">Sharing</h3>
            <div className="flex gap-2 mb-4">
              <input
                placeholder="Email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#2163E7] focus:ring-1 focus:ring-[#2163E7]"
              />
              <select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value as "viewer" | "editor")}
                className="w-28 h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] focus:outline-none focus:border-[#2163E7]"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button
                onClick={handleAddShare}
                disabled={!shareEmail.trim()}
                className="h-10 px-4 bg-[#2163E7] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors disabled:opacity-50"
              >
                Share
              </button>
            </div>
            {shareError && <p className="text-sm text-red-500 mb-3">{shareError}</p>}

            {shares.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#8181A5] uppercase tracking-wider mb-2">Shared with</p>
                {shares.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm border border-[#ECECF2] rounded-lg p-3">
                    <span className="text-[#1C1D21]">{s.email || s.shared_with_id}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={s.role}
                        onChange={(e) => handleRoleChange(s.id, e.target.value as "viewer" | "editor")}
                        className="h-7 text-xs w-24 rounded-md border border-[#ECECF2] bg-white px-2 focus:outline-none focus:border-[#2163E7]"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button
                        onClick={() => handleRemove(s.id, s.email || s.shared_with_id)}
                        className="text-xs text-[#8181A5] hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8181A5]">Not shared with anyone yet.</p>
            )}
          </div>
        )}

        {!isOwner && (
          <div className="bg-white rounded-xl border border-[#ECECF2] p-5">
            <p className="text-sm text-[#8181A5]">This project is shared with you. Only the owner can manage sharing settings.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects, useSharedProjects } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import type { Project } from "@/lib/types";
import type { SharedProject } from "@/hooks/useProject";

const productTypeOptions = [
  { value: "subscription", label: "Subscription" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
];

function ProjectCard({
  project,
  isOwner,
  role,
  ownerEmail,
  onDelete,
}: {
  project: Project;
  isOwner: boolean;
  role?: "owner" | "viewer" | "editor";
  ownerEmail?: string;
  onDelete?: () => void;
}) {
  const typeColors: Record<string, string> = {
    subscription: "bg-[#5E81F4]/10 text-[#5E81F4]",
    ecommerce: "bg-[#F4845E]/10 text-[#F4845E]",
    saas: "bg-[#7B61FF]/10 text-[#7B61FF]",
  };

  const roleColors: Record<string, string> = {
    owner: "bg-[#5E81F4] text-white",
    editor: "bg-[#F4BE5E]/10 text-[#F4BE5E]",
    viewer: "bg-[#ECECF2] text-[#8181A5]",
  };

  return (
    <div className="bg-white rounded-xl border border-[#ECECF2] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${typeColors[project.product_type] || "bg-gray-100 text-gray-600"}`}>
            {project.product_type}
          </span>
          {role && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${roleColors[role] || ""}`}>
              {role}
            </span>
          )}
        </div>
        {isOwner && onDelete && (
          <button
            onClick={onDelete}
            className="text-[#8181A5] hover:text-red-500 transition-colors"
            title="Delete project"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4M12.67 4v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4" />
            </svg>
          </button>
        )}
      </div>

      <h3 className="text-[15px] font-bold text-[#1C1D21] mb-1">{project.name}</h3>
      <p className="text-sm text-[#8181A5] mb-1">{project.description || "No description"}</p>
      {ownerEmail && (
        <p className="text-xs text-[#8181A5] mb-1">Owner: {ownerEmail}</p>
      )}
      <p className="text-xs text-[#8181A5] mb-4">
        {new Date(project.created_at).toLocaleDateString()}
      </p>

      <div className="flex gap-2">
        <Link href={`/dashboard/${project.product_type}`}>
          <button className="h-8 px-3 bg-[#5E81F4] text-white text-xs font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors">
            Dashboard
          </button>
        </Link>
        <Link href={`/projects/${project.id}/scenarios`}>
          <button className="h-8 px-3 border border-[#ECECF2] text-[#1C1D21] text-xs font-bold rounded-lg hover:bg-[#F8F8FC] transition-colors">
            Scenarios
          </button>
        </Link>
        {isOwner && (
          <Link href={`/projects/${project.id}`}>
            <button className="h-8 px-3 border border-[#ECECF2] text-[#1C1D21] text-xs font-bold rounded-lg hover:bg-[#F8F8FC] transition-colors">
              Manage
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, createProject, deleteProject } = useProjects();
  const { sharedProjects, loading: sharedLoading } = useSharedProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState<"subscription" | "ecommerce" | "saas">("subscription");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createProject(name, description, productType);
      setName("");
      setDescription("");
      setShowCreate(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, projName: string) => {
    if (!confirm(`Delete project "${projName}"? This cannot be undone.`)) return;
    try {
      await deleteProject(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  if (loading && sharedLoading) {
    return (
      <AppShell title="Projects">
        <div className="p-6">
          <p className="text-[#8181A5]">Loading projects...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Projects">
      <div className="p-6 max-w-[1200px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1C1D21]">My Projects</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="h-9 px-4 bg-[#5E81F4] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors"
          >
            {showCreate ? "Cancel" : "+ New Project"}
          </button>
        </div>

        {showCreate && (
          <div className="bg-white rounded-xl border border-[#ECECF2] p-5 mb-6">
            <h3 className="text-[15px] font-bold text-[#1C1D21] mb-4">Create Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1C1D21] mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Project"
                  className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1C1D21] mb-2">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1C1D21] mb-2">Product Type</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as "subscription" | "ecommerce" | "saas")}
                  className="w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4]"
                >
                  {productTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                className="h-9 px-4 bg-[#5E81F4] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <p className="text-[#8181A5] mb-8">No projects yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isOwner={true}
                role="owner"
                onDelete={() => handleDelete(project.id, project.name)}
              />
            ))}
          </div>
        )}

        {/* Shared with me */}
        <h2 className="text-xl font-bold text-[#1C1D21] mb-3">Shared with me</h2>
        {sharedProjects.length === 0 ? (
          <p className="text-[#8181A5]">No projects shared with you yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedProjects.map((sp) => (
              <ProjectCard
                key={sp.id}
                project={sp}
                isOwner={false}
                role={sp.role}
                ownerEmail={sp.owner_email}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

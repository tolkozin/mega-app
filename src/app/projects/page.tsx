"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects, useSharedProjects } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/lib/types";
import type { SharedProject } from "@/hooks/useProject";

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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
            {project.product_type}
          </span>
          {role && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                role === "owner"
                  ? "bg-primary text-primary-foreground"
                  : role === "editor"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {role}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
        {ownerEmail && (
          <p className="text-xs text-muted-foreground mt-1">Owner: {ownerEmail}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Created {new Date(project.created_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Link href={`/dashboard/${project.product_type}`}>
          <Button size="sm">Open Dashboard</Button>
        </Link>
        <Link href={`/projects/${project.id}/scenarios`}>
          <Button size="sm" variant="outline">Scenarios</Button>
        </Link>
        {isOwner && (
          <>
            <Link href={`/projects/${project.id}`}>
              <Button size="sm" variant="outline">Manage</Button>
            </Link>
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, createProject, deleteProject } = useProjects();
  const { sharedProjects, loading: sharedLoading } = useSharedProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState<"subscription" | "ecommerce">("subscription");
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
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "New Project"}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Create Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
            </div>
            <div className="space-y-2">
              <Label>Product Type</Label>
              <Select
                value={productType}
                onChange={(e) => setProductType(e.target.value as "subscription" | "ecommerce")}
                options={[
                  { value: "subscription", label: "Subscription (SaaS)" },
                  { value: "ecommerce", label: "E-commerce" },
                ]}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreate} disabled={creating || !name.trim()}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* My Projects */}
      <h2 className="text-lg font-semibold mb-3">My Projects</h2>
      {projects.length === 0 ? (
        <p className="text-muted-foreground mb-8">No projects yet. Create your first one!</p>
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
      <h2 className="text-lg font-semibold mb-3">Shared with me</h2>
      {sharedProjects.length === 0 ? (
        <p className="text-muted-foreground">No projects shared with you yet.</p>
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
  );
}

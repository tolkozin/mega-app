"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, createProject, deleteProject } = useProjects();
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

  if (loading) {
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

      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet. Create your first one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-secondary">
                  {project.product_type}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
                <p className="text-xs text-muted-foreground mt-2">
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
                {user?.id === project.user_id && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(project.id, project.name)}
                  >
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, Scenario, ProjectShare } from "@/lib/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setProjects(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(
    async (name: string, description: string, productType: "subscription" | "ecommerce" | "saas") => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: user.id, name, description, product_type: productType })
        .select()
        .single();

      if (error) throw error;
      await fetchProjects();
      return data as Project;
    },
    [supabase, fetchProjects]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      await fetchProjects();
    },
    [supabase, fetchProjects]
  );

  return { projects, loading, fetchProjects, createProject, deleteProject };
}

export function useScenarios(projectId: string | null) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchScenarios = useCallback(async () => {
    if (!projectId) {
      setScenarios([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (!error && data) setScenarios(data);
    setLoading(false);
  }, [supabase, projectId]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const saveScenario = useCallback(
    async (name: string, notes: string, config: Record<string, unknown>) => {
      if (!projectId) throw new Error("No project selected");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("scenarios").insert({
        project_id: projectId,
        user_id: user.id,
        name,
        notes,
        config,
      });

      if (error) throw error;
      await fetchScenarios();
    },
    [supabase, projectId, fetchScenarios]
  );

  const deleteScenario = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("scenarios").delete().eq("id", id);
      if (error) throw error;
      await fetchScenarios();
    },
    [supabase, fetchScenarios]
  );

  return { scenarios, loading, fetchScenarios, saveScenario, deleteScenario };
}

export function useProjectShares(projectId: string | null) {
  const [shares, setShares] = useState<(ProjectShare & { email?: string })[]>([]);
  const supabase = createClient();

  const fetchShares = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from("project_shares")
      .select("*, profiles!project_shares_shared_with_id_fkey(email)")
      .eq("project_id", projectId);

    if (data) {
      setShares(
        data.map((s: Record<string, unknown>) => ({
          ...s,
          email: (s.profiles as Record<string, string>)?.email,
        })) as (ProjectShare & { email?: string })[]
      );
    }
  }, [supabase, projectId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const addShare = useCallback(
    async (email: string, role: "viewer" | "editor") => {
      if (!projectId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find user by email
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (!profile) throw new Error("User not found");

      const { error } = await supabase.from("project_shares").insert({
        project_id: projectId,
        owner_id: user.id,
        shared_with_id: profile.id,
        role,
      });

      if (error) throw error;
      await fetchShares();
    },
    [supabase, projectId, fetchShares]
  );

  const updateRole = useCallback(
    async (shareId: string, role: "viewer" | "editor") => {
      const { error } = await supabase
        .from("project_shares")
        .update({ role })
        .eq("id", shareId);
      if (error) throw error;
      await fetchShares();
    },
    [supabase, fetchShares]
  );

  const removeShare = useCallback(
    async (shareId: string) => {
      const { error } = await supabase.from("project_shares").delete().eq("id", shareId);
      if (error) throw error;
      await fetchShares();
    },
    [supabase, fetchShares]
  );

  return { shares, fetchShares, addShare, updateRole, removeShare };
}

export interface SharedProject extends Project {
  role: "viewer" | "editor";
  owner_email?: string;
}

export function useSharedProjects() {
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSharedProjects = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("project_shares")
      .select("role, projects(*), profiles!project_shares_owner_id_fkey(email)")
      .eq("shared_with_id", user.id);

    if (!error && data) {
      const mapped = data
        .filter((s: Record<string, unknown>) => s.projects)
        .map((s: Record<string, unknown>) => ({
          ...(s.projects as Project),
          role: s.role as "viewer" | "editor",
          owner_email: (s.profiles as Record<string, string>)?.email,
        }));
      setSharedProjects(mapped);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSharedProjects();
  }, [fetchSharedProjects]);

  return { sharedProjects, loading, fetchSharedProjects };
}

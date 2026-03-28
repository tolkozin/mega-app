"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, ExternalLink, GitBranch, Settings, Trash2 } from "lucide-react";
import { useProjects, useSharedProjects, UpgradeRequiredError } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { V2Shell as AppShell } from "@/components/v2/layout/V2Shell";
import { getAllModels, getModelDef } from "@/lib/model-registry";
import type { Project } from "@/lib/types";
import type { SharedProject } from "@/hooks/useProject";

/* ─── Helpers ─── */

const allModels = getAllModels();

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}


/* ─── ProjectCard ─── */

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const def = getModelDef(project.product_type);
  const ModelIcon = def.icon;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? "0 4px 8px rgba(0,0,0,0.04), 0 20px 48px rgba(33,99,231,0.12)"
          : "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)",
        fontFamily: "'Lato', sans-serif",
      }}
      className="bg-white rounded-[16px] p-[22px] relative cursor-default transition-shadow"
    >
      {/* Top row: badge + menu */}
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
          style={{ backgroundColor: def.color + "18", color: def.color }}
        >
          <ModelIcon className="w-3.5 h-3.5" />
          {def.label}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{
              opacity: hovered || menuOpen ? 1 : 0,
              background: menuOpen ? "#f0f1f7" : "transparent",
            }}
          >
            <MoreHorizontal className="w-4 h-4 text-[#6b7280]" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-9 z-50 w-44 bg-white rounded-xl border border-[#eef0f6] py-1.5"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
              >
                <Link
                  href={`/dashboard/${project.product_type}`}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#1a1a2e] hover:bg-[#f8f9fc] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="w-4 h-4 text-[#9ca3af]" />
                  Open
                </Link>
                <Link
                  href={`/projects/${project.id}/scenarios`}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#1a1a2e] hover:bg-[#f8f9fc] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <GitBranch className="w-4 h-4 text-[#9ca3af]" />
                  Scenarios
                </Link>
                {isOwner && (
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#1a1a2e] hover:bg-[#f8f9fc] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-[#9ca3af]" />
                    Manage
                  </Link>
                )}
                {isOwner && onDelete && (
                  <>
                    <div className="mx-3 my-1 border-t border-[#eef0f6]" />
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(); }}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Project info */}
      <Link href={`/dashboard/${project.product_type}`} className="block">
        <h3 className="text-[15px] font-bold text-[#1a1a2e] mb-1 truncate">{project.name}</h3>
        <p className="text-sm text-[#9ca3af] mb-0.5 truncate">{project.description || "No description"}</p>
        {ownerEmail && (
          <p className="text-xs text-[#c4c9d8] mb-0.5">Shared by {ownerEmail}</p>
        )}
        {role && role !== "owner" && (
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mt-1"
            style={{
              backgroundColor: role === "editor" ? "#F4BE5E18" : "#eef0f6",
              color: role === "editor" ? "#F4BE5E" : "#9ca3af",
            }}
          >
            {role}
          </span>
        )}
      </Link>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-[#c4c9d8]">
          Edited {timeAgo(project.created_at)}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── NewProjectPlaceholder ─── */

function NewProjectPlaceholder({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="rounded-[16px] p-[22px] flex flex-col items-center justify-center gap-3 min-h-[200px] transition-all cursor-pointer"
      style={{
        border: `2px dashed ${hovered ? "#2163E7" : "#eef0f6"}`,
        background: hovered ? "#2163E708" : "transparent",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <motion.div
        animate={{ scale: hovered ? 1.15 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: hovered ? "#2163E715" : "#f0f1f7" }}
      >
        <Plus className="w-5 h-5" style={{ color: hovered ? "#2163E7" : "#9ca3af" }} />
      </motion.div>
      <span className="text-sm font-semibold" style={{ color: hovered ? "#2163E7" : "#9ca3af" }}>
        Create new project
      </span>
    </motion.button>
  );
}

/* ─── NewProjectModal ─── */

function NewProjectModal({
  open,
  onClose,
  name,
  setName,
  description,
  setDescription,
  productType,
  setProductType,
  creating,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  productType: string;
  setProductType: (v: string) => void;
  creating: boolean;
  onCreate: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] w-full max-w-[520px] p-7"
            style={{
              boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-5">Create new project</h2>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Project name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Startup"
                autoFocus
                className="w-full h-11 px-3.5 rounded-xl border border-[#eef0f6] bg-white text-sm text-[#1a1a2e] placeholder:text-[#c4c9d8] focus:outline-none focus:border-[#2163E7] focus:ring-2 focus:ring-[#2163E7]/20 transition-all"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Description <span className="text-[#c4c9d8] font-normal">(optional)</span></label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your business"
                className="w-full h-11 px-3.5 rounded-xl border border-[#eef0f6] bg-white text-sm text-[#1a1a2e] placeholder:text-[#c4c9d8] focus:outline-none focus:border-[#2163E7] focus:ring-2 focus:ring-[#2163E7]/20 transition-all"
              />
            </div>

            {/* Business model grid */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-2.5">Business model</label>
              <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                {allModels.map((m) => {
                  const Icon = m.icon;
                  const selected = productType === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setProductType(m.key)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all text-sm"
                      style={{
                        borderColor: selected ? m.color : "#eef0f6",
                        backgroundColor: selected ? m.color + "10" : "transparent",
                        boxShadow: selected ? `0 0 0 1px ${m.color}40` : "none",
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: m.color + "18" }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-semibold text-[#1a1a2e] truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="h-10 px-5 text-sm font-semibold text-[#6b7280] bg-[#f0f1f7] rounded-xl hover:bg-[#e8e9ef] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onCreate}
                disabled={creating || !name.trim()}
                className="h-10 px-5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
                style={{ background: "#2163E7" }}
                onMouseEnter={(e) => { if (!creating && name.trim()) e.currentTarget.style.background = "#1a52c9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#2163E7"; }}
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Page ─── */

export function ProjectsClient() {
  const { user } = useAuth();
  const { projects, loading, createProject, deleteProject } = useProjects();
  const { sharedProjects, loading: sharedLoading } = useSharedProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState<string>("subscription");
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
      if (err instanceof UpgradeRequiredError) {
        useUpgradeStore.getState().showUpgradeModal({
          feature: err.feature,
          currentPlan: err.currentPlan,
          limitValue: err.limitValue,
        });
      } else {
        alert(err instanceof Error ? err.message : "Failed to create project");
      }
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
        <div className="p-6 flex items-center justify-center min-h-[40vh]">
          <p className="text-[#9ca3af] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>Loading projects...</p>
        </div>
      </AppShell>
    );
  }

  const totalCount = projects.length + sharedProjects.length;

  return (
    <AppShell title="Projects">
      <div className="p-6 max-w-[1200px]" style={{ fontFamily: "'Lato', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Projects</h1>
            <p className="text-sm text-[#9ca3af]">
              {totalCount} project{totalCount !== 1 ? "s" : ""} &middot; Financial models
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="h-10 px-5 text-sm font-bold text-white rounded-xl inline-flex items-center gap-2 transition-all"
            style={{ background: "#2163E7" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1a52c9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2163E7"; }}
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* My Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isOwner={true}
                role="owner"
                onDelete={() => handleDelete(project.id, project.name)}
              />
            ))}
          </AnimatePresence>
          <NewProjectPlaceholder onClick={() => setShowCreate(true)} />
        </div>

        {/* Shared with me */}
        {(sharedProjects.length > 0 || !sharedLoading) && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-bold text-[#1a1a2e]">Shared with me</h2>
              {sharedProjects.length > 0 && (
                <span className="text-xs font-bold text-[#9ca3af] bg-[#f0f1f7] px-2 py-0.5 rounded-full">
                  {sharedProjects.length}
                </span>
              )}
            </div>
            {sharedProjects.length === 0 ? (
              <p className="text-sm text-[#c4c9d8]">No projects shared with you yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {sharedProjects.map((sp) => (
                    <ProjectCard
                      key={sp.id}
                      project={sp}
                      isOwner={false}
                      role={sp.role}
                      ownerEmail={sp.owner_email}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <NewProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        productType={productType}
        setProductType={setProductType}
        creating={creating}
        onCreate={handleCreate}
      />
    </AppShell>
  );
}

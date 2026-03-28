"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { V2Shell as AppShell } from "@/components/v2/layout/V2Shell";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getPlanLimits } from "@/lib/plan-limits";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronDown, Check, AlertTriangle } from "lucide-react";
import { useCurrencyStore } from "@/stores/currency-store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  email: string;
  display_name: string;
  username: string;
  telegram: string;
  phone: string;
  whatsapp: string;
  company_name: string;
  company_address: string;
  tax_id: string;
  bank_details: string;
  lemon_squeezy_customer_id?: string;
  lemon_squeezy_subscription_id?: string;
  subscription_status?: string;
  plan: "free" | "expired" | "plus" | "pro" | "enterprise";
  ai_chat_count: number;
  ai_report_count: number;
  ai_voice_seconds: number;
  ai_period_start: string;
  created_at: string;
}

interface TeamMember {
  shared_with_id: string;
  email: string;
  role: "viewer" | "editor";
  share_ids: string[];
  status: "Active";
}

// ─── Design tokens ───────────────────────────────────────────────────────────

const cardStyle =
  "bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.06)]";

const inputClass =
  "w-full h-[40px] px-3 rounded-[10px] border-[1.5px] border-[#eef0f6] bg-[#f8f9fc] text-sm text-[#1a1a2e] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#2163E7] focus:ring-0 transition-colors font-[Lato]";

const inputReadonlyClass =
  "w-full h-[40px] px-3 rounded-[10px] border-[1.5px] border-[#eef0f6] bg-[#f8f9fc] text-sm text-[#9ca3af] cursor-not-allowed select-none font-[Lato]";

const sectionDivider = "border-t border-[#f0f1f7] my-8";

// ─── Shared components ───────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-[#1a1a2e] font-[Lato]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Banner({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-sm px-4 py-2.5 rounded-[10px] font-[Lato] ${
        type === "error"
          ? "bg-red-50 text-red-600 border border-red-200"
          : "bg-emerald-50 text-emerald-600 border border-emerald-200"
      }`}
    >
      {message}
    </motion.div>
  );
}

function SaveToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-[12px] bg-[#1a1a2e] text-white text-sm font-medium shadow-lg font-[Lato]"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          Changes saved successfully
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AvatarCircle({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email
    ? email[0].toUpperCase()
    : "?";

  return (
    <div className="relative group cursor-pointer">
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-xl font-bold font-[Lato] select-none"
        style={{
          background: "linear-gradient(135deg, #7BA3F0, #2163E7)",
        }}
      >
        {initials}
      </div>
      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white text-xs font-medium font-[Lato]">
          Change
        </span>
      </div>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = "profile" | "contacts" | "team" | "delete";

const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "contacts", label: "Contacts" },
  { key: "team", label: "Team" },
  { key: "delete", label: "Delete Account" },
];

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function ProfileTab({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (p: Profile) => void;
}) {
  const supabase = createClient();
  const [username, setUsername] = useState(profile.username ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Preferences state
  const globalCurrencyStore = useCurrencyStore();
  const [currency, setCurrency] = useState(globalCurrencyStore.currency);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(false);

  const handleSaveProfile = async () => {
    setError("");
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", profile.id);
      if (err) throw err;
      onSaved({ ...profile, username });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (!newPassword) {
      setPwError("New password is required");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }

    setPwSaving(true);
    try {
      // Re-authenticate with current password first
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (signInErr) throw new Error("Current password is incorrect");

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateErr) throw updateErr;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwSaved(true);
      setPwSuccess("Password updated successfully");
      setTimeout(() => {
        setPwSaved(false);
        setPwSuccess("");
      }, 3000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="space-y-0">
      {/* Profile header card */}
      <div className={`${cardStyle} p-6 mb-6`}>
        <div className="flex items-center gap-5">
          <AvatarCircle
            name={profile.display_name || profile.username || ""}
            email={profile.email}
          />
          <div>
            <h2 className="text-lg font-bold text-[#1a1a2e] font-[Lato]">
              {profile.display_name || profile.username || "User"}
            </h2>
            <p className="text-sm text-[#6b7280] font-[Lato]">
              {profile.email}
            </p>
            {memberSince && (
              <p className="text-xs text-[#9ca3af] mt-1 font-[Lato]">
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info card */}
      <div className={`${cardStyle} p-6 mb-6`}>
        <h3 className="text-base font-bold text-[#1a1a2e] mb-5 font-[Lato]">
          Basic Info
        </h3>
        <div className="space-y-4">
          <Field label="Full Name">
            <input
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
            />
          </Field>
          <Field label="Email">
            <div className="relative">
              <input
                className={inputReadonlyClass}
                value={profile.email}
                readOnly
                tabIndex={-1}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            </div>
          </Field>
          {error && <Banner type="error" message={error} />}
        </div>
      </div>

      {/* Preferences card */}
      <div className={`${cardStyle} p-6 mb-6`}>
        <h3 className="text-base font-bold text-[#1a1a2e] mb-5 font-[Lato]">
          Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="Currency">
            <div className="relative">
              <select
                className={`${inputClass} appearance-none pr-9`}
                value={currency}
                onChange={(e) => {
                  const val = e.target.value as import("@/stores/currency-store").CurrencyCode;
                  setCurrency(val);
                  globalCurrencyStore.setCurrency(val);
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (&euro;)</option>
                <option value="GBP">GBP (&pound;)</option>
                <option value="JPY">JPY (&yen;)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
            </div>
          </Field>
        </div>

        {/* Notification toggles */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-[#1a1a2e] font-[Lato]">
            Notifications
          </label>
          <ToggleRow
            label="Email notifications"
            description="Receive important updates via email"
            checked={notifyEmail}
            onChange={setNotifyEmail}
          />
          <ToggleRow
            label="Product updates"
            description="Get notified about new features"
            checked={notifyUpdates}
            onChange={setNotifyUpdates}
          />
        </div>
      </div>

      {/* Change Password card */}
      <div className={`${cardStyle} p-6 mb-6`}>
        <h3 className="text-base font-bold text-[#1a1a2e] mb-5 font-[Lato]">
          Change Password
        </h3>
        <div className="space-y-4">
          <Field label="Current Password">
            <input
              type="password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </Field>
          <Field label="New Password">
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm New Password">
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </Field>
          {pwError && <Banner type="error" message={pwError} />}
          {pwSuccess && <Banner type="success" message={pwSuccess} />}
          <div className="pt-1">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePassword}
              disabled={pwSaving}
              className="h-10 px-6 text-sm font-bold rounded-[10px] bg-[#2163E7] hover:bg-[#1a53c7] text-white transition-colors disabled:opacity-50 font-[Lato]"
            >
              {pwSaving
                ? "Updating..."
                : pwSaved
                ? "Updated"
                : "Update Password"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Save Changes button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSaveProfile}
        disabled={saving}
        className="w-full h-12 text-sm font-bold rounded-[10px] text-white transition-all disabled:opacity-50 font-[Lato]"
        style={{
          background: saved
            ? "#14A660"
            : "linear-gradient(135deg, #2163E7, #1a53c7)",
        }}
      >
        {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
      </motion.button>

      <SaveToast show={saved} />
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[#1a1a2e] font-medium font-[Lato]">
          {label}
        </p>
        <p className="text-xs text-[#9ca3af] font-[Lato]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-[#2163E7]" : "bg-[#e5e7eb]"
        }`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          style={{ left: checked ? 22 : 2 }}
        />
      </button>
    </div>
  );
}

// ─── Tab: Contacts ────────────────────────────────────────────────────────────

function ContactsTab({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (p: Profile) => void;
}) {
  const supabase = createClient();
  const [telegram, setTelegram] = useState(profile.telegram ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("profiles")
        .update({ telegram, phone, whatsapp })
        .eq("id", profile.id);
      if (err) throw err;
      onSaved({ ...profile, telegram, phone, whatsapp });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${cardStyle} p-6`}>
        <h3 className="text-base font-bold text-[#1a1a2e] mb-5 font-[Lato]">
          Contact Info
        </h3>
        <div className="space-y-4">
          <Field label="Email">
            <div className="relative">
              <input
                className={inputReadonlyClass}
                value={profile.email}
                readOnly
                tabIndex={-1}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            </div>
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              className={inputClass}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </Field>
          <Field label="Telegram Handle">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af] pointer-events-none select-none font-[Lato]">
                @
              </span>
              <input
                className={`${inputClass} pl-7`}
                value={
                  telegram.startsWith("@") ? telegram.slice(1) : telegram
                }
                onChange={(e) =>
                  setTelegram(e.target.value.replace(/^@/, ""))
                }
                placeholder="username"
              />
            </div>
          </Field>
          {error && <Banner type="error" message={error} />}
        </div>
      </div>

      {/* Save Changes button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 text-sm font-bold rounded-[10px] text-white transition-all disabled:opacity-50 font-[Lato]"
        style={{
          background: saved
            ? "#14A660"
            : "linear-gradient(135deg, #2163E7, #1a53c7)",
        }}
      >
        {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
      </motion.button>

      <SaveToast show={saved} />
    </div>
  );
}

// ─── Tab: Team ────────────────────────────────────────────────────────────────

function TeamTab({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<"viewer" | "editor">("viewer");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>(
    []
  );
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch projects owned by the user
      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: true });

      const ownedProjects = projectData ?? [];
      setProjects(ownedProjects);

      if (ownedProjects.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const projectIds = ownedProjects.map((p) => p.id);

      // Fetch all shares for owned projects
      const { data: sharesData } = await supabase
        .from("project_shares")
        .select("id, project_id, shared_with_id, role")
        .in("project_id", projectIds)
        .eq("owner_id", profile.id);

      if (!sharesData || sharesData.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Fetch profile emails for all shared_with_ids
      const sharedIds = [
        ...new Set(sharesData.map((s) => s.shared_with_id)),
      ];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", sharedIds);

      const profileMap: Record<string, string> = {};
      (profilesData ?? []).forEach((p) => {
        profileMap[p.id] = p.email;
      });

      // Group shares by user (shared_with_id) — show each email once
      const grouped: Record<string, TeamMember> = {};
      for (const s of sharesData) {
        if (!grouped[s.shared_with_id]) {
          grouped[s.shared_with_id] = {
            shared_with_id: s.shared_with_id,
            email: profileMap[s.shared_with_id] ?? "Unknown",
            role: s.role,
            share_ids: [s.id],
            status: "Active",
          };
        } else {
          grouped[s.shared_with_id].share_ids.push(s.id);
        }
      }

      setMembers(Object.values(grouped));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const handleAdd = async () => {
    setError("");
    setSuccess("");
    const email = addEmail.trim().toLowerCase();
    if (!email) {
      setError("Enter an email address");
      return;
    }

    if (projects.length === 0) {
      setError("You have no projects to share. Create a project first.");
      return;
    }

    // Check plan limit for shares (count unique members)
    const limits = getPlanLimits(profile.plan);
    if (limits.maxShares !== Infinity && members.length >= limits.maxShares) {
      useUpgradeStore.getState().showUpgradeModal({
        feature: "sharing",
        currentPlan: profile.plan,
        limitValue: `${limits.maxShares} people`,
      });
      return;
    }

    setAdding(true);
    try {
      // Look up profile by email
      const { data: targetProfile, error: lookupErr } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .single();

      if (lookupErr || !targetProfile) {
        setError("No account found for that email address.");
        return;
      }
      if (targetProfile.id === profile.id)
        throw new Error("You cannot add yourself");

      // Check if this user already has shares for all projects
      const existingMember = members.find(
        (m) => m.shared_with_id === targetProfile.id
      );
      if (existingMember && existingMember.share_ids.length >= projects.length) {
        throw new Error("This user already has access to all your projects");
      }

      // Create shares for ALL owned projects at once
      // First, get existing shares for this user to avoid duplicates
      const { data: existingShares } = await supabase
        .from("project_shares")
        .select("project_id")
        .eq("owner_id", profile.id)
        .eq("shared_with_id", targetProfile.id);

      const alreadySharedProjectIds = new Set(
        (existingShares ?? []).map((s) => s.project_id)
      );
      const newShares = projects
        .filter((p) => !alreadySharedProjectIds.has(p.id))
        .map((p) => ({
          project_id: p.id,
          owner_id: profile.id,
          shared_with_id: targetProfile.id,
          role: addRole,
        }));

      if (newShares.length === 0) {
        throw new Error("This user already has access to all your projects");
      }

      const { error: insertErr } = await supabase
        .from("project_shares")
        .insert(newShares);

      if (insertErr) throw insertErr;

      setAddEmail("");
      const projectCount = newShares.length;
      setSuccess(
        `${email} added to ${projectCount} project${
          projectCount !== 1 ? "s" : ""
        } successfully`
      );
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (e) {
      if (!error)
        setError(e instanceof Error ? e.message : "Failed to add user");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (member: TeamMember) => {
    setError("");
    try {
      // Remove all shares for this user across all projects
      for (const shareId of member.share_ids) {
        const { error: err } = await supabase
          .from("project_shares")
          .delete()
          .eq("id", shareId)
          .eq("owner_id", profile.id);
        if (err) throw err;
      }
      setMembers((prev) =>
        prev.filter((m) => m.shared_with_id !== member.shared_with_id)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add user card */}
      <div className={`${cardStyle} p-6`}>
        <h3 className="text-base font-bold text-[#1a1a2e] mb-1 font-[Lato]">
          Add a team member
        </h3>
        <p className="text-sm text-[#9ca3af] mb-5 font-[Lato]">
          Adding a member shares all your projects with them at once.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input
            className={inputClass}
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="user@example.com"
            type="email"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="relative">
            <select
              className={`${inputClass} appearance-none pr-9`}
              value={addRole}
              onChange={(e) =>
                setAddRole(e.target.value as "viewer" | "editor")
              }
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
          </div>
        </div>
        {error && <Banner type="error" message={error} />}
        {success && <Banner type="success" message={success} />}
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            disabled={adding}
            className="h-10 px-6 text-sm font-bold rounded-[10px] bg-[#2163E7] hover:bg-[#1a53c7] text-white transition-colors disabled:opacity-50 font-[Lato]"
          >
            {adding ? "Adding..." : "Add Member"}
          </motion.button>
        </div>
      </div>

      {/* Members table card */}
      <div className={`${cardStyle} overflow-hidden`}>
        {loading ? (
          <div className="py-12 text-center text-sm text-[#9ca3af] font-[Lato]">
            Loading...
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#9ca3af] font-[Lato]">
            No shared access yet. Add team members above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f0f1f7] bg-[#f8f9fc]">
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wider font-[Lato]">
                  Email
                </th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wider font-[Lato]">
                  Role
                </th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wider font-[Lato]">
                  Status
                </th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr
                  key={m.shared_with_id}
                  className={`${
                    i !== members.length - 1
                      ? "border-b border-[#f0f1f7]"
                      : ""
                  } hover:bg-[#f8f9fc] transition-colors`}
                >
                  <td className="px-5 py-3.5 text-[#1a1a2e] font-[Lato]">
                    {m.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-[Lato] ${
                        m.role === "editor"
                          ? "bg-[#2163E7]/10 text-[#2163E7]"
                          : "bg-[#6b7280]/10 text-[#6b7280]"
                      }`}
                    >
                      {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 font-[Lato]">
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleRemove(m)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors font-[Lato]"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Delete Account ──────────────────────────────────────────────────────

function DeleteAccountTab({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const canDelete = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!canDelete) return;
    setError("");
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");

      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete account");
      setDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Danger Zone card */}
      <div className="bg-[#fffafa] rounded-[16px] border-[1.5px] border-[#fee2e2] p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-0.5 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#1a1a2e] mb-1 font-[Lato]">
              Danger Zone
            </h3>
            <p className="text-sm text-[#6b7280] mb-4 font-[Lato]">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>

            <div className="space-y-3 text-sm text-[#1a1a2e] mb-5 font-[Lato]">
              <p className="font-medium">
                Deleting your account will remove:
              </p>
              <ul className="space-y-2 ml-1">
                {[
                  "All projects and financial models",
                  "All scenarios and saved configurations",
                  "All invoices and invoice data",
                  "Your profile and account settings",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="h-10 px-6 text-sm font-bold rounded-[10px] border-[1.5px] border-red-300 text-red-600 bg-white hover:bg-red-50 transition-colors font-[Lato]"
            >
              Delete account
            </motion.button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(4px)" }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => !deleting && setShowModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative ${cardStyle} p-6 max-w-md w-full`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] font-[Lato]">
                  Confirm Deletion
                </h3>
              </div>

              <p className="text-sm text-[#6b7280] mb-5 font-[Lato]">
                This action is permanent and cannot be undone. Type{" "}
                <span className="font-bold text-red-600">DELETE</span> to
                confirm.
              </p>

              <Field label="Type DELETE to confirm">
                <input
                  className={`${inputClass} ${
                    canDelete
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  spellCheck={false}
                  autoComplete="off"
                  autoFocus
                />
              </Field>

              {error && (
                <div className="mt-3">
                  <Banner type="error" message={error} />
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setConfirmText("");
                  }}
                  disabled={deleting}
                  className="flex-1 h-10 text-sm font-semibold rounded-[10px] border-[1.5px] border-[#eef0f6] text-[#6b7280] bg-white hover:bg-[#f8f9fc] transition-colors disabled:opacity-50 font-[Lato]"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={canDelete ? { scale: 1.01 } : {}}
                  whileTap={canDelete ? { scale: 0.98 } : {}}
                  onClick={handleDelete}
                  disabled={!canDelete || deleting}
                  className="flex-1 h-10 text-sm font-bold rounded-[10px] bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-[Lato]"
                >
                  {deleting ? "Deleting..." : "Delete My Account"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SettingsClient() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "profile";
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as Tab;
    return TABS.some((t) => t.key === tab) ? tab : "profile";
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data ?? null);
      setProfileLoading(false);
    };
    fetchProfile();
  }, [user, supabase]);

  if (authLoading || profileLoading) {
    return (
      <AppShell title="Settings">
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-sm text-[#9ca3af] font-[Lato]">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell title="Settings">
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-sm text-red-500 font-[Lato]">
            Unable to load profile.
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings">
      <div className="p-6 max-w-[640px] mx-auto font-[Lato]">
        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-[#f8f9fc] border-[1.5px] border-[#eef0f6] rounded-[10px] p-1 mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`h-8 px-4 text-sm font-semibold rounded-[10px] transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? tab.key === "delete"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-[#2163E7] text-white shadow-sm"
                  : tab.key === "delete"
                  ? "text-red-500 hover:bg-red-50"
                  : "text-[#6b7280] hover:text-[#1a1a2e]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "profile" && (
          <ProfileTab profile={profile} onSaved={setProfile} />
        )}
        {activeTab === "contacts" && (
          <ContactsTab profile={profile} onSaved={setProfile} />
        )}
        {activeTab === "team" && <TeamTab profile={profile} />}
        {activeTab === "delete" && <DeleteAccountTab profile={profile} />}
      </div>
    </AppShell>
  );
}

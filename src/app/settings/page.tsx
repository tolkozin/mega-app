"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  email: string;
  display_name: string;
  username: string;
  telegram: string;
  company_name: string;
  company_address: string;
  tax_id: string;
  bank_details: string;
  stripe_customer_id?: string;
  plan: "free" | "pro" | "enterprise";
  created_at: string;
}

interface TeamMember {
  share_id: string;
  project_id: string;
  project_name: string;
  shared_with_id: string;
  email: string;
  role: "viewer" | "editor";
}

// ─── Input component ──────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-[#1C1D21]">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4]";

const inputReadonlyClass =
  "w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-[#F8F8FC] text-sm text-[#8181A5] cursor-not-allowed select-none";

// ─── Save button ──────────────────────────────────────────────────────────────

function SaveButton({
  saving,
  saved,
  onClick,
  label = "Save Changes",
}: {
  saving: boolean;
  saved: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`h-9 px-5 text-sm font-bold rounded-lg transition-colors disabled:opacity-50 ${
        saved
          ? "bg-[#14A660] text-white"
          : "bg-[#5E81F4] hover:bg-[#4B6FE0] text-white"
      }`}
    >
      {saving ? "Saving..." : saved ? "Saved" : label}
    </button>
  );
}

// ─── Status banner ────────────────────────────────────────────────────────────

function Banner({ type, message }: { type: "error" | "success"; message: string }) {
  if (!message) return null;
  return (
    <div
      className={`text-sm px-4 py-2.5 rounded-lg ${
        type === "error"
          ? "bg-[#E54545]/10 text-[#E54545] border border-[#E54545]/20"
          : "bg-[#14A660]/10 text-[#14A660] border border-[#14A660]/20"
      }`}
    >
      {message}
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = "profile" | "contacts" | "team" | "invoice" | "delete";

const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "contacts", label: "Contacts" },
  { key: "team", label: "Team" },
  { key: "invoice", label: "Invoice Data" },
  { key: "delete", label: "Delete Account" },
];

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function ProfileTab({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
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
    if (!newPassword) { setPwError("New password is required"); return; }
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match"); return; }

    setPwSaving(true);
    try {
      // Re-authenticate with current password first
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (signInErr) throw new Error("Current password is incorrect");

      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwSaved(true);
      setPwSuccess("Password updated successfully");
      setTimeout(() => { setPwSaved(false); setPwSuccess(""); }, 3000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#1C1D21]">Basic Info</h2>
        <Field label="Email">
          <input className={inputReadonlyClass} value={profile.email} readOnly tabIndex={-1} />
        </Field>
        <Field label="Username">
          <input
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your-username"
          />
        </Field>
        {error && <Banner type="error" message={error} />}
        <div className="pt-1">
          <SaveButton saving={saving} saved={saved} onClick={handleSaveProfile} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#ECECF2]" />

      {/* Change Password */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#1C1D21]">Change Password</h2>
        <Field label="Current Password">
          <input
            type="password"
            className={inputClass}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>
        <Field label="New Password">
          <input
            type="password"
            className={inputClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm New Password">
          <input
            type="password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
        {pwError && <Banner type="error" message={pwError} />}
        {pwSuccess && <Banner type="success" message={pwSuccess} />}
        <div className="pt-1">
          <SaveButton saving={pwSaving} saved={pwSaved} onClick={handleChangePassword} label="Update Password" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Contacts ────────────────────────────────────────────────────────────

function ContactsTab({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const supabase = createClient();
  const [telegram, setTelegram] = useState(profile.telegram ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("profiles")
        .update({ telegram })
        .eq("id", profile.id);
      if (err) throw err;
      onSaved({ ...profile, telegram });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-base font-bold text-[#1C1D21]">Contact Info</h2>
      <Field label="Email">
        <input className={inputReadonlyClass} value={profile.email} readOnly tabIndex={-1} />
      </Field>
      <Field label="Telegram Handle">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8181A5] pointer-events-none select-none">
            @
          </span>
          <input
            className={`${inputClass} pl-7`}
            value={telegram.startsWith("@") ? telegram.slice(1) : telegram}
            onChange={(e) => setTelegram(e.target.value.replace(/^@/, ""))}
            placeholder="username"
          />
        </div>
      </Field>
      {error && <Banner type="error" message={error} />}
      <div className="pt-1">
        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
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
  const [addProjectId, setAddProjectId] = useState("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
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
      if (ownedProjects.length > 0 && !addProjectId) {
        setAddProjectId(ownedProjects[0].id);
      }

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
      const sharedIds = [...new Set(sharesData.map((s) => s.shared_with_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", sharedIds);

      const profileMap: Record<string, string> = {};
      (profilesData ?? []).forEach((p) => { profileMap[p.id] = p.email; });

      const projectMap: Record<string, string> = {};
      ownedProjects.forEach((p) => { projectMap[p.id] = p.name; });

      setMembers(
        sharesData.map((s) => ({
          share_id: s.id,
          project_id: s.project_id,
          project_name: projectMap[s.project_id] ?? s.project_id,
          shared_with_id: s.shared_with_id,
          email: profileMap[s.shared_with_id] ?? "Unknown",
          role: s.role,
        }))
      );
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
    if (!email) { setError("Enter an email address"); return; }
    if (!addProjectId) { setError("Select a project"); return; }

    setAdding(true);
    try {
      // Look up profile by email
      const { data: targetProfile, error: lookupErr } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .single();

      if (lookupErr || !targetProfile) throw new Error("No account found for that email address");
      if (targetProfile.id === profile.id) throw new Error("You cannot add yourself");

      const { error: insertErr } = await supabase.from("project_shares").insert({
        project_id: addProjectId,
        owner_id: profile.id,
        shared_with_id: targetProfile.id,
        role: addRole,
      });
      if (insertErr) {
        if (insertErr.code === "23505") throw new Error("This user already has access to that project");
        throw insertErr;
      }

      setAddEmail("");
      setSuccess(`${email} added successfully`);
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add user");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (shareId: string) => {
    setError("");
    try {
      const { error: err } = await supabase
        .from("project_shares")
        .delete()
        .eq("id", shareId)
        .eq("owner_id", profile.id);
      if (err) throw err;
      setMembers((prev) => prev.filter((m) => m.share_id !== shareId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove user");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-base font-bold text-[#1C1D21]">Shared Access</h2>

      {/* Add user form */}
      <div className="bg-white border border-[#ECECF2] rounded-xl p-4 space-y-3">
        <p className="text-sm font-bold text-[#1C1D21]">Add a team member</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <input
              className={inputClass}
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="user@example.com"
              type="email"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div>
            <select
              className={inputClass}
              value={addProjectId}
              onChange={(e) => setAddProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className={inputClass}
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as "viewer" | "editor")}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
        </div>
        {error && <Banner type="error" message={error} />}
        {success && <Banner type="success" message={success} />}
        <button
          onClick={handleAdd}
          disabled={adding}
          className="h-9 px-5 text-sm font-bold rounded-lg bg-[#5E81F4] hover:bg-[#4B6FE0] text-white transition-colors disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add Member"}
        </button>
      </div>

      {/* Members table */}
      <div className="bg-white border border-[#ECECF2] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-sm text-[#8181A5]">Loading...</div>
        ) : members.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#8181A5]">
            No shared access yet. Add team members above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ECECF2] bg-[#F8F8FC]">
                <th className="text-left px-4 py-3 font-bold text-[#1C1D21] text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 font-bold text-[#1C1D21] text-xs uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 font-bold text-[#1C1D21] text-xs uppercase tracking-wide">Role</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr
                  key={m.share_id}
                  className={`${i !== members.length - 1 ? "border-b border-[#ECECF2]" : ""} hover:bg-[#F8F8FC] transition-colors`}
                >
                  <td className="px-4 py-3 text-[#1C1D21]">{m.email}</td>
                  <td className="px-4 py-3 text-[#8181A5]">{m.project_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        m.role === "editor"
                          ? "bg-[#5E81F4]/10 text-[#5E81F4]"
                          : "bg-[#8181A5]/10 text-[#8181A5]"
                      }`}
                    >
                      {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemove(m.share_id)}
                      className="text-xs font-bold text-[#E54545] hover:text-[#c53030] transition-colors"
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

// ─── Tab: Invoice Data ────────────────────────────────────────────────────────

function InvoiceDataTab({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const supabase = createClient();
  const [companyName, setCompanyName] = useState(profile.company_name ?? "");
  const [companyAddress, setCompanyAddress] = useState(profile.company_address ?? "");
  const [taxId, setTaxId] = useState(profile.tax_id ?? "");
  const [bankDetails, setBankDetails] = useState(profile.bank_details ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("profiles")
        .update({
          company_name: companyName,
          company_address: companyAddress,
          tax_id: taxId,
          bank_details: bankDetails,
        })
        .eq("id", profile.id);
      if (err) throw err;
      onSaved({ ...profile, company_name: companyName, company_address: companyAddress, tax_id: taxId, bank_details: bankDetails });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-base font-bold text-[#1C1D21]">Invoice Data</h2>
      <p className="text-sm text-[#8181A5]">
        This information will appear on invoices you send to clients.
      </p>
      <Field label="Company Name">
        <input
          className={inputClass}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Corp"
        />
      </Field>
      <Field label="Company Address">
        <textarea
          className="w-full px-3 py-2.5 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4] resize-none"
          rows={3}
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          placeholder="123 Main St, City, Country"
        />
      </Field>
      <Field label="Tax ID / VAT Number">
        <input
          className={inputClass}
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          placeholder="GB123456789"
        />
      </Field>
      <Field label="Bank Details">
        <textarea
          className="w-full px-3 py-2.5 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4] resize-none"
          rows={3}
          value={bankDetails}
          onChange={(e) => setBankDetails(e.target.value)}
          placeholder="IBAN: GB00 BARC 1234 5678 9012 34&#10;BIC: BARCGB22"
        />
      </Field>
      {error && <Banner type="error" message={error} />}
      <div className="pt-1">
        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
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
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Warning box */}
      <div className="rounded-xl border-2 border-[#E54545]/30 bg-[#E54545]/5 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#E54545] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 2v3M5 7.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#E54545]">This action is permanent and cannot be undone.</p>
            <p className="text-sm text-[#1C1D21] mt-1">
              Deleting your account will permanently remove all of your data, including:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[#1C1D21]">
              <li className="flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#E54545] before:shrink-0">
                All projects and financial models
              </li>
              <li className="flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#E54545] before:shrink-0">
                All scenarios and saved configurations
              </li>
              <li className="flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#E54545] before:shrink-0">
                All invoices and invoice data
              </li>
              <li className="flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#E54545] before:shrink-0">
                Your profile and account settings
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="space-y-4">
        <Field label={`Type DELETE to confirm`}>
          <input
            className={`${inputClass} ${canDelete ? "border-[#E54545] focus:border-[#E54545] focus:ring-[#E54545]" : ""}`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            spellCheck={false}
            autoComplete="off"
          />
        </Field>
        {error && <Banner type="error" message={error} />}
        <button
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className="h-9 px-5 text-sm font-bold rounded-lg bg-[#E54545] hover:bg-[#c53030] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {deleting ? "Deleting account..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
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
          <div className="text-sm text-[#8181A5]">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell title="Settings">
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-sm text-[#E54545]">Unable to load profile.</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings">
      <div className="p-6 max-w-4xl">
        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white border border-[#ECECF2] rounded-xl p-1 mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`h-8 px-4 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? tab.key === "delete"
                    ? "bg-[#E54545] text-white"
                    : "bg-[#5E81F4] text-white"
                  : tab.key === "delete"
                  ? "text-[#E54545] hover:bg-[#E54545]/10"
                  : "text-[#8181A5] hover:text-[#1C1D21]"
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
        {activeTab === "team" && (
          <TeamTab profile={profile} />
        )}
        {activeTab === "invoice" && (
          <InvoiceDataTab profile={profile} onSaved={setProfile} />
        )}
        {activeTab === "delete" && (
          <DeleteAccountTab profile={profile} />
        )}
      </div>
    </AppShell>
  );
}

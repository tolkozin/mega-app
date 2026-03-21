"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan, formatLimit } from "@/lib/plan-limits";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { createClient } from "@/lib/supabase/client";

interface Payment {
  id: string;
  date: string;
  description: string;
  amount_formatted: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "void" | "refunded";
  status_formatted: string;
  invoice_url: string | null;
  card_brand: string | null;
  card_last_four: string | null;
  billing_reason: string;
  refunded: boolean;
  subscription_id: number;
}

const statusColors: Record<
  string,
  { bg: string; text: string }
> = {
  paid: { bg: "bg-[#E6F9F1]", text: "text-[#14A660]" },
  pending: { bg: "bg-[#FFF8E6]", text: "text-[#F59E0B]" },
  void: { bg: "bg-[#F3F4F6]", text: "text-[#8181A5]" },
  refunded: { bg: "bg-[#FFEDED]", text: "text-[#E54545]" },
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const s = statusColors[status] ?? statusColors.void;
  return (
    <span
      className={`text-xs font-bold px-2.5 py-1 rounded-md ${s.bg} ${s.text}`}
    >
      {label}
    </span>
  );
}

function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const isUnlimited = limit === Infinity;
  const pct = isUnlimited ? 0 : limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isNearLimit = !isUnlimited && limit > 0 && pct >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#1C1D21] font-medium">{label}</span>
        <span className="text-[#8181A5]">
          {current} / {isUnlimited ? "Unlimited" : formatLimit(limit)}
        </span>
      </div>
      <div className="h-2 bg-[#ECECF2] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? "bg-[#F59E0B]" : "bg-[#2163E7]"}`}
          style={{ width: isUnlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BillingClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { profile, limits } = useProfile();
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    async function fetchProjectCount() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setProjectCount(count ?? 0);
    }
    fetchProjectCount();
  }, []);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/lemonsqueezy/payments");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        setPayments(data.payments);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load payments");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <AppShell title="Billing">
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1C1D21]">Billing</h1>
          <p className="text-sm text-[#8181A5] mt-1">
            View your subscription payments and invoices.
          </p>
        </div>

        {/* Plan & Usage */}
        {profile && (
          <div className="bg-white rounded-xl border border-[#ECECF2] p-5 mb-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-[#1C1D21]">Current Plan</h2>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    isActivePlan(profile.plan)
                      ? "bg-[#E6F9F1] text-[#14A660]"
                      : "bg-[#FFF8E6] text-[#F59E0B]"
                  }`}
                >
                  {isActivePlan(profile.plan) ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "No Active Plan"}
                </span>
              </div>
              {isActivePlan(profile.plan) ? (
                <a
                  href="/plans"
                  className="text-sm font-bold text-[#2163E7] hover:text-[#4B6FE0] transition-colors"
                >
                  Manage Subscription
                </a>
              ) : (
                <button
                  onClick={() => useUpgradeStore.getState().showExpiredModal()}
                  className="text-sm font-bold px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors"
                >
                  Subscribe Now
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UsageBar label="Projects" current={projectCount} limit={limits.maxProjects} />
              <UsageBar label="AI Messages / month" current={profile.ai_chat_count ?? 0} limit={limits.aiMessagesPerMonth} />
              <UsageBar label="AI Reports / month" current={profile.ai_report_count ?? 0} limit={limits.aiReportsPerMonth} />
              <UsageBar label="Team Shares" current={0} limit={limits.maxShares} />
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-[#ECECF2]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#ECECF2] border-t-[#2163E7] rounded-full animate-spin" />
              <p className="text-sm text-[#8181A5] mt-3">
                Loading payment history...
              </p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-sm text-[#E54545]">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto mb-3 text-[#ECECF2]"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <p className="text-sm font-bold text-[#1C1D21]">
                No payments yet
              </p>
              <p className="text-sm text-[#8181A5] mt-1">
                Your subscription payment history will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-[#8181A5] font-bold uppercase tracking-wider border-b border-[#ECECF2]">
                      <th className="text-left px-5 py-3">Date</th>
                      <th className="text-left px-5 py-3">Description</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-right px-5 py-3">Amount</th>
                      <th className="text-right px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-[#ECECF2] hover:bg-[#F8F8FC] transition-colors"
                      >
                        <td className="px-5 py-3 text-sm text-[#1C1D21] whitespace-nowrap">
                          {formatDate(p.date)}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#1C1D21]">
                          {p.description}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge
                            status={p.status}
                            label={p.status_formatted}
                          />
                        </td>
                        <td className="px-5 py-3 text-sm font-bold text-[#1C1D21] text-right whitespace-nowrap">
                          {p.amount_formatted}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <a
                            href="https://revenuemap.lemonsqueezy.com/billing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-[#2163E7] hover:text-[#4B6FE0] transition-colors"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-[#ECECF2]">
                {payments.map((p) => (
                  <div key={p.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1C1D21]">
                        {p.amount_formatted}
                      </span>
                      <StatusBadge
                        status={p.status}
                        label={p.status_formatted}
                      />
                    </div>
                    <p className="text-sm text-[#8181A5]">
                      {formatDate(p.date)} &middot; {p.description}
                    </p>
                    <a
                      href="https://revenuemap.lemonsqueezy.com/billing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#2163E7] hover:text-[#4B6FE0] transition-colors"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

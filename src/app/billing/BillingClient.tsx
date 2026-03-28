"use client";

import { useState, useEffect } from "react";
import { V2Shell as AppShell } from "@/components/v2/layout/V2Shell";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan, formatLimit } from "@/lib/plan-limits";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Download,
  CreditCard,
  ArrowUpRight,
  BarChart3,
  Zap,
  Shield,
  Users,
  ChevronDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)",
};

const divider: React.CSSProperties = {
  borderTop: "1px solid #f0f1f7",
};

const font: React.CSSProperties = {
  fontFamily: "Lato, sans-serif",
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    paid: { bg: "#E6F9F1", color: "#14A660" },
    pending: { bg: "#FFF8E6", color: "#F59E0B" },
    void: { bg: "#F3F4F6", color: "#8181A5" },
    refunded: { bg: "#FFEDED", color: "#E54545" },
  };
  const s = colors[status] ?? colors.void;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 6,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function UsageBar({
  label,
  current,
  limit,
  icon,
}: {
  label: string;
  current: number;
  limit: number;
  icon: React.ReactNode;
}) {
  const isUnlimited = limit === Infinity;
  const pct = isUnlimited
    ? 0
    : limit > 0
      ? Math.min((current / limit) * 100, 100)
      : 0;
  const isOver80 = !isUnlimited && limit > 0 && pct >= 80;
  const remaining = isUnlimited ? null : Math.max(limit - current, 0);

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#6b7280" }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>
          {current} / {isUnlimited ? "Unlimited" : formatLimit(limit)}
        </span>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 8,
          background: "#f0f1f7",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isUnlimited ? "0%" : `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 8,
            background: isOver80
              ? "linear-gradient(90deg, #ef4444, #f87171)"
              : "linear-gradient(90deg, #2163E7, #60a5fa)",
          }}
        />
      </div>

      {remaining !== null && (
        <div
          style={{
            fontSize: 11,
            color: isOver80 ? "#ef4444" : "#9ca3af",
            marginTop: 4,
          }}
        >
          {remaining} {label.toLowerCase()} remaining
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Plan comparison data                                               */
/* ------------------------------------------------------------------ */

const planFeatures = [
  { label: "Projects", plus: "3", pro: "Unlimited", enterprise: "Unlimited" },
  {
    label: "Scenarios per project",
    plus: "3",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    label: "AI messages / month",
    plus: "30",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    label: "AI reports / month",
    plus: "3",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    label: "Team shares",
    plus: "3",
    pro: "10",
    enterprise: "Unlimited",
  },
  {
    label: "Priority support",
    plus: false,
    pro: true,
    enterprise: true,
  },
];

const planCards = [
  { name: "Plus", price: "$29", period: "/month", key: "plus" },
  { name: "Pro", price: "$49", period: "/month", key: "pro" },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    key: "enterprise",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Current plan feature list                                          */
/* ------------------------------------------------------------------ */

function getPlanDisplayFeatures(plan: string) {
  if (plan === "enterprise") {
    return [
      "Unlimited projects",
      "Unlimited scenarios",
      "Unlimited AI messages",
      "Unlimited AI reports",
      "Unlimited team shares",
      "Priority support",
    ];
  }
  if (plan === "pro") {
    return [
      "Unlimited projects",
      "Unlimited scenarios",
      "Unlimited AI messages",
      "Unlimited AI reports",
      "10 team shares",
      "Priority support",
    ];
  }
  // plus
  return [
    "3 projects",
    "3 scenarios per project",
    "30 AI messages / month",
    "3 AI reports / month",
    "3 team shares",
    "Email support",
  ];
}

function getPlanPrice(plan: string) {
  if (plan === "pro") return { amount: "$49", period: "/month" };
  if (plan === "enterprise") return { amount: "Custom", period: "" };
  return { amount: "$29", period: "/month" };
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function BillingClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { profile, limits } = useProfile();
  const [projectCount, setProjectCount] = useState(0);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    async function fetchProjectCount() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  const activePlan = profile ? isActivePlan(profile.plan) : false;
  const planName = profile?.plan
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
    : "None";
  const price = getPlanPrice(profile?.plan ?? "plus");
  const features = getPlanDisplayFeatures(profile?.plan ?? "plus");

  // Derive card info from most recent payment
  const latestPayment = payments.length > 0 ? payments[0] : null;
  const cardBrand = latestPayment?.card_brand ?? null;
  const cardLast4 = latestPayment?.card_last_four ?? null;

  return (
    <AppShell title="Billing">
      <div
        style={{
          ...font,
          maxWidth: 820,
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#1a1a2e",
              margin: 0,
            }}
          >
            Billing
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#9ca3af",
              marginTop: 4,
            }}
          >
            Manage your subscription, usage, and payment details.
          </p>
        </div>

        {/* ============ CURRENT PLAN CARD ============ */}
        {profile && (
          <Section title="Current Plan" subtitle="Your active subscription">
            <div
              style={{
                ...card,
                borderLeft: "4px solid #2163E7",
                padding: 28,
              }}
            >
              {/* Plan name + badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}
                >
                  {planName} Plan
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: activePlan ? "#E6F9F1" : "#FFF8E6",
                    color: activePlan ? "#14A660" : "#F59E0B",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {activePlan ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Price + renewal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                  marginBottom: 24,
                }}
              >
                <span
                  style={{ fontSize: 36, fontWeight: 800, color: "#1a1a2e" }}
                >
                  {price.amount}
                </span>
                {price.period && (
                  <span
                    style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}
                  >
                    {price.period}
                  </span>
                )}
              </div>

              {/* Features 2-col grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "10px 24px",
                  marginBottom: 24,
                }}
              >
                {features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Check size={15} color="#14A660" strokeWidth={3} />
                    <span style={{ fontSize: 13, color: "#1a1a2e" }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ ...divider, marginBottom: 20 }} />

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {activePlan ? (
                  <>
                    <a
                      href="https://revenuemap.lemonsqueezy.com/billing"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#fff",
                        background: "#2163E7",
                        padding: "10px 20px",
                        borderRadius: 10,
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(33,99,231,0.3)",
                        transition: "opacity 0.15s",
                      }}
                    >
                      Manage Plan
                      <ArrowUpRight size={14} />
                    </a>
                    <a
                      href="https://revenuemap.lemonsqueezy.com/billing"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#6b7280",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                    >
                      Cancel subscription
                    </a>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      useUpgradeStore.getState().showExpiredModal()
                    }
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      background: "#F59E0B",
                      padding: "10px 20px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Subscribe Now
                  </button>
                )}
              </div>

              {/* Plan comparison toggle */}
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={() => setShowPlans((v) => !v)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2163E7",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Compare plans
                  <motion.span
                    animate={{ rotate: showPlans ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showPlans && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: 16,
                          marginTop: 16,
                        }}
                      >
                        {planCards.map((p) => {
                          const isCurrent =
                            profile.plan === p.key && activePlan;
                          return (
                            <div
                              key={p.key}
                              style={{
                                border: isCurrent
                                  ? "2px solid #2163E7"
                                  : "1px solid #f0f1f7",
                                borderRadius: 12,
                                padding: 20,
                                background: isCurrent ? "#EBF1FD" : "#fff",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: "#1a1a2e",
                                  marginBottom: 4,
                                }}
                              >
                                {p.name}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "baseline",
                                  gap: 2,
                                  marginBottom: 12,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 24,
                                    fontWeight: 800,
                                    color: "#1a1a2e",
                                  }}
                                >
                                  {p.price}
                                </span>
                                {p.period && (
                                  <span
                                    style={{
                                      fontSize: 12,
                                      color: "#6b7280",
                                    }}
                                  >
                                    {p.period}
                                  </span>
                                )}
                              </div>
                              {planFeatures.map((f) => {
                                const val =
                                  f[p.key as keyof typeof f] as
                                    | string
                                    | boolean;
                                return (
                                  <div
                                    key={f.label}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      fontSize: 12,
                                      color: "#1a1a2e",
                                      marginBottom: 6,
                                    }}
                                  >
                                    {typeof val === "boolean" ? (
                                      val ? (
                                        <Check
                                          size={13}
                                          color="#14A660"
                                          strokeWidth={3}
                                        />
                                      ) : (
                                        <span
                                          style={{
                                            width: 13,
                                            height: 13,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#c4c9d8",
                                            fontSize: 12,
                                          }}
                                        >
                                          &mdash;
                                        </span>
                                      )
                                    ) : (
                                      <Check
                                        size={13}
                                        color="#14A660"
                                        strokeWidth={3}
                                      />
                                    )}
                                    <span>
                                      {typeof val === "boolean"
                                        ? f.label
                                        : `${val} ${f.label.toLowerCase()}`}
                                    </span>
                                  </div>
                                );
                              })}
                              {isCurrent && (
                                <div
                                  style={{
                                    marginTop: 12,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#2163E7",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  Current plan
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Section>
        )}

        {/* ============ USAGE SECTION ============ */}
        {profile && (
          <Section title="Usage" subtitle="Current billing period">
            <div style={{ ...card, padding: 28 }}>
              <UsageBar
                label="Projects"
                current={projectCount}
                limit={limits.maxProjects}
                icon={<BarChart3 size={16} />}
              />
              <UsageBar
                label="AI Messages / month"
                current={profile.ai_chat_count ?? 0}
                limit={limits.aiMessagesPerMonth}
                icon={<Zap size={16} />}
              />
              <UsageBar
                label="AI Reports / month"
                current={profile.ai_report_count ?? 0}
                limit={limits.aiReportsPerMonth}
                icon={<Shield size={16} />}
              />
              <UsageBar
                label="Team Shares"
                current={0}
                limit={limits.maxShares}
                icon={<Users size={16} />}
              />
            </div>
          </Section>
        )}

        {/* ============ PAYMENT METHOD CARD ============ */}
        {cardLast4 && (
          <Section title="Payment Method" subtitle="Your card on file">
            <div style={{ ...card, padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {/* Card icon */}
                <div
                  style={{
                    width: 56,
                    height: 36,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #1a1a2e, #2c2c4e)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CreditCard size={20} color="#fff" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1a1a2e",
                    }}
                  >
                    {cardBrand
                      ? cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)
                      : "Card"}{" "}
                    ending in {cardLast4}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;
                    &bull;&bull;&bull;&bull; {cardLast4}
                  </div>
                </div>

                <a
                  href="https://revenuemap.lemonsqueezy.com/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#2163E7",
                    textDecoration: "none",
                  }}
                >
                  Update
                </a>
              </div>
            </div>
          </Section>
        )}

        {/* ============ INVOICE HISTORY ============ */}
        <Section title="Invoice History" subtitle="Past transactions">
          <div style={{ ...card, overflow: "hidden" }}>
            {loading ? (
              <div
                style={{
                  padding: 48,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: 24,
                    height: 24,
                    border: "2px solid #f0f1f7",
                    borderTopColor: "#2163E7",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 12 }}>
                  Loading payment history...
                </p>
              </div>
            ) : error ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#E54545" }}>{error}</p>
              </div>
            ) : payments.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <CreditCard
                  size={48}
                  color="#f0f1f7"
                  style={{ margin: "0 auto 12px" }}
                />
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    margin: 0,
                  }}
                >
                  No payments yet
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    marginTop: 4,
                  }}
                >
                  Your subscription payment history will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop grid header */}
                <div className="hidden sm:grid" style={{
                  gridTemplateColumns: "1fr 2fr 100px 100px 80px",
                  padding: "12px 24px",
                  borderBottom: "1px solid #f0f1f7",
                }}>
                  {["Date", "Description", "Status", "Amount", ""].map(
                    (h) => (
                      <div
                        key={h}
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#c4c9d8",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {h}
                      </div>
                    )
                  )}
                </div>

                {/* Desktop rows */}
                <div className="hidden sm:block">
                  {payments.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr 100px 100px 80px",
                        padding: "14px 24px",
                        alignItems: "center",
                        borderBottom:
                          i < payments.length - 1
                            ? "1px solid #f0f1f7"
                            : "none",
                        cursor: "default",
                        transition: "background 0.15s",
                      }}
                      className="hover:bg-[#fafbff]"
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: "#1a1a2e",
                          fontWeight: 500,
                        }}
                      >
                        {formatDate(p.date)}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#1a1a2e",
                        }}
                      >
                        {p.description}
                      </div>
                      <div>
                        <StatusBadge
                          status={p.status}
                          label={p.status_formatted}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1a1a2e",
                        }}
                      >
                        {p.amount_formatted}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <a
                          href="https://revenuemap.lemonsqueezy.com/billing"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "#EBF1FD",
                            color: "#2163E7",
                            textDecoration: "none",
                            transition: "background 0.15s",
                          }}
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden">
                  {payments.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        padding: "16px 20px",
                        borderBottom:
                          i < payments.length - 1
                            ? "1px solid #f0f1f7"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1a1a2e",
                          }}
                        >
                          {p.amount_formatted}
                        </span>
                        <StatusBadge
                          status={p.status}
                          label={p.status_formatted}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9ca3af",
                          marginBottom: 8,
                        }}
                      >
                        {formatDate(p.date)} &middot; {p.description}
                      </div>
                      <a
                        href="https://revenuemap.lemonsqueezy.com/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#2163E7",
                          textDecoration: "none",
                        }}
                      >
                        <Download size={13} />
                        View Invoice
                      </a>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

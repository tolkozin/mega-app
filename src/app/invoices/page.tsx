"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";

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

function CardIcon({ brand }: { brand: string | null }) {
  if (!brand) return null;
  const labels: Record<string, string> = {
    visa: "Visa",
    mastercard: "MC",
    amex: "Amex",
    discover: "Disc",
  };
  return (
    <span className="text-xs text-[#8181A5] font-medium">
      {labels[brand] ?? brand}
    </span>
  );
}

export default function InvoicesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <AppShell title="Payment History">
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1C1D21]">Payment History</h1>
          <p className="text-sm text-[#8181A5] mt-1">
            View your subscription payments and download invoices.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#ECECF2]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#ECECF2] border-t-[#5E81F4] rounded-full animate-spin" />
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
                      <th className="text-left px-5 py-3">Payment</th>
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
                          {p.card_brand && p.card_last_four ? (
                            <div className="flex items-center gap-1.5">
                              <CardIcon brand={p.card_brand} />
                              <span className="text-sm text-[#8181A5]">
                                ****{p.card_last_four}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#8181A5]">--</span>
                          )}
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
                          <div className="flex items-center justify-end gap-3">
                            <a
                              href={`/invoices/view?id=${p.id}`}
                              className="text-sm font-bold text-[#5E81F4] hover:text-[#4B6FE0] transition-colors"
                            >
                              View
                            </a>
                            {p.invoice_url && (
                              <a
                                href={p.invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5E81F4] hover:text-[#4B6FE0] transition-colors"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                PDF
                              </a>
                            )}
                          </div>
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
                    {p.card_brand && p.card_last_four && (
                      <p className="text-xs text-[#8181A5]">
                        {p.card_brand} ****{p.card_last_four}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <a
                        href={`/invoices/view?id=${p.id}`}
                        className="text-sm font-bold text-[#5E81F4] hover:text-[#4B6FE0] transition-colors"
                      >
                        View Invoice
                      </a>
                      {p.invoice_url && (
                        <a
                          href={p.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5E81F4] hover:text-[#4B6FE0] transition-colors"
                        >
                          Download PDF
                        </a>
                      )}
                    </div>
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

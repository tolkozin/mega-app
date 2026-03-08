"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useInvoices } from "@/hooks/useInvoices";
import type { InvoiceStatus } from "@/lib/types";

const statusColors: Record<InvoiceStatus, { bg: string; text: string; label: string }> = {
  paid: { bg: "bg-[#E6F9F1]", text: "text-[#14A660]", label: "Paid" },
  scheduled: { bg: "bg-[#E8EEFF]", text: "text-[#5E81F4]", label: "Scheduled" },
  unpaid: { bg: "bg-[#FFEDED]", text: "text-[#E54545]", label: "Unpaid" },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = statusColors[status];
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default function InvoicesPage() {
  const { invoices, loading, deleteInvoice } = useInvoices();
  const [filter, setFilter] = useState<InvoiceStatus | "all">("all");

  const filtered = filter === "all" ? invoices : invoices.filter((inv) => inv.status === filter);

  const totalAll = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const totalScheduled = invoices.filter((i) => i.status === "scheduled").reduce((s, i) => s + Number(i.total), 0);
  const totalUnpaid = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + Number(i.total), 0);

  const paidPct = totalAll > 0 ? (totalPaid / totalAll) * 100 : 0;
  const scheduledPct = totalAll > 0 ? (totalScheduled / totalAll) * 100 : 0;
  const unpaidPct = totalAll > 0 ? (totalUnpaid / totalAll) * 100 : 0;

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Delete invoice ${num}?`)) return;
    try {
      await deleteInvoice(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <AppShell title="Invoices">
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left sidebar with stats */}
        <div className="w-[280px] border-r border-[#ECECF2] bg-white p-5 shrink-0 overflow-y-auto">
          <div className="mb-6">
            <Link href="/invoices/new">
              <button className="w-full h-10 bg-[#5E81F4] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors">
                + New Invoice
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setFilter("all")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${filter === "all" ? "bg-[#F4F6FF]" : "hover:bg-[#F8F8FC]"}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-[#1C1D21]">All Invoices</span>
                <span className="text-sm font-bold text-[#1C1D21]">{fmt(totalAll)}</span>
              </div>
              <span className="text-xs text-[#8181A5]">{invoices.length} invoices</span>
            </button>

            <button
              onClick={() => setFilter("paid")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${filter === "paid" ? "bg-[#F4F6FF]" : "hover:bg-[#F8F8FC]"}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-[#14A660]">Paid</span>
                <span className="text-sm font-bold text-[#1C1D21]">{fmt(totalPaid)}</span>
              </div>
              <div className="w-full h-1.5 bg-[#ECECF2] rounded-full">
                <div className="h-full bg-[#14A660] rounded-full" style={{ width: `${paidPct}%` }} />
              </div>
            </button>

            <button
              onClick={() => setFilter("scheduled")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${filter === "scheduled" ? "bg-[#F4F6FF]" : "hover:bg-[#F8F8FC]"}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-[#5E81F4]">Scheduled</span>
                <span className="text-sm font-bold text-[#1C1D21]">{fmt(totalScheduled)}</span>
              </div>
              <div className="w-full h-1.5 bg-[#ECECF2] rounded-full">
                <div className="h-full bg-[#5E81F4] rounded-full" style={{ width: `${scheduledPct}%` }} />
              </div>
            </button>

            <button
              onClick={() => setFilter("unpaid")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${filter === "unpaid" ? "bg-[#F4F6FF]" : "hover:bg-[#F8F8FC]"}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-[#E54545]">Unpaid</span>
                <span className="text-sm font-bold text-[#1C1D21]">{fmt(totalUnpaid)}</span>
              </div>
              <div className="w-full h-1.5 bg-[#ECECF2] rounded-full">
                <div className="h-full bg-[#E54545] rounded-full" style={{ width: `${unpaidPct}%` }} />
              </div>
            </button>
          </div>
        </div>

        {/* Main content: invoices table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-[#ECECF2]">
            <div className="px-5 py-4 border-b border-[#ECECF2]">
              <h2 className="text-[15px] font-bold text-[#1C1D21]">
                {filter === "all" ? "All Invoices" : statusColors[filter].label} ({filtered.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-5 text-[#8181A5] text-sm">Loading invoices...</div>
            ) : filtered.length === 0 ? (
              <div className="p-5 text-[#8181A5] text-sm">
                No invoices yet.{" "}
                <Link href="/invoices/new" className="text-[#5E81F4] hover:underline">Create your first invoice</Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-[#8181A5] font-bold uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Number</th>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Customer</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Amount</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-t border-[#ECECF2] hover:bg-[#F8F8FC] transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/invoices/${inv.id}`} className="text-sm font-bold text-[#5E81F4] hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#1C1D21]">
                        {new Date(inv.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-[#1C1D21]">{inv.customer_name}</div>
                        <div className="text-xs text-[#8181A5]">{inv.customer_email}</div>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-[#1C1D21] text-right">
                        {fmt(Number(inv.total))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(inv.id, inv.invoice_number)}
                          className="text-xs text-[#8181A5] hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

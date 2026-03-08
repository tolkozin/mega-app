"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { useInvoices } from "@/hooks/useInvoices";
import type { Invoice, InvoiceStatus, InvoiceItem } from "@/lib/types";

const statusColors: Record<InvoiceStatus, { bg: string; text: string; label: string }> = {
  paid: { bg: "bg-[#E6F9F1]", text: "text-[#14A660]", label: "Paid" },
  scheduled: { bg: "bg-[#E8EEFF]", text: "text-[#5E81F4]", label: "Scheduled" },
  unpaid: { bg: "bg-[#FFEDED]", text: "text-[#E54545]", label: "Unpaid" },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const { updateInvoice } = useInvoices();

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
      if (data) setInvoice(data as Invoice);
    };
    fetch();
  }, [invoiceId]);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!invoice) return;
    try {
      await updateInvoice(invoice.id, { status: newStatus });
      setInvoice({ ...invoice, status: newStatus });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const fmt = (n: number) => Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });

  if (!invoice) {
    return (
      <AppShell title="Invoice">
        <div className="p-6 text-[#8181A5]">Loading...</div>
      </AppShell>
    );
  }

  const items = (invoice.items || []) as InvoiceItem[];
  const st = statusColors[invoice.status];

  return (
    <AppShell title={`Invoice ${invoice.invoice_number}`}>
      <div className="p-6 max-w-3xl overflow-y-auto h-[calc(100vh-3.5rem)]">
        <Link href="/invoices" className="text-sm text-[#8181A5] hover:text-[#5E81F4] transition-colors mb-4 inline-flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Back to Invoices
        </Link>

        <div className="bg-white rounded-xl border border-[#ECECF2] p-6 mt-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#1C1D21] mb-1">{invoice.invoice_number}</h2>
              <p className="text-sm text-[#8181A5]">
                Issued {new Date(invoice.issue_date).toLocaleDateString()} — Due {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${st.bg} ${st.text}`}>
              {st.label}
            </span>
          </div>

          {/* Customer */}
          <div className="mb-6 p-4 bg-[#F8F8FC] rounded-lg">
            <p className="text-xs font-bold text-[#8181A5] uppercase tracking-wider mb-2">Customer</p>
            <p className="text-sm font-bold text-[#1C1D21]">{invoice.customer_name}</p>
            <p className="text-sm text-[#8181A5]">{invoice.customer_email}</p>
          </div>

          {/* Line items table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="text-xs text-[#8181A5] font-bold uppercase tracking-wider border-b border-[#ECECF2]">
                <th className="text-left pb-2">Description</th>
                <th className="text-center pb-2 w-20">Qty</th>
                <th className="text-right pb-2 w-28">Price</th>
                <th className="text-right pb-2 w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-[#ECECF2]">
                  <td className="py-3 text-sm text-[#1C1D21]">{item.description}</td>
                  <td className="py-3 text-sm text-[#1C1D21] text-center">{item.quantity}</td>
                  <td className="py-3 text-sm text-[#1C1D21] text-right">{fmt(item.unit_price)}</td>
                  <td className="py-3 text-sm font-bold text-[#1C1D21] text-right">{fmt(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-[#8181A5]">Subtotal</span>
              <span className="text-[#1C1D21] font-bold">{fmt(Number(invoice.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8181A5]">Tax ({Number(invoice.tax_rate)}%)</span>
              <span className="text-[#1C1D21] font-bold">{fmt(Number(invoice.tax_amount))}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-[#ECECF2]">
              <span className="font-bold text-[#1C1D21]">Total</span>
              <span className="font-bold text-[#1C1D21] text-lg">{fmt(Number(invoice.total))}</span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6 p-4 bg-[#F8F8FC] rounded-lg">
              <p className="text-xs font-bold text-[#8181A5] uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-[#1C1D21]">{invoice.notes}</p>
            </div>
          )}

          {/* Status actions */}
          <div className="flex gap-2 pt-4 border-t border-[#ECECF2]">
            {invoice.status !== "paid" && (
              <button
                onClick={() => handleStatusChange("paid")}
                className="h-9 px-4 bg-[#14A660] text-white text-sm font-bold rounded-lg hover:bg-[#0E8F4F] transition-colors"
              >
                Mark as Paid
              </button>
            )}
            {invoice.status !== "scheduled" && (
              <button
                onClick={() => handleStatusChange("scheduled")}
                className="h-9 px-4 bg-[#5E81F4] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors"
              >
                Mark as Scheduled
              </button>
            )}
            {invoice.status !== "unpaid" && (
              <button
                onClick={() => handleStatusChange("unpaid")}
                className="h-9 px-4 border border-[#ECECF2] text-[#1C1D21] text-sm font-bold rounded-lg hover:bg-[#F8F8FC] transition-colors"
              >
                Mark as Unpaid
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

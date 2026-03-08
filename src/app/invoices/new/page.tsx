"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useInvoices } from "@/hooks/useInvoices";
import type { InvoiceItem, InvoiceStatus } from "@/lib/types";

export default function NewInvoicePage() {
  const router = useRouter();
  const { createInvoice } = useInvoices();
  const [saving, setSaving] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("unpaid");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const inputCls = "w-full h-10 px-3 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4]";

  const handleSave = async () => {
    if (!invoiceNumber.trim() || !customerName.trim()) return;
    setSaving(true);
    try {
      await createInvoice({
        invoice_number: invoiceNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        status,
        issue_date: issueDate,
        due_date: dueDate,
        items,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        notes,
      });
      router.push("/invoices");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="New Invoice">
      <div className="p-6 max-w-3xl overflow-y-auto h-[calc(100vh-3.5rem)]">
        <Link href="/invoices" className="text-sm text-[#8181A5] hover:text-[#5E81F4] transition-colors mb-4 inline-flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Back to Invoices
        </Link>

        <div className="bg-white rounded-xl border border-[#ECECF2] p-6 mt-4 space-y-6">
          {/* Invoice details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1C1D21] mb-2">Invoice Number</label>
              <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-001" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1C1D21] mb-2">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)} className={inputCls}>
                <option value="unpaid">Unpaid</option>
                <option value="scheduled">Scheduled</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1C1D21] mb-2">Customer Name</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Doe" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1C1D21] mb-2">Customer Email</label>
              <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="john@example.com" type="email" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1C1D21] mb-2">Issue Date</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1C1D21] mb-2">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <label className="block text-sm font-bold text-[#1C1D21] mb-3">Line Items</label>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    placeholder="Description"
                    className={`${inputCls} flex-1`}
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                    min={1}
                    className={`${inputCls} w-20 text-center`}
                  />
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                    min={0}
                    step={0.01}
                    placeholder="Price"
                    className={`${inputCls} w-28 text-right`}
                  />
                  <span className="h-10 flex items-center text-sm font-bold text-[#1C1D21] w-24 text-right justify-end">
                    {fmt(item.quantity * item.unit_price)}
                  </span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="h-10 flex items-center text-[#8181A5] hover:text-red-500 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 8h8" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-3 text-sm text-[#5E81F4] hover:underline font-bold">
              + Add Line Item
            </button>
          </div>

          {/* Tax */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-[#1C1D21]">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              min={0}
              max={100}
              step={0.1}
              className={`${inputCls} w-24 text-center`}
            />
          </div>

          {/* Totals */}
          <div className="border-t border-[#ECECF2] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#8181A5]">Subtotal</span>
              <span className="text-[#1C1D21] font-bold">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8181A5]">Tax ({taxRate}%)</span>
              <span className="text-[#1C1D21] font-bold">{fmt(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-[#ECECF2]">
              <span className="font-bold text-[#1C1D21]">Total</span>
              <span className="font-bold text-[#1C1D21]">{fmt(total)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-[#1C1D21] mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#ECECF2] bg-white text-sm text-[#1C1D21] placeholder:text-[#8181A5] focus:outline-none focus:border-[#5E81F4] focus:ring-1 focus:ring-[#5E81F4] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !invoiceNumber.trim() || !customerName.trim()}
              className="h-10 px-6 bg-[#5E81F4] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Invoice"}
            </button>
            <Link href="/invoices">
              <button className="h-10 px-6 border border-[#ECECF2] text-[#1C1D21] text-sm font-bold rounded-lg hover:bg-[#F8F8FC] transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

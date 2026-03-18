"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface InvoiceData {
  id: string;
  date: string;
  amount_formatted: string;
  amount_cents: number;
  currency: string;
  status: string;
  status_formatted: string;
  billing_reason: string;
  card_brand: string | null;
  card_last_four: string | null;
  subtotal_formatted: string;
  tax_formatted: string;
  discount_total_formatted: string;
  total_formatted: string;
  user_name: string;
  user_email: string;
}

interface ProfileData {
  company_name: string;
  company_address: string;
  tax_id: string;
  email: string;
  display_name: string;
}

function InvoiceViewContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!invoiceId) {
      setError("No invoice ID provided");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(
          `/api/lemonsqueezy/payments/invoice?id=${encodeURIComponent(invoiceId!)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load invoice");
        setInvoice(data.invoice);
        setProfile(data.profile);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load invoice details"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-[#8181A5]">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm text-[#E54545]">{error || "Invoice not found"}</p>
          <a
            href="/invoices"
            className="text-sm text-[#5E81F4] hover:underline mt-2 inline-block"
          >
            Back to Payment History
          </a>
        </div>
      </div>
    );
  }

  const invoiceDate = new Date(invoice.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const invoiceNumber = `RM-${invoice.id.toString().padStart(6, "0")}`;

  return (
    <div className="min-h-screen bg-[#F8F8FC] print:bg-white">
      {/* Print button - hidden in print */}
      <div className="print:hidden sticky top-0 bg-white border-b border-[#ECECF2] z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <a
            href="/invoices"
            className="text-sm font-bold text-[#5E81F4] hover:text-[#4B6FE0] transition-colors"
          >
            &larr; Back to Payment History
          </a>
          <button
            onClick={() => window.print()}
            className="h-9 px-5 text-sm font-bold rounded-lg bg-[#5E81F4] hover:bg-[#4B6FE0] text-white transition-colors flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Invoice content */}
      <div className="max-w-3xl mx-auto px-6 py-8 print:py-0 print:px-0">
        <div className="bg-white rounded-xl border border-[#ECECF2] print:border-0 print:shadow-none p-8 print:p-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1
                className="text-2xl font-black text-[#1C1D21]"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                Revenue Map
              </h1>
              <p className="text-sm text-[#8181A5] mt-1">
                revenuemap.app
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-[#1C1D21]">INVOICE</h2>
              <p className="text-sm text-[#8181A5] mt-1">{invoiceNumber}</p>
              <p className="text-sm text-[#8181A5]">{invoiceDate}</p>
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-bold text-[#8181A5] uppercase tracking-wider mb-2">
                From
              </p>
              <p className="text-sm font-bold text-[#1C1D21]">Revenue Map</p>
              <p className="text-sm text-[#8181A5]">revenuemap.app</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#8181A5] uppercase tracking-wider mb-2">
                Bill To
              </p>
              <p className="text-sm font-bold text-[#1C1D21]">
                {profile?.company_name || invoice.user_name || "Customer"}
              </p>
              {profile?.company_address && (
                <p className="text-sm text-[#8181A5] whitespace-pre-line">
                  {profile.company_address}
                </p>
              )}
              <p className="text-sm text-[#8181A5]">
                {profile?.email || invoice.user_email}
              </p>
              {profile?.tax_id && (
                <p className="text-sm text-[#8181A5]">
                  Tax ID: {profile.tax_id}
                </p>
              )}
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-[#ECECF2] rounded-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F8FC]">
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8181A5] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-[#8181A5] uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#ECECF2]">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[#1C1D21]">
                      Revenue Map Subscription
                    </p>
                    <p className="text-xs text-[#8181A5] mt-0.5">
                      {invoice.billing_reason === "initial"
                        ? "Initial payment"
                        : "Subscription renewal"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#1C1D21] text-right">
                    {invoice.subtotal_formatted || invoice.amount_formatted}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              {invoice.discount_total_formatted &&
                invoice.discount_total_formatted !== "$0.00" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8181A5]">Discount</span>
                    <span className="text-[#1C1D21]">
                      -{invoice.discount_total_formatted}
                    </span>
                  </div>
                )}
              {invoice.tax_formatted && invoice.tax_formatted !== "$0.00" && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8181A5]">Tax</span>
                  <span className="text-[#1C1D21]">
                    {invoice.tax_formatted}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-[#ECECF2] pt-2">
                <span className="text-[#1C1D21]">Total</span>
                <span className="text-[#1C1D21]">
                  {invoice.total_formatted || invoice.amount_formatted}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-8 pt-6 border-t border-[#ECECF2]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#8181A5]">Payment status:</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  invoice.status === "paid"
                    ? "bg-[#E6F9F1] text-[#14A660]"
                    : invoice.status === "refunded"
                    ? "bg-[#FFEDED] text-[#E54545]"
                    : "bg-[#F3F4F6] text-[#8181A5]"
                }`}
              >
                {invoice.status_formatted}
              </span>
            </div>
            {invoice.card_brand && invoice.card_last_four && (
              <p className="text-sm text-[#8181A5] mt-1">
                Paid with {invoice.card_brand} ending in {invoice.card_last_four}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-[#ECECF2] text-center">
            <p className="text-xs text-[#8181A5]">
              Thank you for using Revenue Map. Questions? Contact us at
              support@revenuemap.app
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:p-12 {
            padding: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function InvoiceViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-sm text-[#8181A5]">Loading...</div>
        </div>
      }
    >
      <InvoiceViewContent />
    </Suspense>
  );
}

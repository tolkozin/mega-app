"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { Invoice, InvoiceItem } from "@/lib/types";

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setInvoices(data as Invoice[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const createInvoice = async (invoice: {
    invoice_number: string;
    customer_name: string;
    customer_email: string;
    status: "paid" | "scheduled" | "unpaid";
    issue_date: string;
    due_date: string;
    items: InvoiceItem[];
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    notes: string;
  }) => {
    if (!user) throw new Error("Not authenticated");
    const supabase = createClient();
    const { error } = await supabase.from("invoices").insert({
      ...invoice,
      user_id: user.id,
    });
    if (error) throw new Error(error.message);
    await fetchInvoices();
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const supabase = createClient();
    const { error } = await supabase.from("invoices").update(updates).eq("id", id);
    if (error) throw new Error(error.message);
    await fetchInvoices();
  };

  const deleteInvoice = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await fetchInvoices();
  };

  return { invoices, loading, createInvoice, updateInvoice, deleteInvoice };
}

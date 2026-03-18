import { createClient } from "@/lib/supabase/server";
import { configureLemonSqueezy } from "@/lib/lemonsqueezy";
import { getSubscriptionInvoice } from "@lemonsqueezy/lemonsqueezy.js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("id");

    if (!invoiceId) {
      return Response.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch profile for invoice data and subscription ID
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "lemon_squeezy_subscription_id, company_name, company_address, tax_id, email, display_name"
      )
      .eq("id", user.id)
      .single();

    if (!profile?.lemon_squeezy_subscription_id) {
      return Response.json({ error: "No active subscription" }, { status: 400 });
    }

    configureLemonSqueezy();

    const { data, error } = await getSubscriptionInvoice(invoiceId);

    if (error) {
      console.error("LS invoice error:", error);
      return Response.json(
        { error: "Failed to fetch invoice" },
        { status: 500 }
      );
    }

    const attrs = data?.data?.attributes;
    if (!attrs) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Verify the invoice belongs to the user's subscription
    if (
      String(attrs.subscription_id) !==
      String(profile.lemon_squeezy_subscription_id)
    ) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const invoice = {
      id: data.data.id,
      date: attrs.created_at,
      amount_formatted: attrs.total_formatted,
      amount_cents: attrs.total,
      currency: attrs.currency,
      status: attrs.status,
      status_formatted: attrs.status_formatted,
      billing_reason: attrs.billing_reason,
      card_brand: attrs.card_brand,
      card_last_four: attrs.card_last_four,
      subtotal_formatted: attrs.subtotal_formatted,
      tax_formatted: attrs.tax_formatted,
      discount_total_formatted: attrs.discount_total_formatted,
      total_formatted: attrs.total_formatted,
      user_name: attrs.user_name,
      user_email: attrs.user_email,
    };

    return Response.json({
      invoice,
      profile: {
        company_name: profile.company_name ?? "",
        company_address: profile.company_address ?? "",
        tax_id: profile.tax_id ?? "",
        email: profile.email,
        display_name: profile.display_name ?? "",
      },
    });
  } catch (error) {
    console.error("Invoice detail error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch invoice",
      },
      { status: 500 }
    );
  }
}

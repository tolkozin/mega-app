import { createClient } from "@/lib/supabase/server";
import { configureLemonSqueezy } from "@/lib/lemonsqueezy";
import { listSubscriptionInvoices } from "@lemonsqueezy/lemonsqueezy.js";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("lemon_squeezy_subscription_id")
      .eq("id", user.id)
      .single();

    if (!profile?.lemon_squeezy_subscription_id) {
      return Response.json({ payments: [] });
    }

    configureLemonSqueezy();

    const { data, error } = await listSubscriptionInvoices({
      filter: {
        subscriptionId: profile.lemon_squeezy_subscription_id,
      },
      page: { size: 50 },
    });

    if (error) {
      console.error("LS invoices error:", error);
      return Response.json(
        { error: "Failed to fetch payment history" },
        { status: 500 }
      );
    }

    const payments = (data?.data ?? []).map((inv) => {
      const attrs = inv.attributes;
      return {
        id: inv.id,
        date: attrs.created_at,
        description: `${attrs.billing_reason === "initial" ? "Initial payment" : "Subscription renewal"}`,
        amount_formatted: attrs.total_formatted,
        amount_cents: attrs.total,
        currency: attrs.currency,
        status: attrs.status,
        status_formatted: attrs.status_formatted,
        invoice_url: attrs.urls?.invoice_url ?? null,
        card_brand: attrs.card_brand,
        card_last_four: attrs.card_last_four,
        billing_reason: attrs.billing_reason,
        refunded: attrs.refunded,
        subscription_id: attrs.subscription_id,
      };
    });

    return Response.json({ payments });
  } catch (error) {
    console.error("Payments error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch payments",
      },
      { status: 500 }
    );
  }
}

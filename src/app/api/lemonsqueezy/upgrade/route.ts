import { createClient } from "@/lib/supabase/server";
import { changeSubscriptionPlan, getVariantIdForPlan } from "@/lib/lemonsqueezy";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, annual } = await request.json();

    if (!plan || typeof annual !== "boolean") {
      return Response.json({ error: "Missing plan or annual flag" }, { status: 400 });
    }

    // Get user's current subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("lemon_squeezy_subscription_id, plan")
      .eq("id", user.id)
      .single();

    if (!profile?.lemon_squeezy_subscription_id) {
      return Response.json({ error: "No active subscription found" }, { status: 400 });
    }

    if (profile.plan === plan) {
      return Response.json({ error: "Already on this plan" }, { status: 400 });
    }

    // Resolve variant ID for the target plan
    const variantId = getVariantIdForPlan(plan, annual);
    if (!variantId) {
      return Response.json({ error: "Invalid plan or variant not configured" }, { status: 400 });
    }

    // Call LS API to change the subscription variant (prorated automatically)
    await changeSubscriptionPlan(
      profile.lemon_squeezy_subscription_id,
      Number(variantId)
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Upgrade error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to upgrade plan" },
      { status: 500 }
    );
  }
}

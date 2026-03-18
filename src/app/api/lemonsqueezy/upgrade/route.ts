import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { changeSubscriptionPlan, getVariantIdForPlan } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, annual } = await req.json();
    if (!plan || typeof annual !== "boolean") {
      return NextResponse.json({ error: "Missing plan or annual" }, { status: 400 });
    }

    // Get current subscription ID from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("lemon_squeezy_subscription_id, plan")
      .eq("id", user.id)
      .single();

    if (!profile?.lemon_squeezy_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found. Please subscribe first." },
        { status: 400 }
      );
    }

    // Get the target variant ID
    const variantId = getVariantIdForPlan(plan, annual);
    if (!variantId) {
      return NextResponse.json({ error: "Invalid plan or variant not configured" }, { status: 400 });
    }

    // Call Lemon Squeezy updateSubscription API
    await changeSubscriptionPlan(profile.lemon_squeezy_subscription_id, variantId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[upgrade] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upgrade failed" },
      { status: 500 }
    );
  }
}

import { createClient } from "@/lib/supabase/server";
import { getCustomerPortalUrl } from "@/lib/lemonsqueezy";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("lemon_squeezy_subscription_id")
      .eq("id", user.id)
      .single();

    if (!profile?.lemon_squeezy_subscription_id) {
      return Response.json({ error: "No active subscription" }, { status: 400 });
    }

    const url = await getCustomerPortalUrl(profile.lemon_squeezy_subscription_id);

    if (!url) {
      return Response.json({ error: "Failed to get portal URL" }, { status: 500 });
    }

    return Response.json({ url });
  } catch (error) {
    console.error("Portal error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to get portal" },
      { status: 500 }
    );
  }
}

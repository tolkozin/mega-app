import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Check if user has an active subscription (existing paying user)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("lemon_squeezy_subscription_id, plan")
        .eq("id", user.id)
        .single();

      // Existing user with subscription → dashboard
      if (profile?.lemon_squeezy_subscription_id) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // New user or no subscription → survey
    return NextResponse.redirect(new URL("/onboarding/survey", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Check if user already has projects (existing user)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Existing user with projects → dashboard
      if (count && count > 0) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // New user → survey (plan comes from localStorage client-side)
    return NextResponse.redirect(new URL("/onboarding/survey", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}

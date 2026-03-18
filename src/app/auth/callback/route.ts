import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to /plans if there was a pending plan selection,
  // otherwise go to dashboard. The pending_plan check happens client-side
  // via the PendingPlanRedirect component in the dashboard layout.
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

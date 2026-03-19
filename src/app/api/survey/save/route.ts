import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers, plan } = await req.json();
    if (!answers?.projectType || !plan) {
      return NextResponse.json({ error: "Invalid survey data" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("survey_responses")
      .insert({
        user_id: user.id,
        plan,
        status: "pending",
        answers,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (e) {
    console.error("[survey/save] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save survey" },
      { status: 500 }
    );
  }
}

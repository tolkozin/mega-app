import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const surveyId = req.nextUrl.searchParams.get("id");
    if (!surveyId) {
      return NextResponse.json({ error: "Missing survey id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("survey_responses")
      .select("status, project_id, answers")
      .eq("id", surveyId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: data.status,
      projectId: data.project_id,
      productType: data.answers?.projectType ?? null,
    });
  } catch (e) {
    console.error("[survey/status] error:", e);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}

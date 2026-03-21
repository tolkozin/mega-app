import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isActivePlan } from "@/lib/plan-limits";

/**
 * Fallback route: if the webhook didn't fire (e.g. test env),
 * the processing page calls this to create the project from survey data
 * once the user already has an active subscription.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { surveyId } = await req.json();
    if (!surveyId) {
      return NextResponse.json({ error: "Missing surveyId" }, { status: 400 });
    }

    // Check if survey is already completed
    const { data: survey, error: surveyErr } = await supabase
      .from("survey_responses")
      .select("status, project_id, answers, user_id")
      .eq("id", surveyId)
      .eq("user_id", user.id)
      .single();

    if (surveyErr || !survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (survey.status === "completed" && survey.project_id) {
      const productType = (survey.answers as Record<string, unknown>)?.projectType ?? "subscription";
      return NextResponse.json({
        status: "completed",
        projectId: survey.project_id,
        productType,
      });
    }

    // Check if user has an active subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile || !isActivePlan(profile.plan)) {
      // No active plan yet — webhook hasn't processed
      return NextResponse.json({ status: "pending" });
    }

    // User has active plan but survey isn't completed — create project now
    const answers = survey.answers as Record<string, unknown>;
    const productType = (answers.projectType as string) ?? "subscription";
    const validTypes = ["subscription", "ecommerce", "saas"];
    const type = validTypes.includes(productType) ? productType : "subscription";

    const industry = (answers.industry as string) ?? "";
    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const name =
      industry && industry !== "Other"
        ? `${industry} — ${monthName}`
        : `My Project — ${monthName}`;

    const { data: project, error: projErr } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description: "Created from your survey answers",
        product_type: type,
      })
      .select("id")
      .single();

    if (projErr || !project) {
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    // Mark survey as completed
    await supabase
      .from("survey_responses")
      .update({ status: "completed", project_id: project.id })
      .eq("id", surveyId);

    return NextResponse.json({
      status: "completed",
      projectId: project.id,
      productType: type,
    });
  } catch (e) {
    console.error("[survey/complete] error:", e);
    return NextResponse.json(
      { error: "Failed to complete survey" },
      { status: 500 }
    );
  }
}

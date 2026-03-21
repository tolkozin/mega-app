import { createClient } from "@/lib/supabase/server";
import { checkAndIncrement } from "@/lib/ai-limits";
import { buildReportSystemPrompt } from "@/lib/ai-prompts";
import { rateLimit } from "@/lib/rate-limit";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rate limit: 5 reports per minute per user
    const rl = rateLimit(`ai-report:${user.id}`, 5, 60_000);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const { modelType, dashboardContext } = await request.json();

    if (!modelType || !dashboardContext) {
      return new Response(JSON.stringify({ error: "Missing modelType or dashboardContext" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const usage = await checkAndIncrement(user.id, "report");
    if (!usage.allowed) {
      return new Response(
        JSON.stringify({
          error: "Monthly report limit reached",
          detail: `${usage.limit} AI reports per month`,
          plan: usage.plan,
          usage: { current: usage.current, limit: usage.limit, remaining: 0 },
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30_000 });
    const systemPrompt = buildReportSystemPrompt(modelType, dashboardContext);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the financial report based on the current dashboard data." },
      ],
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const reportText = completion.choices[0]?.message?.content || "{}";
    let report;
    try {
      report = JSON.parse(reportText);
    } catch {
      report = { title: "Report", sections: [{ heading: "Report", content: reportText }] };
    }

    return new Response(
      JSON.stringify({
        report,
        usage: { current: usage.current, limit: usage.limit, remaining: usage.remaining },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("AI report error:", errMsg, error);
    return new Response(JSON.stringify({ error: "Report generation failed", detail: errMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

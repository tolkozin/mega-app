import { createClient } from "@/lib/supabase/server";
import { checkAndIncrement } from "@/lib/ai-limits";
import { buildFileExtractPrompt } from "@/lib/ai-prompts";
import { rateLimit } from "@/lib/rate-limit";
import { checkSpendingGuard, recordSpend, AI_COST_ESTIMATES } from "@/lib/ai-spending-guard";
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

    // Rate limit: 5 file uploads per minute per user
    const rl = rateLimit(`ai-configure:${user.id}`, 5, 60_000);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    // Global spending guard
    const budget = checkSpendingGuard();
    if (!budget.allowed) {
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const modelType = formData.get("modelType") as string | null;

    if (!file || !modelType) {
      return new Response(JSON.stringify({ error: "Missing file or modelType" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validModelTypes = ["subscription", "ecommerce", "saas"];
    if (!validModelTypes.includes(modelType)) {
      return new Response(JSON.stringify({ error: "Invalid modelType" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      return new Response(JSON.stringify({ error: "File too large (max 500KB)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rate limit — counts as 1 report
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

    const fileContent = await file.text();

    if (!fileContent.trim()) {
      return new Response(JSON.stringify({ error: "File is empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30_000 });
    const systemPrompt = buildFileExtractPrompt(modelType);

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `File name: ${file.name}\n\nFile content:\n${fileContent.slice(0, 10000)}` },
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    recordSpend(AI_COST_ESTIMATES.configure);
    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(raw);

    return new Response(
      JSON.stringify({
        config_patch: parsed.config_patch,
        explanation: parsed.explanation,
        usage: { current: usage.current, limit: usage.limit, remaining: usage.remaining },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("AI configure error:", errMsg, error);
    return new Response(JSON.stringify({ error: "File analysis failed", detail: errMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

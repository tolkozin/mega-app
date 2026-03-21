import { createClient } from "@/lib/supabase/server";
import { checkAndIncrement } from "@/lib/ai-limits";
import { buildChatSystemPrompt } from "@/lib/ai-prompts";
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

    // Rate limit: 20 requests per minute per user
    const rl = rateLimit(`ai-chat:${user.id}`, 20, 60_000);
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

    const body = await request.json();
    const { message, modelType, dashboardContext, history } = body;

    if (!message || !modelType) {
      return new Response(JSON.stringify({ error: "Missing message or modelType" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const usage = await checkAndIncrement(user.id, "chat");
    if (!usage.allowed) {
      return new Response(
        JSON.stringify({
          error: "Monthly chat limit reached",
          detail: `${usage.limit} AI messages per month`,
          plan: usage.plan,
          usage: { current: usage.current, limit: usage.limit, remaining: 0 },
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30_000 });
    const systemPrompt = buildChatSystemPrompt(modelType, dashboardContext || "No data loaded yet.");

    const chatHistory = (history || [])
      .filter((m: { content: string }) => m.content && m.content.length > 0)
      .slice(-10)
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: message },
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages,
      stream: true,
      max_tokens: 1000,
    });

    recordSpend(AI_COST_ESTIMATES.chat);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, usage: { current: usage.current, limit: usage.limit, remaining: usage.remaining } })}\n\n`
            )
          );
        } catch (streamErr) {
          const msg = streamErr instanceof Error ? streamErr.message : String(streamErr);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("AI chat error:", errMsg, error);
    return new Response(JSON.stringify({ error: "AI chat failed", detail: errMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

import { createClient } from "@/lib/supabase/server";
import { checkAndIncrement } from "@/lib/ai-limits";
import { buildChatSystemPrompt } from "@/lib/ai-prompts";
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

    const { message, modelType, dashboardContext, history } = await request.json();

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
          usage: { current: usage.current, limit: usage.limit, remaining: 0 },
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemPrompt = buildChatSystemPrompt(modelType, dashboardContext || "No data loaded yet.");

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages,
      stream: true,
      max_tokens: 500,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
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
        controller.close();
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
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ error: "AI chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

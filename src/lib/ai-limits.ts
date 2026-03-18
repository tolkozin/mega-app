import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/plan-limits";

type LimitType = "chat" | "report" | "voice";

interface UsageResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

export async function checkAndIncrement(
  userId: string,
  type: LimitType,
  voiceSeconds?: number
): Promise<UsageResult> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, ai_chat_count, ai_report_count, ai_voice_seconds, ai_period_start")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    console.warn("ai-limits: could not read profile AI columns, skipping rate limit", error?.message);
    const limits = getPlanLimits("free");
    const fallbackLimit = type === "chat" ? limits.aiMessagesPerMonth : limits.aiReportsPerMonth;
    return { allowed: true, current: 0, limit: fallbackLimit, remaining: fallbackLimit };
  }

  const limits = getPlanLimits(profile.plan ?? "free");

  // Auto-reset if period is from a previous month
  const periodStart = new Date(profile.ai_period_start);
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  let chatCount = profile.ai_chat_count;
  let reportCount = profile.ai_report_count;
  let voiceSecs = profile.ai_voice_seconds;

  if (periodStart < currentMonthStart) {
    chatCount = 0;
    reportCount = 0;
    voiceSecs = 0;
    await supabase
      .from("profiles")
      .update({
        ai_chat_count: 0,
        ai_report_count: 0,
        ai_voice_seconds: 0,
        ai_period_start: currentMonthStart.toISOString(),
      })
      .eq("id", userId);
  }

  const limitMap = {
    chat: { current: chatCount, limit: limits.aiMessagesPerMonth, field: "ai_chat_count" },
    report: { current: reportCount, limit: limits.aiReportsPerMonth, field: "ai_report_count" },
    voice: { current: voiceSecs, limit: 120, field: "ai_voice_seconds" },
  } as const;

  const info = limitMap[type];

  // Unlimited plan — always allow
  if (info.limit === Infinity) {
    const increment = type === "voice" ? (voiceSeconds ?? 0) : 1;
    await supabase
      .from("profiles")
      .update({ [info.field]: info.current + increment })
      .eq("id", userId);
    return { allowed: true, current: info.current + increment, limit: info.limit, remaining: Infinity };
  }

  const increment = type === "voice" ? (voiceSeconds ?? 0) : 1;
  const newValue = info.current + increment;

  if (newValue > info.limit) {
    return {
      allowed: false,
      current: info.current,
      limit: info.limit,
      remaining: Math.max(0, info.limit - info.current),
    };
  }

  await supabase
    .from("profiles")
    .update({ [info.field]: newValue })
    .eq("id", userId);

  return {
    allowed: true,
    current: newValue,
    limit: info.limit,
    remaining: info.limit - newValue,
  };
}

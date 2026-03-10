import { createClient } from "@/lib/supabase/server";

export const AI_LIMITS = {
  CHAT_PER_MONTH: 30,
  REPORTS_PER_MONTH: 5,
  VOICE_SECONDS_PER_MONTH: 120,
} as const;

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_chat_count, ai_report_count, ai_voice_seconds, ai_period_start")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { allowed: false, current: 0, limit: 0, remaining: 0 };
  }

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
    chat: { current: chatCount, limit: AI_LIMITS.CHAT_PER_MONTH, field: "ai_chat_count" },
    report: { current: reportCount, limit: AI_LIMITS.REPORTS_PER_MONTH, field: "ai_report_count" },
    voice: { current: voiceSecs, limit: AI_LIMITS.VOICE_SECONDS_PER_MONTH, field: "ai_voice_seconds" },
  } as const;

  const info = limitMap[type];
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

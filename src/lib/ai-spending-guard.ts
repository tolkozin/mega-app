/**
 * Global daily spending guard for OpenAI API costs.
 *
 * Tracks estimated token usage in-memory per day.
 * When daily spend estimate exceeds the cap, all AI requests are blocked.
 *
 * Cost estimates (approximate, conservative):
 * - gpt-4.1-nano (chat):     ~$0.0002 per request (1K input + 1K output)
 * - gpt-4.1-mini (report):   ~$0.002  per request (2K input + 4K output)
 * - gpt-4.1-mini (configure): ~$0.001 per request (2K input + 2K output)
 */

const DAILY_BUDGET_USD = parseFloat(process.env.AI_DAILY_BUDGET_USD ?? "5.00");

interface DailyUsage {
  date: string;
  estimatedCostUsd: number;
  requestCount: number;
}

let usage: DailyUsage = {
  date: new Date().toISOString().slice(0, 10),
  estimatedCostUsd: 0,
  requestCount: 0,
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function resetIfNewDay(): void {
  const today = getToday();
  if (usage.date !== today) {
    usage = { date: today, estimatedCostUsd: 0, requestCount: 0 };
  }
}

export function checkSpendingGuard(): { allowed: boolean; remaining: number } {
  resetIfNewDay();
  const remaining = Math.max(0, DAILY_BUDGET_USD - usage.estimatedCostUsd);
  return {
    allowed: usage.estimatedCostUsd < DAILY_BUDGET_USD,
    remaining,
  };
}

export function recordSpend(estimatedCostUsd: number): void {
  resetIfNewDay();
  usage.estimatedCostUsd += estimatedCostUsd;
  usage.requestCount += 1;
}

/** Estimated cost per AI request type */
export const AI_COST_ESTIMATES = {
  chat: 0.0002,
  report: 0.002,
  configure: 0.001,
} as const;

export type PlanType = "free" | "plus" | "pro" | "enterprise";

export interface PlanLimits {
  maxProjects: number;
  maxScenariosPerProject: number;
  maxShares: number;
  aiMessagesPerMonth: number;
  aiReportsPerMonth: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxScenariosPerProject: 1,
    maxShares: 0,
    aiMessagesPerMonth: 10,
    aiReportsPerMonth: 1,
  },
  plus: {
    maxProjects: 3,
    maxScenariosPerProject: 3,
    maxShares: 3,
    aiMessagesPerMonth: 30,
    aiReportsPerMonth: 3,
  },
  pro: {
    maxProjects: Infinity,
    maxScenariosPerProject: Infinity,
    maxShares: 10,
    aiMessagesPerMonth: Infinity,
    aiReportsPerMonth: Infinity,
  },
  enterprise: {
    maxProjects: Infinity,
    maxScenariosPerProject: Infinity,
    maxShares: Infinity,
    aiMessagesPerMonth: Infinity,
    aiReportsPerMonth: Infinity,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as PlanType] ?? PLAN_LIMITS.free;
}

export function formatLimit(value: number): string {
  return value === Infinity ? "Unlimited" : value.toString();
}

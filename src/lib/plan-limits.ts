export type PlanType = "free" | "expired" | "plus" | "pro" | "enterprise";

export interface PlanLimits {
  maxProjects: number;
  maxScenariosPerProject: number;
  maxShares: number;
  aiMessagesPerMonth: number;
  aiReportsPerMonth: number;
  readOnly: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxProjects: 0,
    maxScenariosPerProject: 0,
    maxShares: 0,
    aiMessagesPerMonth: 0,
    aiReportsPerMonth: 0,
    readOnly: true,
  },
  expired: {
    maxProjects: 0,
    maxScenariosPerProject: 0,
    maxShares: 0,
    aiMessagesPerMonth: 0,
    aiReportsPerMonth: 0,
    readOnly: true,
  },
  plus: {
    maxProjects: 3,
    maxScenariosPerProject: 3,
    maxShares: 3,
    aiMessagesPerMonth: 30,
    aiReportsPerMonth: 3,
    readOnly: false,
  },
  pro: {
    maxProjects: Infinity,
    maxScenariosPerProject: Infinity,
    maxShares: 10,
    aiMessagesPerMonth: Infinity,
    aiReportsPerMonth: Infinity,
    readOnly: false,
  },
  enterprise: {
    maxProjects: Infinity,
    maxScenariosPerProject: Infinity,
    maxShares: Infinity,
    aiMessagesPerMonth: Infinity,
    aiReportsPerMonth: Infinity,
    readOnly: false,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as PlanType] ?? PLAN_LIMITS.expired;
}

export function formatLimit(value: number): string {
  return value === Infinity ? "Unlimited" : value.toString();
}

/** Returns true if the user has an active paid plan */
export function isActivePlan(plan: string): boolean {
  return plan === "plus" || plan === "pro" || plan === "enterprise";
}

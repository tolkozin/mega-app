import { describe, it, expect } from "vitest";
import { getPlanLimits, formatLimit, isActivePlan, PLAN_LIMITS } from "../plan-limits";

describe("getPlanLimits", () => {
  it("returns correct limits for each plan", () => {
    expect(getPlanLimits("plus").maxProjects).toBe(3);
    expect(getPlanLimits("pro").maxProjects).toBe(Infinity);
    expect(getPlanLimits("enterprise").maxShares).toBe(Infinity);
  });

  it("returns expired limits for free plan", () => {
    const free = getPlanLimits("free");
    expect(free.readOnly).toBe(true);
    expect(free.maxProjects).toBe(0);
  });

  it("returns expired limits for unknown plan", () => {
    const unknown = getPlanLimits("nonexistent");
    expect(unknown.readOnly).toBe(true);
    expect(unknown.maxProjects).toBe(0);
  });

  it("expired and free have identical limits", () => {
    expect(getPlanLimits("free")).toEqual(getPlanLimits("expired"));
  });
});

describe("formatLimit", () => {
  it("formats Infinity as Unlimited", () => {
    expect(formatLimit(Infinity)).toBe("Unlimited");
  });

  it("formats numbers as strings", () => {
    expect(formatLimit(3)).toBe("3");
    expect(formatLimit(0)).toBe("0");
    expect(formatLimit(30)).toBe("30");
  });
});

describe("isActivePlan", () => {
  it("returns true for paid plans", () => {
    expect(isActivePlan("plus")).toBe(true);
    expect(isActivePlan("pro")).toBe(true);
    expect(isActivePlan("enterprise")).toBe(true);
  });

  it("returns false for inactive plans", () => {
    expect(isActivePlan("free")).toBe(false);
    expect(isActivePlan("expired")).toBe(false);
    expect(isActivePlan("")).toBe(false);
    expect(isActivePlan("unknown")).toBe(false);
  });
});

describe("PLAN_LIMITS structure", () => {
  it("active plans are not read-only", () => {
    expect(PLAN_LIMITS.plus.readOnly).toBe(false);
    expect(PLAN_LIMITS.pro.readOnly).toBe(false);
    expect(PLAN_LIMITS.enterprise.readOnly).toBe(false);
  });

  it("pro has more than plus", () => {
    expect(PLAN_LIMITS.pro.maxProjects).toBeGreaterThan(PLAN_LIMITS.plus.maxProjects);
    expect(PLAN_LIMITS.pro.maxShares).toBeGreaterThan(PLAN_LIMITS.plus.maxShares);
  });
});

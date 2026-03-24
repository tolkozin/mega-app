import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the @lemonsqueezy/lemonsqueezy.js module before importing
vi.mock("@lemonsqueezy/lemonsqueezy.js", () => ({
  lemonSqueezySetup: vi.fn(),
  createCheckout: vi.fn(),
  getSubscription: vi.fn(),
  updateSubscription: vi.fn(),
}));

import {
  configureLemonSqueezy,
  variantIdToPlan,
  getVariantIdForPlan,
} from "../lemonsqueezy";

describe("configureLemonSqueezy", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when API key is missing", () => {
    vi.stubEnv("LEMONSQUEEZY_API_KEY", "");
    expect(() => configureLemonSqueezy()).toThrow("LEMONSQUEEZY_API_KEY is not set");
  });

  it("does not throw when API key is set", () => {
    vi.stubEnv("LEMONSQUEEZY_API_KEY", "test-key-123");
    expect(() => configureLemonSqueezy()).not.toThrow();
  });
});

describe("variantIdToPlan", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("maps plus monthly variant to plus", () => {
    vi.stubEnv("NEXT_PUBLIC_LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID", "111");
    vi.stubEnv("NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID", "222");
    // Force rebuild of variant map by importing fresh
    expect(variantIdToPlan("111")).toBe("plus");
  });

  it("returns null for unknown variant", () => {
    expect(variantIdToPlan("unknown-variant-999")).toBeNull();
  });
});

describe("getVariantIdForPlan", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns variant ID for valid plan + billing combo", () => {
    vi.stubEnv("NEXT_PUBLIC_LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID", "pm-123");
    expect(getVariantIdForPlan("plus", false)).toBe("pm-123");
  });

  it("returns annual variant when annual=true", () => {
    vi.stubEnv("NEXT_PUBLIC_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID", "pa-456");
    expect(getVariantIdForPlan("pro", true)).toBe("pa-456");
  });

  it("returns null for enterprise", () => {
    expect(getVariantIdForPlan("enterprise", false)).toBeNull();
  });

  it("returns null for unknown plan", () => {
    expect(getVariantIdForPlan("unknown", false)).toBeNull();
  });
});

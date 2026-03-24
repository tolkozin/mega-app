import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent, formatNumber } from "../utils";

describe("formatCurrency", () => {
  it("formats millions", () => {
    expect(formatCurrency(1_500_000)).toBe("$1.5M");
    expect(formatCurrency(10_000_000)).toBe("$10.0M");
  });

  it("formats thousands", () => {
    expect(formatCurrency(1_500)).toBe("$1.5K");
    expect(formatCurrency(42_000)).toBe("$42.0K");
  });

  it("formats small values", () => {
    expect(formatCurrency(99)).toBe("$99");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-2_500_000)).toBe("$-2.5M");
    expect(formatCurrency(-5_000)).toBe("$-5.0K");
    expect(formatCurrency(-50)).toBe("$-50");
  });
});

describe("formatPercent", () => {
  it("formats with one decimal", () => {
    expect(formatPercent(50)).toBe("50.0%");
    expect(formatPercent(33.33)).toBe("33.3%");
    expect(formatPercent(0)).toBe("0.0%");
    expect(formatPercent(100)).toBe("100.0%");
  });
});

describe("formatNumber", () => {
  it("formats with commas", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("rounds decimals", () => {
    expect(formatNumber(1234.7)).toBe("1,235");
    expect(formatNumber(99.4)).toBe("99");
  });

  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

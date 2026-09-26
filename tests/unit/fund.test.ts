import { describe, expect, it } from "vitest";
import { computeFundSummary, parsePositiveAmount, fundEncouragement } from "@/lib/utils/fund";
import type { FundContribution } from "@/types";

function contribution(amount: number, id = "c1"): FundContribution {
  return { id, amount, date: "2026-09-26", createdAt: new Date().toISOString() };
}

describe("computeFundSummary", () => {
  it("sums valid contributions", () => {
    const summary = computeFundSummary([contribution(500), contribution(300, "c2")], 1000);
    expect(summary.saved).toBe(800);
    expect(summary.remaining).toBe(200);
    expect(summary.progress).toBeCloseTo(0.8);
  });

  it("ignores invalid contribution amounts", () => {
    const summary = computeFundSummary([contribution(500), contribution(-100, "c2")], 1000);
    expect(summary.saved).toBe(500);
  });

  it("never lets remaining drop below zero and caps visual progress at 100%", () => {
    const summary = computeFundSummary([contribution(1200)], 1000);
    expect(summary.remaining).toBe(0);
    expect(summary.progress).toBe(1);
    expect(summary.surplus).toBe(200);
    expect(summary.reached).toBe(true);
  });

  it("handles zero or invalid targets", () => {
    const summary = computeFundSummary([contribution(100)], 0);
    expect(summary.progress).toBe(0);
    expect(summary.reached).toBe(false);
  });
});

describe("parsePositiveAmount", () => {
  it("accepts plain and grouped numbers", () => {
    expect(parsePositiveAmount("1500000")).toMatchObject({ ok: true, amount: 1500000 });
    expect(parsePositiveAmount("1,500,000")).toMatchObject({ ok: true, amount: 1500000 });
    expect(parsePositiveAmount("1.500.000")).toMatchObject({ ok: true, amount: 1500000 });
    expect(parsePositiveAmount("1.5")).toMatchObject({ ok: true, amount: 1.5 });
  });

  it("rejects empty, non-numeric, zero, negative, non-finite, and oversized values", () => {
    expect(parsePositiveAmount("")).toMatchObject({ ok: false });
    expect(parsePositiveAmount("abc")).toMatchObject({ ok: false });
    expect(parsePositiveAmount("0")).toMatchObject({ ok: false });
    expect(parsePositiveAmount("-5")).toMatchObject({ ok: false });
    expect(parsePositiveAmount("Infinity")).toMatchObject({ ok: false });
    expect(parsePositiveAmount("NaN")).toMatchObject({ ok: false });
    expect(parsePositiveAmount("1e15")).toMatchObject({ ok: false });
  });
});

describe("fundEncouragement", () => {
  it("never pressures and adapts to progress", () => {
    const zero = fundEncouragement(computeFundSummary([], 1000));
    expect(zero).toMatch(/first contribution/i);

    const reached = fundEncouragement(computeFundSummary([contribution(1000)], 1000));
    expect(reached).toMatch(/celebrate/i);
  });
});

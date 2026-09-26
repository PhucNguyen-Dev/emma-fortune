import { describe, expect, it } from "vitest";
import {
  countCouponsByStatus,
  currentLoveBalance,
  fundAvailableToTransfer,
  redeemCoupon,
  resetRedemptions,
  rollSpecialCard,
  totalRedeemedPoints,
  totalSpentOnShop,
} from "@/lib/utils/bank";
import { createDefaultState, STARTING_LOVE_BALANCE } from "@/lib/config/defaults";
import type { BankTransaction, Coupon, FundContribution } from "@/types";

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: "c1",
    title: "One long hug",
    description: "",
    category: "affection",
    icon: "heart",
    fictionalPointCost: 5000,
    status: "available",
    ...overrides,
  };
}

function tx(overrides: Partial<BankTransaction>): BankTransaction {
  return {
    id: "t",
    couponId: "x",
    couponTitle: "label",
    fictionalPointCost: 1_000,
    createdAt: "2026-09-26T00:00:00.000Z",
    ...overrides,
  };
}

function contribution(amount: number, id = "c1"): FundContribution {
  return { id, amount, date: "2026-09-26", createdAt: new Date().toISOString() };
}

describe("redeemCoupon", () => {
  it("updates status and creates exactly one transaction", () => {
    const state = createDefaultState();
    const target = state.coupons[0];
    const transactions: BankTransaction[] = [];
    const result = redeemCoupon(state.coupons, transactions, target.id, {
      redeemedAt: "2026-09-26T10:00:00.000Z",
      transactionId: "txn-1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const redeemed = result.coupons.find((c) => c.id === target.id);
    expect(redeemed?.status).toBe("redeemed");
    expect(redeemed?.redeemedAt).toBe("2026-09-26T10:00:00.000Z");
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      couponId: target.id,
      couponTitle: target.title,
      fictionalPointCost: target.fictionalPointCost,
      kind: "redemption",
      direction: "out",
    });
  });

  it("prevents duplicate redemption", () => {
    const state = createDefaultState();
    const target = state.coupons[0];
    const first = redeemCoupon(state.coupons, [], target.id);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = redeemCoupon(first.coupons, first.transactions, target.id);
    expect(second).toEqual({ ok: false, error: "already-redeemed" });
  });

  it("reports unknown coupons", () => {
    const state = createDefaultState();
    const result = redeemCoupon(state.coupons, [], "nope");
    expect(result).toEqual({ ok: false, error: "not-found" });
  });
});

describe("balance", () => {
  it("deducts legacy redemptions but never below zero", () => {
    const transactions: BankTransaction[] = [
      { id: "t1", couponId: "c1", couponTitle: "x", fictionalPointCost: 100_000, createdAt: "" },
    ];
    expect(totalRedeemedPoints(transactions)).toBe(100_000);
    expect(currentLoveBalance(transactions)).toBe(STARTING_LOVE_BALANCE - 100_000);

    const huge: BankTransaction[] = [
      { id: "t2", couponId: "c1", couponTitle: "x", fictionalPointCost: 99_000_000, createdAt: "" },
    ];
    expect(currentLoveBalance(huge)).toBe(0);
  });

  it("includes boutique purchases and transfers in both directions", () => {
    const transactions: BankTransaction[] = [
      tx({ id: "p1", kind: "purchase", direction: "out", fictionalPointCost: 20_000 }),
      tx({ id: "in1", kind: "transfer", direction: "in", fictionalPointCost: 50_000 }),
      tx({ id: "out1", kind: "transfer", direction: "out", fictionalPointCost: 10_000 }),
    ];
    expect(totalSpentOnShop(transactions)).toBe(20_000);
    expect(currentLoveBalance(transactions)).toBe(STARTING_LOVE_BALANCE - 20_000 + 50_000 - 10_000);
  });
});

describe("fundAvailableToTransfer", () => {
  it("subtracts coins that moved to the bank and adds coins that flew home", () => {
    const contributions = [contribution(100_000), contribution(50_000, "c2")];
    const transactions: BankTransaction[] = [
      tx({ id: "in1", kind: "transfer", direction: "in", fictionalPointCost: 30_000 }),
      tx({ id: "out1", kind: "transfer", direction: "out", fictionalPointCost: 5_000 }),
    ];
    expect(fundAvailableToTransfer(contributions, transactions)).toBe(100_000 + 50_000 - 30_000 + 5_000);
  });

  it("never goes below zero even if records were deleted", () => {
    const transactions: BankTransaction[] = [
      tx({ id: "in1", kind: "transfer", direction: "in", fictionalPointCost: 90_000 }),
    ];
    expect(fundAvailableToTransfer([contribution(10_000)], transactions)).toBe(0);
  });
});

describe("rollSpecialCard", () => {
  it("always appears at 100% and never at 0", () => {
    expect(rollSpecialCard(100, () => 0.999)).toBe(true);
    expect(rollSpecialCard(0, () => 0.001)).toBe(false);
    expect(rollSpecialCard(Number.NaN)).toBe(false);
  });

  it("at 0.01% a random draw of 0.000009 (0.0009%) finds it, 0.5% does not", () => {
    expect(rollSpecialCard(0.01, () => 0.000009)).toBe(true);
    expect(rollSpecialCard(0.01, () => 0.005)).toBe(false);
  });
});

describe("countCouponsByStatus / resetRedemptions", () => {
  it("counts statuses and resets cleanly", () => {
    const state = createDefaultState();
    expect(countCouponsByStatus(state.coupons, "available")).toBe(6);
    const redeemed = resetRedemptions([
      coupon({ status: "redeemed", redeemedAt: "x", redemptionNote: "hi" }),
    ]);
    expect(redeemed[0].status).toBe("available");
    expect(redeemed[0].redeemedAt).toBeUndefined();
    expect(redeemed[0].redemptionNote).toBeUndefined();
  });
});

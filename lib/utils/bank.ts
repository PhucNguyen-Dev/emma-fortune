import type { BankTransaction, Coupon, CouponStatus, FundContribution, TransactionDirection, TransactionKind } from "@/types";
import { STARTING_LOVE_BALANCE } from "@/lib/config/defaults";

export type RedemptionResult =
  | {
      ok: true;
      coupons: Coupon[];
      transactions: BankTransaction[];
      redeemedCoupon: Coupon;
    }
  | { ok: false; error: "not-found" | "already-redeemed" };

/**
 * Redeems a coupon: flips status to redeemed and appends exactly one transaction.
 * Duplicate redemptions are rejected so the activity feed stays honest.
 */
export function redeemCoupon(
  coupons: Coupon[],
  transactions: BankTransaction[],
  couponId: string,
  options: { note?: string; redeemedAt?: string; transactionId?: string } = {},
): RedemptionResult {
  const coupon = coupons.find((entry) => entry.id === couponId);
  if (!coupon) {
    return { ok: false, error: "not-found" };
  }
  if (coupon.status === "redeemed") {
    return { ok: false, error: "already-redeemed" };
  }
  const redeemedAt = options.redeemedAt ?? new Date().toISOString();
  const note = options.note?.trim();
  const redeemedCoupon: Coupon = {
    ...coupon,
    status: "redeemed",
    redeemedAt,
    redemptionNote: note && note.length > 0 ? note : undefined,
  };
  const transaction: BankTransaction = {
    id: options.transactionId ?? `txn-${couponId}-${Date.now()}`,
    couponId,
    couponTitle: coupon.title,
    fictionalPointCost: coupon.fictionalPointCost,
    createdAt: redeemedAt,
    kind: "redemption",
    direction: "out",
  };
  return {
    ok: true,
    redeemedCoupon,
    coupons: coupons.map((entry) => (entry.id === couponId ? redeemedCoupon : entry)),
    transactions: [transaction, ...transactions],
  };
}

function sumMatching(
  transactions: BankTransaction[],
  match: (tx: BankTransaction) => boolean,
): number {
  return transactions.reduce((total, tx) => {
    return Number.isFinite(tx.fictionalPointCost) && match(tx)
      ? total + tx.fictionalPointCost
      : total;
  }, 0);
}

function hasKind(tx: BankTransaction, kind: TransactionKind): boolean {
  // Transactions written before kinds existed are coupon redemptions.
  return (tx.kind ?? "redemption") === kind;
}

function directionOf(tx: BankTransaction): TransactionDirection {
  return tx.direction ?? "out";
}

export function totalRedeemedPoints(transactions: BankTransaction[]): number {
  return sumMatching(transactions, (tx) => hasKind(tx, "redemption"));
}

export function totalSpentOnShop(transactions: BankTransaction[]): number {
  return sumMatching(transactions, (tx) => hasKind(tx, "purchase"));
}

export function transferredOutToFund(transactions: BankTransaction[]): number {
  return sumMatching(
    transactions,
    (tx) => hasKind(tx, "transfer") && directionOf(tx) === "out",
  );
}

export function transferredInFromFund(transactions: BankTransaction[]): number {
  return sumMatching(
    transactions,
    (tx) => hasKind(tx, "transfer") && directionOf(tx) === "in",
  );
}

/** Coins that left the Future Fund for the bank (still owned by Emma, now spendable). */
export function fundMovedToBank(transactions: BankTransaction[]): number {
  return transferredInFromFund(transactions);
}

/** Coins that flew back home to the Future Fund. */
export function fundReceivedFromBank(transactions: BankTransaction[]): number {
  return transferredOutToFund(transactions);
}

/**
 * The treasury balance: starts at one million, shrinks with redemptions and
 * boutique shopping, and breathes with transfers to and from the Future Fund.
 */
export function currentLoveBalance(transactions: BankTransaction[]): number {
  return Math.max(
    0,
    STARTING_LOVE_BALANCE -
      totalRedeemedPoints(transactions) -
      totalSpentOnShop(transactions) -
      transferredOutToFund(transactions) +
      transferredInFromFund(transactions),
  );
}

export function countCouponsByStatus(coupons: Coupon[], status: CouponStatus): number {
  return coupons.filter((coupon) => coupon.status === status).length;
}

/** Owner action: put every coupon back in the available pile and clear the feed. */
export function resetRedemptions(coupons: Coupon[]): Coupon[] {
  return coupons.map((coupon) => ({
    ...coupon,
    status: "available" as const,
    redeemedAt: undefined,
    redemptionNote: undefined,
  }));
}

/**
 * Coins genuinely available to move out of the Future Fund: lifetime
 * contributions minus whatever already travelled to the bank, plus whatever
 * flew back home.
 */
export function fundAvailableToTransfer(
  contributions: FundContribution[],
  transactions: BankTransaction[],
): number {
  const saved = contributions.reduce(
    (total, entry) => (Number.isFinite(entry.amount) && entry.amount > 0 ? total + entry.amount : total),
    0,
  );
  return Math.max(0, saved - fundMovedToBank(transactions) + fundReceivedFromBank(transactions));
}

/**
 * The one-in-?? roll for the rare treasure. `random` is injectable for tests.
 * ratePercent 0.01 means roughly 1 appearance per 10,000 purchases.
 */
export function rollSpecialCard(ratePercent: number, random: () => number = Math.random): boolean {
  if (!Number.isFinite(ratePercent) || ratePercent <= 0) return false;
  return random() * 100 < ratePercent;
}

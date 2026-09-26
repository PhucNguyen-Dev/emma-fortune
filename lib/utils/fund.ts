import type { FundContribution } from "@/types";
import { MAX_AMOUNT } from "@/lib/validation/schemas";

export type FundSummary = {
  saved: number;
  target: number;
  remaining: number;
  /** 0..1 — visually capped at 100% even when saved exceeds the target. */
  progress: number;
  surplus: number;
  reached: boolean;
};

/** Total saved is always recomputed from contribution records, never trusted from a stored aggregate. */
export function computeFundSummary(
  contributions: FundContribution[],
  target: number,
): FundSummary {
  const saved = contributions.reduce((total, entry) => {
    return Number.isFinite(entry.amount) && entry.amount > 0 ? total + entry.amount : total;
  }, 0);
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 0;
  const remaining = Math.max(0, safeTarget - saved);
  const progress = safeTarget > 0 ? Math.min(1, saved / safeTarget) : 0;
  const surplus = Math.max(0, saved - safeTarget);
  return {
    saved,
    target: safeTarget,
    remaining,
    progress,
    surplus,
    reached: safeTarget > 0 && saved >= safeTarget,
  };
}

export type AmountParseResult =
  | { ok: true; amount: number }
  | { ok: false; error: string };

/**
 * Tolerant parser for typed amounts: accepts "1500000", "1,500,000" and "1.5".
 * Rejects empty, non-numeric, zero/negative, non-finite, and unrealistically large values.
 */
export function parsePositiveAmount(
  raw: string,
  options: { max?: number; label?: string } = {},
): AmountParseResult {
  const label = options.label ?? "Amount";
  const max = options.max ?? MAX_AMOUNT;
  const cleaned = raw.trim().replace(/\s/g, "");
  if (cleaned.length === 0) {
    return { ok: false, error: `${label} is required.` };
  }
  // Treat "," as a decimal separator unless it is clearly a thousands separator.
  let normalized = cleaned.replace(/,/g, ".");
  const dotCount = (normalized.match(/\./g) ?? []).length;
  if (dotCount > 1) {
    // Ambiguous input like 1.500.000 — treat dots as thousands separators.
    normalized = normalized.replace(/\./g, "");
  }
  const amount = Number(normalized);
  if (Number.isNaN(amount)) {
    return { ok: false, error: `Enter a valid number for ${label.toLowerCase()}.` };
  }
  if (!Number.isFinite(amount)) {
    return { ok: false, error: `Enter a valid number for ${label.toLowerCase()}.` };
  }
  if (amount <= 0) {
    return { ok: false, error: `${label} must be greater than zero.` };
  }
  if (amount > max) {
    return { ok: false, error: `${label} is too large to be realistic.` };
  }
  return { ok: true, amount };
}

/** Supportive, pressure-free message based on fund progress. */
export function fundEncouragement(summary: FundSummary): string {
  if (summary.target <= 0) {
    return "Set a target to see your progress here.";
  }
  if (summary.saved <= 0) {
    return "The first contribution is the bravest one. Record it here whenever you're ready.";
  }
  if (summary.reached) {
    return "You did it. This goal is officially within reach — time to celebrate honestly.";
  }
  const percent = Math.round(summary.progress * 100);
  if (percent < 25) {
    return "The first steps are the hardest. This one counts.";
  }
  if (percent < 50) {
    return "Steady and real. That is how good things get built.";
  }
  if (percent < 75) {
    return "Almost halfway is actually past halfway in spirit.";
  }
  return "So close now. The last stretch is the sweetest.";
}

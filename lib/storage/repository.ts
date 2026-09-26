import { z } from "zod";
import type { AppState } from "@/types";
import { appStateSchema } from "@/lib/validation/schemas";
import { createDefaultState } from "@/lib/config/defaults";

export const STORAGE_KEY = "emma-fortune:v1";
const BACKUP_KEY = "emma-fortune:v1:corrupt-backup";

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type LoadErrorKind = "corrupt" | "invalid" | "unsupported";

export type LoadResult = {
  state: AppState;
  /** True when part of the saved document had to be replaced with defaults. */
  recovered: boolean;
  error?: LoadErrorKind;
};

export type SaveResult = { ok: true } | { ok: false; reason: "quota" | "unavailable" | "invalid" };

function getLocalStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    if (!window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Keep unreadable data around locally so nothing is silently destroyed. */
function backUpRawValue(storage: StorageLike, raw: string): void {
  try {
    storage.setItem(BACKUP_KEY, raw);
  } catch {
    // best effort only
  }
}

/**
 * Validates the whole document; when that fails, salvages any section that is
 * individually valid and merges it over defaults. Never throws.
 */
export function sanitizeState(raw: unknown): { state: AppState; recovered: boolean } {
  const parsed = appStateSchema.safeParse(raw);
  if (parsed.success) {
    return { state: parsed.data, recovered: false };
  }

  const fallback = createDefaultState();
  if (typeof raw !== "object" || raw === null) {
    return { state: fallback, recovered: true };
  }

  const candidate = raw as Record<string, unknown>;

  const sectionResult = (schema: z.ZodTypeAny, value: unknown): unknown | undefined => {
    const result = schema.safeParse(value);
    return result.success ? result.data : undefined;
  };

  const config = sectionResult(appStateSchema.shape.config, candidate.config);
  const coupons = sectionResult(appStateSchema.shape.coupons, candidate.coupons);
  const contributions = sectionResult(
    appStateSchema.shape.contributions,
    candidate.contributions,
  );
  const wishlist = sectionResult(appStateSchema.shape.wishlist, candidate.wishlist);
  const transactions = sectionResult(
    appStateSchema.shape.transactions,
    candidate.transactions,
  );
  const specialCard = sectionResult(appStateSchema.shape.specialCard, candidate.specialCard);
  const preferences = sectionResult(appStateSchema.shape.preferences, candidate.preferences);

  const state: AppState = {
    schemaVersion: 1,
    config: (config as AppState["config"]) ?? fallback.config,
    coupons: (coupons as AppState["coupons"]) ?? fallback.coupons,
    contributions: (contributions as AppState["contributions"]) ?? fallback.contributions,
    wishlist: (wishlist as AppState["wishlist"]) ?? fallback.wishlist,
    transactions: (transactions as AppState["transactions"]) ?? fallback.transactions,
    specialCard: (specialCard as AppState["specialCard"]) ?? fallback.specialCard,
    preferences: (preferences as AppState["preferences"]) ?? fallback.preferences,
  };
  return { state, recovered: true };
}

export function loadAppState(storage: StorageLike | null = getLocalStorage()): LoadResult {
  if (!storage) {
    return { state: createDefaultState(), recovered: false };
  }

  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: createDefaultState(), recovered: false };
  }
  if (raw === null) {
    return { state: createDefaultState(), recovered: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    backUpRawValue(storage, raw);
    return { state: createDefaultState(), recovered: true, error: "corrupt" };
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion !== 1
  ) {
    backUpRawValue(storage, raw);
    return { state: createDefaultState(), recovered: true, error: "unsupported" };
  }

  const { state, recovered } = sanitizeState(parsed);
  if (recovered) {
    backUpRawValue(storage, raw);
    return { state, recovered: true, error: "invalid" };
  }
  return { state, recovered: false };
}

export function saveAppState(
  state: AppState,
  storage: StorageLike | null = getLocalStorage(),
): SaveResult {
  if (!storage) {
    return { ok: false, reason: "unavailable" };
  }
  const validation = appStateSchema.safeParse(state);
  if (!validation.success) {
    return { ok: false, reason: "invalid" };
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(validation.data));
    return { ok: true };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (error instanceof DOMException && /quota/i.test(error.name || error.message)) {
      return { ok: false, reason: "quota" };
    }
    if (/quota/i.test(name)) {
      return { ok: false, reason: "quota" };
    }
    return { ok: false, reason: "unavailable" };
  }
}

export function clearAppState(storage: StorageLike | null = getLocalStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(BACKUP_KEY);
  } catch {
    // nothing else we can do
  }
}

/** Read a raw string without throwing, for import flows. */
export function readImportText(file: File): Promise<string> {
  return file.text();
}

export function validateImportedState(raw: unknown): { ok: true; state: AppState } | { ok: false; reason: string } {
  if (typeof raw === "object" && raw !== null && "schemaVersion" in raw) {
    const version = (raw as { schemaVersion?: unknown }).schemaVersion;
    if (version !== 1) {
      return {
        ok: false,
        reason: `This backup uses schema version ${String(version)}. This app understands version 1 only.`,
      };
    }
  }
  const parsed = appStateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "That file doesn't look like an Emma's Unlimited Fortune backup. Nothing was changed.",
    };
  }
  return { ok: true, state: parsed.data };
}

export function parseImportedJson(text: string): { ok: true; value: unknown } | { ok: false; reason: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, reason: "That file isn't valid JSON. Nothing was changed." };
  }
}

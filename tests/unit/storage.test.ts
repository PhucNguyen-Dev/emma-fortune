import { afterEach, describe, expect, it } from "vitest";
import {
  clearAppState,
  loadAppState,
  parseImportedJson,
  saveAppState,
  STORAGE_KEY,
  validateImportedState,
  type StorageLike,
} from "@/lib/storage/repository";
import { createDefaultState } from "@/lib/config/defaults";
import type { AppState } from "@/types";

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

afterEach(() => {
  window.localStorage.clear();
});

describe("loadAppState", () => {
  it("returns defaults when nothing is stored", () => {
    const result = loadAppState(memoryStorage());
    expect(result.recovered).toBe(false);
    expect(result.state.config.recipientName).toBe("Ng Thanh Ngân");
  });

  it("round-trips through save without recovery", () => {
    const storage = memoryStorage();
    const state = createDefaultState();
    state.config.senderName = "Long";
    expect(saveAppState(state, storage)).toEqual({ ok: true });
    const result = loadAppState(storage);
    expect(result.recovered).toBe(false);
    expect(result.state.config.senderName).toBe("Long");
  });

  it("recovers defaults from corrupt JSON and keeps a backup", () => {
    const storage = memoryStorage({ [STORAGE_KEY]: "{not json" });
    const result = loadAppState(storage);
    expect(result.recovered).toBe(true);
    expect(result.error).toBe("corrupt");
    expect(result.state.config.recipientName).toBe("Ng Thanh Ngân");
    expect(storage.getItem(`${STORAGE_KEY}:corrupt-backup`)).toBe("{not json");
  });

  it("reports unsupported future schema versions", () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ ...createDefaultState(), schemaVersion: 2 }),
    });
    const result = loadAppState(storage);
    expect(result.error).toBe("unsupported");
    expect(result.recovered).toBe(true);
  });

  it("salvages valid sections from a partially invalid document", () => {
    const base = createDefaultState();
    base.transactions = [
      {
        id: "t1",
        couponId: "coupon-long-hug",
        couponTitle: "One long hug",
        fictionalPointCost: 5000,
        createdAt: "2026-09-26T00:00:00.000Z",
      },
    ];
    const raw = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
    raw.contributions = [{ amount: "not-a-number", id: "bad" }];

    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(raw) });
    const result = loadAppState(storage);
    expect(result.recovered).toBe(true);
    expect(result.state.transactions).toHaveLength(1);
    expect(result.state.contributions).toHaveLength(0);
    expect(result.state.config.recipientName).toBe("Ng Thanh Ngân");
  });
});

describe("saveAppState", () => {
  it("refuses to write invalid data", () => {
    const storage = memoryStorage();
    const state = createDefaultState() as unknown as Record<string, unknown>;
    state.schemaVersion = 99;
    const result = saveAppState(state as unknown as AppState, storage);
    expect(result).toEqual({ ok: false, reason: "invalid" });
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("reports quota errors without throwing", () => {
    const throwing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
      removeItem: () => {},
    };
    const result = saveAppState(createDefaultState(), throwing);
    expect(result).toEqual({ ok: false, reason: "quota" });
  });
});

describe("clearAppState", () => {
  it("removes stored data", () => {
    const storage = memoryStorage({ [STORAGE_KEY]: "{}" });
    clearAppState(storage);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("import validation", () => {
  it("rejects malformed JSON", () => {
    expect(parseImportedJson("{oops")).toEqual({ ok: false, reason: expect.any(String) });
  });

  it("rejects unsupported schema versions and wrong shapes", () => {
    const future = validateImportedState({ ...createDefaultState(), schemaVersion: 7 });
    expect(future.ok).toBe(false);

    const garbage = validateImportedState({ hello: "world" });
    expect(garbage.ok).toBe(false);
  });

  it("accepts a valid backup", () => {
    const result = validateImportedState(createDefaultState());
    expect(result.ok).toBe(true);
  });
});

describe("browser localStorage integration", () => {
  it("persists and reloads in jsdom", () => {
    const state = createDefaultState();
    state.preferences.introSeen = true;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const result = loadAppState();
    expect(result.state.preferences.introSeen).toBe(true);
  });
});

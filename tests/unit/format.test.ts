import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatPoints,
  daysUntilBirthday,
  isBirthdayToday,
  todayLocalISO,
} from "@/lib/formatting/format";

describe("formatCurrency", () => {
  it("formats VND without decimals and USD with them", () => {
    expect(formatCurrency(5_000_000, "VND", "vi-VN")).toMatch(/5(\.|\s)?000(\.|\s)?000/);
    expect(formatCurrency(1234.56, "USD", "en-US")).toMatch(/\$1,234\.56/);
  });

  it("falls back safely for invalid input", () => {
    expect(formatCurrency(Number.NaN, "VND", "vi-VN")).toBe("—");
    expect(formatCurrency(100, "NOPE", "vi-VN")).toContain("100");
  });
});

describe("formatPoints", () => {
  it("formats love points as numbers, never money", () => {
    expect(formatPoints(1_000_000, "vi-VN")).toMatch(/1\.000\.000|1,000,000/);
    expect(formatPoints(Number.NaN, "vi-VN")).toBe("—");
  });
});

describe("birthday helpers", () => {
  it("detects birthday today and counts down", () => {
    const birthday = "1998-09-26";
    const now = new Date(2026, 8, 26, 15, 0, 0); // Sept 26 2026 local
    expect(isBirthdayToday(birthday, now)).toBe(true);
    expect(daysUntilBirthday(birthday, now)).toBe(0);

    const later = new Date(2026, 8, 20, 8, 0, 0);
    expect(daysUntilBirthday(birthday, later)).toBe(6);
  });

  it("returns null for missing or invalid dates", () => {
    expect(isBirthdayToday(undefined, new Date())).toBe(false);
    expect(daysUntilBirthday(undefined, new Date())).toBeNull();
    expect(daysUntilBirthday("garbage", new Date())).toBeNull();
  });
});

describe("todayLocalISO", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayLocalISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

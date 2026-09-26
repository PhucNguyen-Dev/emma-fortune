import { describe, expect, it } from "vitest";
import {
  defaultWishlistFilters,
  filterAndSortWishlist,
  isSafeImageUrl,
  sortTransactionsNewestFirst,
  wishlistSummary,
} from "@/lib/utils/wishlist";
import { createDefaultState } from "@/lib/config/defaults";
import type { BankTransaction, WishlistItem } from "@/types";

function item(overrides: Partial<WishlistItem>): WishlistItem {
  const now = new Date(2026, 0, 1).toISOString();
  return {
    id: "w1",
    name: "Test item",
    category: "Fashion",
    description: "",
    priority: "medium",
    status: "dreaming",
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("filterAndSortWishlist", () => {
  const items = [
    item({ id: "a", name: "Gold necklace", description: "dainty", favorite: true, estimatedPrice: 1_200_000, priority: "dream" }),
    item({ id: "b", name: "Headphones", category: "Tech", estimatedPrice: 3_000_000, priority: "high", status: "planned" }),
    item({ id: "c", name: "Spa day", category: "Experiences", createdAt: new Date(2026, 1, 1).toISOString() }),
  ];

  it("searches name and description case-insensitively", () => {
    const result = filterAndSortWishlist(items, { ...defaultWishlistFilters, query: "GOLD" });
    expect(result.map((i) => i.id)).toEqual(["a"]);
    const byDescription = filterAndSortWishlist(items, {
      ...defaultWishlistFilters,
      query: "dainty",
    });
    expect(byDescription.map((i) => i.id)).toEqual(["a"]);
  });

  it("filters by category, status, and favorites", () => {
    expect(
      filterAndSortWishlist(items, { ...defaultWishlistFilters, category: "Tech" }).map((i) => i.id),
    ).toEqual(["b"]);
    expect(
      filterAndSortWishlist(items, { ...defaultWishlistFilters, status: "planned" }).map((i) => i.id),
    ).toEqual(["b"]);
    expect(
      filterAndSortWishlist(items, { ...defaultWishlistFilters, favoritesOnly: true }).map((i) => i.id),
    ).toEqual(["a"]);
  });

  it("sorts by newest, priority, and price with prices-safe fallbacks", () => {
    expect(
      filterAndSortWishlist(items, { ...defaultWishlistFilters, sort: "newest" }).map((i) => i.id),
    ).toEqual(["c", "a", "b"]);
    expect(
      filterAndSortWishlist(items, { ...defaultWishlistFilters, sort: "priority" }).map((i) => i.id),
    ).toEqual(["a", "b", "c"]);
    expect(
      filterAndSortWishlist(items, { ...defaultWishlistFilters, sort: "price-asc" }).map((i) => i.id),
    ).toEqual(["a", "b", "c"]);
    expect(
      filterAndSortWishlist(items, { ...defaultWishlistFilters, sort: "price-desc" }).map((i) => i.id),
    ).toEqual(["b", "a", "c"]);
  });
});

describe("wishlistSummary", () => {
  it("counts totals, favorites, planned, and gifted", () => {
    const state = createDefaultState();
    const summary = wishlistSummary(state.wishlist);
    expect(summary.total).toBe(8);
    expect(summary.favorites).toBe(2);
    expect(summary.planned).toBe(0);
    expect(summary.gifted).toBe(0);
  });
});

describe("isSafeImageUrl", () => {
  it("allows only http(s) URLs", () => {
    expect(isSafeImageUrl("https://example.com/a.png")).toBe(true);
    expect(isSafeImageUrl("http://example.com/a.png")).toBe(true);
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeImageUrl("data:image/png;base64,xxx")).toBe(false);
    expect(isSafeImageUrl("")).toBe(false);
    expect(isSafeImageUrl(undefined)).toBe(false);
  });
});

describe("sortTransactionsNewestFirst", () => {
  it("orders newest first", () => {
    const transactions: BankTransaction[] = [
      { id: "1", couponId: "c", couponTitle: "old", fictionalPointCost: 1, createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "2", couponId: "c", couponTitle: "new", fictionalPointCost: 1, createdAt: "2026-02-01T00:00:00.000Z" },
    ];
    expect(sortTransactionsNewestFirst(transactions).map((t) => t.id)).toEqual(["2", "1"]);
  });
});

import { describe, expect, it } from "vitest";
import {
  createFavouritesPdf,
  favouritesPdfFilename,
  selectItemsForPdf,
} from "@/lib/utils/wishlistPdf";
import { createDefaultState } from "@/lib/config/defaults";
import type { WishlistItem } from "@/types";

function item(overrides: Partial<WishlistItem>): WishlistItem {
  const now = new Date(2026, 0, 1).toISOString();
  return {
    id: "w1",
    name: "Velvet Lipstick",
    category: "Beauty",
    description: "",
    priority: "high",
    status: "dreaming",
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("selectItemsForPdf", () => {
  it("returns only favourites in favourites mode, everything in all mode", () => {
    const items = [item({ id: "a", favorite: true }), item({ id: "b" })];
    expect(selectItemsForPdf(items, "favourites").map((i) => i.id)).toEqual(["a"]);
    expect(selectItemsForPdf(items, "all")).toHaveLength(2);
  });
});

describe("favouritesPdfFilename", () => {
  it("builds a friendly filename from the recipient name", () => {
    expect(favouritesPdfFilename("Emma")).toBe("emma-favourites.pdf");
    expect(favouritesPdfFilename("María José")).toBe("mar-a-jos-favourites.pdf");
  });

  it("falls back gracefully for non-latin names", () => {
    expect(favouritesPdfFilename("甜甜")).toBe("my-favourites.pdf");
  });
});

describe("createFavouritesPdf", () => {
  it("produces a real PDF containing names and brands but no prices", async () => {
    const state = createDefaultState();
    const items = selectItemsForPdf(
      state.wishlist.map((entry, i) => ({
        ...entry,
        brand: "Chanel",
        estimatedPrice: 9_999_999,
        favorite: i % 2 === 0,
      })),
      "favourites",
    );

    const pdf = await createFavouritesPdf(items, "Emma");
    expect(pdf.filename).toBe("emma-favourites.pdf");
    expect(pdf.pages).toBeGreaterThanOrEqual(1);

    const bytes = new Uint8Array(pdf.doc.output("arraybuffer")).slice(0, 5);
    expect(String.fromCharCode(...bytes)).toBe("%PDF-");
  });

  it("still renders a valid PDF when the list is empty", async () => {
    const pdf = await createFavouritesPdf([], "Emma");
    const bytes = new Uint8Array(pdf.doc.output("arraybuffer")).slice(0, 5);
    expect(String.fromCharCode(...bytes)).toBe("%PDF-");
  });
});

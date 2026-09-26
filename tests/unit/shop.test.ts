import { describe, expect, it } from "vitest";
import {
  generateShopCatalog,
  getShopItem,
  MAX_SHOP_PRICE,
  MIN_SHOP_PRICE,
  shopCatalogSize,
} from "@/lib/config/shop";

describe("the boutique catalog", () => {
  const catalog = generateShopCatalog();

  it("is a large shelf of treasures (~50 archetypes × 5 brands)", () => {
    expect(shopCatalogSize()).toBe(catalog.length);
    expect(catalog.length).toBeGreaterThanOrEqual(200);
    const kinds = new Set(catalog.map((item) => item.kind));
    expect(kinds.size).toBeGreaterThanOrEqual(40);
    expect(catalog.length).toBe(kinds.size * 5);
  });

  it("has unique ids and stable generation", () => {
    const ids = new Set(catalog.map((item) => item.id));
    expect(ids.size).toBe(catalog.length);
    // Deterministic: a fresh call returns identical items.
    expect(generateShopCatalog()[0]).toEqual(catalog[0]);
  });

  it("keeps every price between 1,000 and 100,000 love points", () => {
    for (const item of catalog) {
      expect(item.price).toBeGreaterThanOrEqual(MIN_SHOP_PRICE);
      expect(item.price).toBeLessThanOrEqual(MAX_SHOP_PRICE);
      expect(Number.isInteger(item.price)).toBe(true);
    }
  });

  it("names items after their archetype with the famous brand beneath", () => {
    const lipstick = catalog.filter((item) => item.kind === "Lipstick");
    expect(lipstick).toHaveLength(5);
    const brands = lipstick.map((item) => item.brand);
    expect(brands).toContain("Chanel");
    expect(brands).toContain("Dior");
    for (const item of lipstick) {
      expect(item.name.endsWith("Lipstick")).toBe(true);
      expect(item.name).not.toBe(item.brand);
      expect(item.category).toBe("Makeup");
    }
  });

  it("covers every boutique category with variants", () => {
    for (const category of [
      "Makeup",
      "Skincare",
      "Hair",
      "Jewelry & Accessories",
      "Treats & Comfort",
    ] as const) {
      const inCategory = catalog.filter((item) => item.category === category);
      expect(inCategory.length).toBeGreaterThan(0);
      const names = new Set(inCategory.map((item) => item.name));
      expect(names.size).toBe(inCategory.length);
    }
  });

  it("looks items up by id", () => {
    const first = catalog[0];
    expect(getShopItem(first.id)).toEqual(first);
    expect(getShopItem("nope")).toBeUndefined();
  });
});

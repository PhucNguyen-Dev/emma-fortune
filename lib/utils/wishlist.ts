import type { BankTransaction, WishlistItem, WishlistPriority } from "@/types";
import type { AppConfig } from "@/types";

export type WishlistSort = "newest" | "priority" | "price-desc" | "price-asc";

export type WishlistFilters = {
  query: string;
  category: string; // "all" or a category name
  status: "all" | WishlistItem["status"];
  favoritesOnly: boolean;
  sort: WishlistSort;
};

export const defaultWishlistFilters: WishlistFilters = {
  query: "",
  category: "all",
  status: "all",
  favoritesOnly: false,
  sort: "newest",
};

const PRIORITY_ORDER: Record<WishlistPriority, number> = {
  dream: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function filterAndSortWishlist(
  items: WishlistItem[],
  filters: WishlistFilters,
): WishlistItem[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (filters.favoritesOnly && !item.favorite) return false;
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (query.length > 0) {
      const haystack = `${item.name} ${item.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "priority":
      sorted.sort(
        (a, b) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
          b.updatedAt.localeCompare(a.updatedAt),
      );
      break;
    case "price-desc":
      sorted.sort((a, b) => (b.estimatedPrice ?? -1) - (a.estimatedPrice ?? -1));
      break;
    case "price-asc":
      sorted.sort((a, b) => {
        const aPrice = a.estimatedPrice ?? Number.POSITIVE_INFINITY;
        const bPrice = b.estimatedPrice ?? Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
      });
      break;
    case "newest":
    default:
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
  }
  return sorted;
}

export type WishlistSummaryCounts = {
  total: number;
  favorites: number;
  planned: number;
  gifted: number;
};

export function wishlistSummary(items: WishlistItem[]): WishlistSummaryCounts {
  return {
    total: items.length,
    favorites: items.filter((item) => item.favorite).length,
    planned: items.filter((item) => item.status === "planned").length,
    gifted: items.filter((item) => item.status === "gifted").length,
  };
}

/** Only http(s) image URLs are allowed — anything else is treated as unset. */
export function isSafeImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /^https?:\/\/\S+$/i.test(trimmed);
}

export function wishlistCurrency(item: WishlistItem, config: AppConfig): string {
  return item.currency && item.currency.length > 0 ? item.currency : config.currency;
}

/** Feed is newest-first; transaction copies carry their own title so deleted coupons still render. */
export function sortTransactionsNewestFirst(
  transactions: BankTransaction[],
): BankTransaction[] {
  return [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

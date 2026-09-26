"use client";

import { useMemo, useState } from "react";
import {
  Candy,
  Circle,
  Cloud,
  Coffee,
  Droplets,
  Eye,
  Flame,
  Flower2,
  Footprints,
  Gem,
  Glasses,
  Gift,
  Hand,
  Heart,
  Moon,
  Palette,
  Pencil,
  Search,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { SpecialTreasure } from "@/components/bank/SpecialTreasure";
import { useAppState } from "@/lib/state/AppStateContext";
import {
  generateShopCatalog,
  shopCatalogSize,
  SHOP_CATEGORIES,
} from "@/lib/config/shop";
import { currentLoveBalance } from "@/lib/utils/bank";
import { formatPoints } from "@/lib/formatting/format";
import type { ShopItem } from "@/types";

const PAGE_SIZE = 24;

const SHOP_ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  heart: Heart,
  eye: Eye,
  pencil: Pencil,
  flower: Flower2,
  sun: Sun,
  droplet: Droplets,
  cloud: Cloud,
  wind: Wind,
  gem: Gem,
  palette: Palette,
  moon: Moon,
  hand: Hand,
  gift: Gift,
  circle: Circle,
  star: Star,
  glasses: Glasses,
  shirt: Shirt,
  "shopping-bag": ShoppingBag,
  smartphone: Smartphone,
  flame: Flame,
  candy: Candy,
  coffee: Coffee,
  footprints: Footprints,
};

function ShopIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SHOP_ICON_MAP[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}

export function Boutique() {
  const { state, buyShopItem, showToast } = useAppState();
  const { config } = state;
  const catalog = useMemo(() => generateShopCatalog(), []);
  const balance = currentLoveBalance(state.transactions);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ShopItem["category"]>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const ownedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tx of state.transactions) {
      if ((tx.kind ?? "redemption") === "purchase") {
        counts.set(tx.couponId, (counts.get(tx.couponId) ?? 0) + 1);
      }
    }
    return counts;
  }, [state.transactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (q.length > 0 && !`${item.name} ${item.kind} ${item.brand}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [catalog, query, category]);

  const visible = filtered.slice(0, visibleCount);
  const filtersActive = query.trim().length > 0 || category !== "all";

  function handleBuy(item: ShopItem) {
    const result = buyShopItem(item.id);
    if (!result.ok) {
      if (result.reason === "insufficient") {
        showToast(
          "The treasury needs a little top-up first — visit your Future Fund, it misses you. 💫",
          "error",
        );
      }
      return;
    }
    showToast(`“${item.name}” is yours. Wear it happily. 🛍️`);
  }

  return (
    <section aria-label="The Unlimited Boutique" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-plum">
            <Store className="h-5 w-5 text-rose-deep" aria-hidden />
            The Unlimited Boutique
          </h2>
          <p className="text-sm text-muted">
            Little luxuries for every day — the shelves restock themselves, forever.
          </p>
        </div>
        <Badge tone="champagne">{shopCatalogSize()} treasures</Badge>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-champagne/50 bg-gradient-to-r from-champagne/15 via-blush/40 to-transparent px-4 py-3">
        <Sparkles
          className="mt-0.5 h-4 w-4 shrink-0 animate-sparkle text-champagne-deep"
          aria-hidden
        />
        <p className="text-sm text-plum">
          Buy enough treasures, and{" "}
          <strong>something magical will appear before you</strong>… something no coin can
          buy.
        </p>
      </div>

      <SpecialTreasure />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Search the boutique"
            placeholder="Search treasures — lipstick, Dior, candle…"
            className="pl-9"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Boutique categories">
          <Button
            size="sm"
            variant={category === "all" ? "primary" : "secondary"}
            aria-pressed={category === "all"}
            onClick={() => {
              setCategory("all");
              setVisibleCount(PAGE_SIZE);
            }}
          >
            All
          </Button>
          {SHOP_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? "primary" : "secondary"}
              aria-pressed={category === cat}
              onClick={() => {
                setCategory(cat);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <Card className="px-6 py-10 text-center text-sm text-muted">
          No treasures match that search — try another wish.
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((item) => {
              const owned = ownedCounts.get(item.id) ?? 0;
              const affordable = balance >= item.price;
              return (
                <Card key={item.id} className="flex h-full flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blush text-plum">
                      <ShopIcon name={item.icon} className="h-4.5 w-4.5" />
                    </span>
                    {owned > 0 && (
                      <span className="text-[11px] font-medium text-champagne-deep">
                        ×{owned} in your collection
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2.5 font-display text-[15px] font-semibold leading-snug text-plum break-words">
                    {item.name}
                  </h3>
                  <p className="text-xs font-medium tracking-wide text-rose-deep">{item.brand}</p>
                  <div className="mt-auto flex flex-col gap-2 pt-3">
                    <p className="text-sm font-semibold text-champagne-deep">
                      {formatPoints(item.price, config.locale)}
                      <span className="ml-1 text-xs font-normal text-muted">pts</span>
                    </p>
                    <Button
                      size="sm"
                      disabled={!affordable}
                      title={
                        affordable
                          ? `Buy ${item.name}`
                          : "Not enough coins — yet. Your Future Fund can help."
                      }
                      aria-label={`Buy ${item.name} by ${item.brand} for ${item.price} love points`}
                      onClick={() => handleBuy(item)}
                    >
                      <ShoppingBag className="h-4 w-4" aria-hidden />
                      Buy
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          {visible.length < filtered.length && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Reveal more treasures ({filtered.length - visible.length} waiting)
              </Button>
            </div>
          )}
          {filtersActive && (
            <p className="text-center text-xs text-muted">
              Showing {visible.length} of {filtered.length} matching treasures.
            </p>
          )}
        </>
      )}
    </section>
  );
}

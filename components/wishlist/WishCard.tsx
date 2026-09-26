"use client";

import { Heart, Headphones, Gem, Gift, Plane, Shirt, Sparkles, type LucideIcon } from "lucide-react";
import { Badge, Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatting/format";
import { isSafeImageUrl, wishlistCurrency } from "@/lib/utils/wishlist";
import { useAppState } from "@/lib/state/AppStateContext";
import type { WishlistItem } from "@/types";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Fashion: Shirt,
  Beauty: Sparkles,
  Tech: Headphones,
  Experiences: Plane,
  "Little luxuries": Gem,
  Other: Gift,
};

const STATUS_TONES: Record<WishlistItem["status"], "blush" | "champagne" | "rose"> = {
  dreaming: "blush",
  planned: "champagne",
  gifted: "rose",
};

export function WishCard({
  item,
  onOpen,
  onToggleFavorite,
}: {
  item: WishlistItem;
  onOpen: (item: WishlistItem) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const { state } = useAppState();
  const { config } = state;
  const CategoryIcon = CATEGORY_ICONS[item.category] ?? Gift;
  const hasImage = isSafeImageUrl(item.imageUrl);

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block w-full cursor-pointer text-left focus-visible:outline-2"
        aria-label={`Open details for ${item.name}`}
      >
        <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-blush via-ivory-deep to-blush/60">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary owner-provided URLs cannot be whitelisted for next/image
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <CategoryIcon className="h-10 w-10 text-rose-deep/60" aria-hidden />
          )}
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge tone={STATUS_TONES[item.status]}>{item.status}</Badge>
            {item.priority === "dream" && <Badge tone="plum">dream</Badge>}
          </div>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            {item.category}
          </p>
          <h3 className="mt-1 font-display text-base font-semibold text-plum break-words">
            {item.name}
          </h3>
          {item.brand && (
            <p className="mt-0.5 text-xs font-medium tracking-wide text-rose-deep">
              {item.brand}
            </p>
          )}
          {item.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted break-words">
              {item.description}
            </p>
          )}
          {typeof item.estimatedPrice === "number" && (
            <p className="mt-2 text-sm font-medium text-champagne-deep">
              ~{formatCurrency(item.estimatedPrice, wishlistCurrency(item, config), config.locale)}
              <span className="ml-1.5 text-xs font-normal text-muted">estimate, not a quote</span>
            </p>
          )}
        </div>
      </button>
      <div className="mt-auto flex items-center justify-between px-4 pb-4">
        <span className="text-xs text-muted">Tap card for details</span>
        <button
          type="button"
          onClick={() => onToggleFavorite(item.id)}
          aria-pressed={item.favorite}
          aria-label={item.favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            item.favorite ? "text-rose-deep" : "text-muted hover:text-plum"
          }`}
        >
          <Heart className="h-5 w-5" fill={item.favorite ? "currentColor" : "none"} aria-hidden />
        </button>
      </div>
    </Card>
  );
}

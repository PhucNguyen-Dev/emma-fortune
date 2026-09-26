"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/formatting/format";
import { isSafeImageUrl, wishlistCurrency } from "@/lib/utils/wishlist";
import { useAppState } from "@/lib/state/AppStateContext";
import type { WishlistItem } from "@/types";

export function WishDetailDialog({
  item,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  item: WishlistItem | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: WishlistItem) => void;
  onDelete: (item: WishlistItem) => void;
}) {
  const { state, updateWishlistItem, showToast } = useAppState();
  const { config } = state;
  if (!item) return null;
  const hasImage = isSafeImageUrl(item.imageUrl);

  function setStatus(status: WishlistItem["status"]) {
    updateWishlistItem(item!.id, { status });
    showToast(
      status === "gifted"
        ? `“${item!.name}” marked as gifted — lucky you. 💝`
        : `Status updated to ${status}.`,
    );
  }

  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{item.name}</DialogTitle>
        <DialogDescription>
          {item.brand ? `${item.brand} · ` : ""}
          {item.category} · priority: {item.priority}
        </DialogDescription>

        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary owner-provided URLs cannot be whitelisted for next/image
          <img
            src={item.imageUrl}
            alt={`Image of ${item.name}`}
            className="mt-4 max-h-56 w-full rounded-xl object-cover"
            referrerPolicy="no-referrer"
          />
        )}

        {item.description && (
          <p className="mt-4 text-sm leading-relaxed text-ink/85 break-words">
            {item.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="blush">{item.status}</Badge>
          {typeof item.estimatedPrice === "number" && (
            <Badge tone="champagne">
              ~{formatCurrency(item.estimatedPrice, wishlistCurrency(item, config), config.locale)}{" "}
              · estimate
            </Badge>
          )}
          {item.favorite && <Badge tone="rose">favorite</Badge>}
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Status</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Set status">
            {(["dreaming", "planned", "gifted"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={item.status === status ? "primary" : "secondary"}
                aria-pressed={item.status === status}
                onClick={() => setStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            “Gifted” is only set manually — nothing here is inferred or purchased.
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="danger" onClick={() => onDelete(item)}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </Button>
          <Button onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

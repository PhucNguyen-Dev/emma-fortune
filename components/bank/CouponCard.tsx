"use client";

import { useState } from "react";
import {
  CalendarHeart,
  Check,
  Cookie,
  Heart,
  MoonStar,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPoints, formatDateTime } from "@/lib/formatting/format";
import { useAppState } from "@/lib/state/AppStateContext";
import type { Coupon } from "@/types";

export const COUPON_ICONS: Record<string, LucideIcon> = {
  heart: Heart,
  "calendar-heart": CalendarHeart,
  "moon-star": MoonStar,
  cookie: Cookie,
  "shopping-bag": ShoppingBag,
  sparkles: Sparkles,
};

function CouponIcon({ name, className }: { name: string; className?: string }) {
  const Icon = COUPON_ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const { redeemCoupon, showToast, state } = useAppState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [note, setNote] = useState("");
  const reduced = state.preferences.reducedMotion === true;

  const isRedeemed = coupon.status === "redeemed";

  function confirmRedeem() {
    const ok = redeemCoupon(coupon.id, note);
    if (ok) {
      showToast(`“${coupon.title}” redeemed — enjoy every minute. 💌`);
    }
    setNote("");
    setDialogOpen(false);
  }

  if (isRedeemed) {
    return (
      <Card className="relative overflow-hidden p-5 opacity-90">
        <span
          aria-hidden
          className="absolute right-4 top-4 rotate-12 rounded-md border-2 border-rose-deep/60 px-2 py-0.5 text-[11px] font-bold tracking-widest text-rose-deep/80 uppercase"
        >
          Redeemed
        </span>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blush/70 text-rose-deep">
            <CouponIcon name={coupon.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 pr-14">
            <h3 className="font-display text-base font-semibold text-plum break-words">
              {coupon.title}
            </h3>
            <p className="mt-1 text-sm text-muted">{coupon.description}</p>
            <p className="mt-2 text-xs text-muted">
              Redeemed{" "}
              {coupon.redeemedAt ? formatDateTime(coupon.redeemedAt, state.config.locale) : ""}
            </p>
            {coupon.redemptionNote && (
              <p className="mt-1 rounded-lg bg-blush/60 px-2.5 py-1.5 text-xs text-plum italic break-words">
                “{coupon.redemptionNote}”
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs font-medium text-muted">
          {formatPoints(coupon.fictionalPointCost, state.config.locale)} love points — kept
          forever
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blush text-plum">
          <CouponIcon name={coupon.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="rose">{coupon.category}</Badge>
          </div>
          <h3 className="mt-1.5 font-display text-base font-semibold text-plum break-words">
            {coupon.title}
          </h3>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{coupon.description}</p>
      <div className="mt-4 flex flex-1 flex-col justify-end gap-3">
                    <p className="text-sm font-semibold text-champagne-deep">
                      {formatPoints(coupon.fictionalPointCost, state.config.locale)} pts
                      <span className="ml-1.5 font-normal text-muted">love points</span>
                    </p>
        <Button
          onClick={() => setDialogOpen(true)}
          aria-label={`Redeem coupon: ${coupon.title}`}
          className="w-full"
        >
          Redeem
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>Redeem this little promise?</DialogTitle>
          <DialogDescription>
            “{coupon.title}” — {formatPoints(coupon.fictionalPointCost, state.config.locale)}{" "}
            love points. A real promise, from me to you — redeemable whenever your heart
            asks.
          </DialogDescription>
          <div className="mt-4">
            <label
              htmlFor={`coupon-note-${coupon.id}`}
              className="text-sm font-medium text-plum"
            >
              Add a note (optional)
            </label>
            <Textarea
              id={`coupon-note-${coupon.id}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={300}
              placeholder="e.g. for a rainy Friday evening"
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRedeem}>
              {reduced ? <Check className="h-4 w-4" aria-hidden /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

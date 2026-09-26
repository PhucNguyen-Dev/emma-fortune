"use client";

import { useState } from "react";
import { Check, Ticket } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AccountCard } from "@/components/bank/AccountCard";
import { CouponCard } from "@/components/bank/CouponCard";
import { ActivityFeed } from "@/components/bank/ActivityFeed";
import { Boutique } from "@/components/bank/Boutique";
import { useAppState } from "@/lib/state/AppStateContext";
import { countCouponsByStatus } from "@/lib/utils/bank";

export function BankView() {
  const { state, redeemCoupon, showToast } = useAppState();
  const [redeemAllOpen, setRedeemAllOpen] = useState(false);

  const available = state.coupons.filter((coupon) => coupon.status === "available");
  const redeemedCoupons = state.coupons.filter((coupon) => coupon.status === "redeemed");
  const availableCount = countCouponsByStatus(state.coupons, "available");

  function redeemAll() {
    let redeemed = 0;
    for (const coupon of available) {
      if (redeemCoupon(coupon.id)) redeemed += 1;
    }
    showToast(`All ${redeemed} promises redeemed. Go collect them all. 🎉`);
  }

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Exclusive · One account holder · Unlimited affection"
        title="Birthday Bank"
        subtitle="A very exclusive bank. One account holder. Unlimited affection."
        badge={<Badge tone="blush">Coins minted from love</Badge>}
      />

      <AccountCard />

      <Boutique />

      <section aria-label="Spend your fortune" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-plum">
              Promises beyond price
            </h2>
            <p className="text-sm text-muted">
              Experience coupons — the kind of things no shop can sell.
            </p>
          </div>
          {availableCount >= 2 && (
            <Button variant="secondary" size="sm" onClick={() => setRedeemAllOpen(true)}>
              Redeem all ({availableCount})
            </Button>
          )}
        </div>

        {available.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="You've gathered every promise"
            body="Every coupon has been redeemed. That's what we call a rich life. (The owner can reset coupons in Settings.)"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {available.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}

        {redeemedCoupons.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-plum">
              <Check className="h-4.5 w-4.5 text-rose-deep" aria-hidden />
              Redeemed ({redeemedCoupons.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {redeemedCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </div>
        )}
      </section>

      <ActivityFeed />

      <Card className="px-5 py-4">
        <p className="text-xs leading-relaxed text-muted">
          These aren&apos;t coupons — they&apos;re promises. Each one is written for you,
          kept by someone who loves you, and valid forever. No expiry, no small print, no
          take-backs.
        </p>
      </Card>

      <ConfirmDialog
        open={redeemAllOpen}
        onOpenChange={setRedeemAllOpen}
        title="Redeem all available promises?"
        body={`This redeems ${availableCount} coupons at once and writes each one into your story. Fictional love points only — the promises are the real part.`}
        confirmLabel={`Redeem all ${availableCount}`}
        onConfirm={redeemAll}
      />
    </div>
  );
}

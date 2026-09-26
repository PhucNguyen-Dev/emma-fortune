"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currentLoveBalance, totalRedeemedPoints, totalSpentOnShop } from "@/lib/utils/bank";
import { formatPoints } from "@/lib/formatting/format";
import { useAppState } from "@/lib/state/AppStateContext";
import { TransferDialog } from "@/components/bank/TransferDialog";

export function AccountCard() {
  const { state, transferBankToFund, showToast } = useAppState();
  const { config } = state;
  const balance = currentLoveBalance(state.transactions);
  const redeemed = totalRedeemedPoints(state.transactions);
  const shopped = totalSpentOnShop(state.transactions);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  return (
    <section
      aria-label="Account summary"
      className="card-sheen relative overflow-hidden rounded-3xl p-6 text-ivory shadow-(--shadow-luxe) sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-champagne uppercase">
            Unlimited Love Account
          </p>
          <p className="mt-2 text-sm text-ivory/85">
            Treasury of <span className="font-semibold">{config.recipientName}</span> · the
            only one of its kind
          </p>
        </div>
        <Badge tone="champagne" className="bg-champagne/90 text-plum-deep">
          Coins minted from love
        </Badge>
      </div>

      <div className="mt-8">
        <p className="text-sm text-ivory/80">Love Balance</p>
        <p
          className="mt-1 break-words font-display text-4xl font-semibold sm:text-5xl"
          data-testid="love-balance"
        >
          {formatPoints(balance, config.locale)}
          <span className="ml-2 align-middle font-sans text-sm font-normal text-ivory/75">
            love points
          </span>
        </p>
        <p className="mt-2 max-w-md text-sm text-ivory/85">
          Every coin here was minted from a moment with you. Spend freely — love is the only
          currency in this world, and it never runs out.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ivory/75">
        <span>Starting fortune: {formatPoints(1_000_000, config.locale)} pts</span>
        {redeemed > 0 && <span>Redeemed: {formatPoints(redeemed, config.locale)} pts</span>}
        {shopped > 0 && <span>Boutique finds: {formatPoints(shopped, config.locale)} pts</span>}
        <Button
          variant="champagne"
          size="sm"
          className="ml-auto"
          onClick={() => setWithdrawOpen(true)}
        >
          <Landmark className="h-4 w-4" aria-hidden />
          Send coins to my Future Fund
        </Button>
      </div>

      <TransferDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        direction="bank-to-fund"
        max={balance}
        onConfirm={(amount) => {
          if (transferBankToFund(amount)) {
            showToast("Coins are on their way home to your Future Fund. ✨");
          }
        }}
      />
    </section>
  );
}

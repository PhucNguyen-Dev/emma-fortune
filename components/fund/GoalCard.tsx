"use client";

import { useState } from "react";
import { PartyPopper, PiggyBank, Send } from "lucide-react";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Confetti } from "@/components/ui/confetti";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TransferDialog } from "@/components/bank/TransferDialog";
import { useAppState } from "@/lib/state/AppStateContext";
import { computeFundSummary, fundEncouragement } from "@/lib/utils/fund";
import { fundAvailableToTransfer, fundMovedToBank } from "@/lib/utils/bank";
import { formatCurrency, formatDay, formatPercent } from "@/lib/formatting/format";

export function GoalCard() {
  const { state, patchPreferences, transferFundToBank, showToast } = useAppState();
  const { config } = state;
  const summary = computeFundSummary(state.contributions, config.fund.targetAmount);
  const available = fundAvailableToTransfer(state.contributions, state.transactions);
  const moved = fundMovedToBank(state.transactions);
  const celebrated = state.preferences.fundGoalReached === true;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);

  function markReached() {
    patchPreferences({ fundGoalReached: true });
    setConfirmOpen(false);
    setConfetti(true);
    showToast("Your dream has bloomed. Honestly earned. 🎉");
    window.setTimeout(() => setConfetti(false), 4500);
  }

  function handleTransferToBank(amount: number) {
    if (transferFundToBank(amount)) {
      showToast("Your coins are fluttering to the Birthday Bank. 🪙");
    }
  }

  return (
    <Card className="overflow-hidden p-0" aria-label="Fund goal">
      <Confetti active={confetti} />
      <div className="border-b border-plum/10 bg-gradient-to-br from-blush/70 via-white/40 to-transparent px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold text-plum break-words">
              {config.fund.name}
            </h2>
            <p className="mt-1 text-sm text-muted break-words">{config.fund.description}</p>
          </div>
          {celebrated && (
            <Badge tone="champagne">
              <PartyPopper className="h-3 w-3" aria-hidden /> Dream in bloom
            </Badge>
          )}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Saved</p>
            <p
              className="mt-1 font-display text-xl font-semibold text-plum break-words"
              data-testid="fund-saved"
            >
              {formatCurrency(summary.saved, config.currency, config.locale)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              Remaining
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-plum break-words">
              {formatCurrency(summary.remaining, config.currency, config.locale)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Target</p>
            <p className="mt-1 font-display text-xl font-semibold text-plum break-words">
              {formatCurrency(summary.target, config.currency, config.locale)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <ProgressBar value={summary.progress} label="Fund progress" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-plum">{formatPercent(summary.progress)}</span>
            {summary.surplus > 0 && (
              <span className="text-sm font-medium text-champagne-deep">
                Surplus: {formatCurrency(summary.surplus, config.currency, config.locale)} —
                abundance looks good on you
              </span>
            )}
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-blush/50 px-4 py-3 text-sm text-plum">
          {fundEncouragement(summary)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
          {config.fund.targetDate && (
            <p className="text-xs text-muted">
              A day to dream of: {formatDay(config.fund.targetDate, config.locale)}
            </p>
          )}
          {moved > 0 && (
            <p className="text-xs text-muted">
              Coins now living in your Birthday Bank:{" "}
              {formatCurrency(moved, config.currency, config.locale)}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="champagne" onClick={() => setTransferOpen(true)}>
            <Send className="h-4 w-4" aria-hidden />
            Send coins to my Birthday Bank
          </Button>
          {summary.reached && !celebrated && (
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              <PiggyBank className="h-4 w-4" aria-hidden />
              This dream came true
            </Button>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          This little fund is a promise jar, not a bank. Only true contributions fill it —
          and every single one counts. Its coins can fly to your Birthday Bank and back
          home again, whenever you like. They simply wear the clothes of {config.currency};
          their meaning never changes.
        </p>
      </div>

      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        direction="fund-to-bank"
        max={available}
        onConfirm={handleTransferToBank}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Mark this dream as come true?"
        body={`Recorded contributions currently total ${formatCurrency(summary.saved, config.currency, config.locale)}. You can celebrate — honestly.`}
        confirmLabel="Yes, we made it"
        onConfirm={markReached}
      />
    </Card>
  );
}

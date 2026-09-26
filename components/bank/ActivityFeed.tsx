"use client";

import { ArrowDownLeft, ArrowUpRight, Receipt, ShoppingBag, Smartphone, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatPoints } from "@/lib/formatting/format";
import { sortTransactionsNewestFirst } from "@/lib/utils/wishlist";
import { useAppState } from "@/lib/state/AppStateContext";
import type { BankTransaction } from "@/types";

function EntryIcon({ transaction }: { transaction: BankTransaction }) {
  const kind = transaction.kind ?? "redemption";
  if (kind === "purchase") return <ShoppingBag className="h-4 w-4" aria-hidden />;
  if (kind === "transfer") {
    return transaction.direction === "in" ? (
      <ArrowDownLeft className="h-4 w-4" aria-hidden />
    ) : (
      <ArrowUpRight className="h-4 w-4" aria-hidden />
    );
  }
  return <Ticket className="h-4 w-4" aria-hidden />;
}

export function ActivityFeed() {
  const { state } = useAppState();
  const { config, transactions } = state;
  const entries = sortTransactionsNewestFirst(transactions);

  return (
    <section aria-label="Activity feed" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-plum">Your story so far</h2>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted">
          <Smartphone className="h-3.5 w-3.5" aria-hidden />
          Kept in this little world — on this device only
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No activity yet"
          body="Your first little adventure will show up here."
        />
      ) : (
        <Card className="divide-y divide-plum/8 overflow-hidden p-0">
          {entries.map((transaction) => {
            const incoming = (transaction.direction ?? "out") === "in";
            return (
              <div
                key={transaction.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3.5 sm:px-5"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    incoming ? "bg-champagne/25 text-champagne-deep" : "bg-blush text-rose-deep"
                  }`}
                >
                  <EntryIcon transaction={transaction} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-plum">
                    {transaction.couponTitle}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDateTime(transaction.createdAt, config.locale)}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    incoming ? "text-champagne-deep" : "text-plum"
                  }`}
                >
                  {incoming ? "+" : "−"}
                  {formatPoints(transaction.fictionalPointCost, config.locale)} pts
                </p>
              </div>
            );
          })}
        </Card>
      )}
    </section>
  );
}

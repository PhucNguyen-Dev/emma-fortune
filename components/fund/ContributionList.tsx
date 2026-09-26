"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppState } from "@/lib/state/AppStateContext";
import { parsePositiveAmount } from "@/lib/utils/fund";
import { formatCurrency, formatDay } from "@/lib/formatting/format";
import type { FundContribution } from "@/types";

function EditContributionDialog({
  contribution,
  open,
  onOpenChange,
}: {
  contribution: FundContribution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updateContribution, showToast } = useAppState();
  const [amount, setAmount] = useState(String(contribution.amount));
  const [date, setDate] = useState(contribution.date);
  const [note, setNote] = useState(contribution.note ?? "");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- drafts must reset when the edit dialog opens over a possibly-updated store
      setAmount(String(contribution.amount));
      setDate(contribution.date);
      setNote(contribution.note ?? "");
      setError(undefined);
    }
  }, [open, contribution]);

  function save() {
    const parsed = parsePositiveAmount(amount, { label: "Amount" });
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Pick a valid date.");
      return;
    }
    updateContribution(contribution.id, {
      amount: parsed.amount,
      date,
      note: note.trim() || undefined,
    });
    showToast("Contribution updated.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit contribution</DialogTitle>
        <DialogDescription>
          Recorded amounts stay editable; totals are always recalculated.
        </DialogDescription>
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Amount" htmlFor="edit-contribution-amount" error={error}>
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            )}
          </Field>
          <Field label="Date" htmlFor="edit-contribution-date">
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            )}
          </Field>
          <Field label="Note (optional)" htmlFor="edit-contribution-note">
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="text"
                maxLength={200}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            )}
          </Field>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ContributionList() {
  const { state, deleteContribution, showToast } = useAppState();
  const { config } = state;
  const [editing, setEditing] = useState<FundContribution | null>(null);
  const [deleting, setDeleting] = useState<FundContribution | null>(null);

  const entries = [...state.contributions].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nothing recorded yet"
        body="Every real journey starts with the first real contribution. Nothing has been recorded yet."
      />
    );
  }

  return (
    <>
      <section aria-label="Contributions" className="flex flex-col gap-3">
        <h3 className="font-display text-lg font-semibold text-plum">
          Contributions ({entries.length})
        </h3>
        <Card className="divide-y divide-plum/8 p-0">
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-plum break-words">
                  {formatCurrency(entry.amount, config.currency, config.locale)}
                </p>
                <p className="text-xs text-muted">
                  {formatDay(entry.date, config.locale)}
                  {entry.note ? ` · ${entry.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit contribution of ${formatCurrency(entry.amount, config.currency, config.locale)} on ${entry.date}`}
                  onClick={() => setEditing(entry)}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete contribution of ${formatCurrency(entry.amount, config.currency, config.locale)} on ${entry.date}`}
                  onClick={() => setDeleting(entry)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </section>

      {editing && (
        <EditContributionDialog
          contribution={editing}
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this contribution?"
        body={
          deleting
            ? `${formatCurrency(deleting.amount, config.currency, config.locale)} on ${formatDay(deleting.date, config.locale)} will be removed and totals recalculated.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (!deleting) return;
          deleteContribution(deleting.id);
          showToast("Contribution deleted.", "info");
        }}
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { useAppState } from "@/lib/state/AppStateContext";
import { parsePositiveAmount } from "@/lib/utils/fund";
import { todayLocalISO } from "@/lib/formatting/format";

type FormError = { amount?: string; date?: string };

/**
 * Add-contribution form. Dates default to today (computed after mount to avoid
 * hydration drift), amounts are validated strictly before dispatching.
 */
export function ContributionForm() {
  const { addContribution, showToast } = useAppState();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormError>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- "today" must be computed on the client only to avoid SSR/local-date drift
    setDate(todayLocalISO());
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: FormError = {};
    const parsed = parsePositiveAmount(amount, { label: "Amount" });
    if (!parsed.ok) nextErrors.amount = parsed.error;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      nextErrors.date = "Pick a valid date.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !parsed.ok) return;

    addContribution({ amount: parsed.amount, date, note: note || undefined });
    setAmount("");
    setNote("");
    showToast("Contribution recorded. One honest step closer. 💛");
  }

  return (
    <Card className="p-5" aria-label="Add contribution">
      <h3 className="font-display text-lg font-semibold text-plum">Record a contribution</h3>
      <p className="mt-1 text-sm text-muted">
        Only true contributions belong here — each one is a real step toward the dream.
      </p>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
        <Field
          label="Amount"
          htmlFor="contribution-amount"
          error={errors.amount}
          hint="Positive numbers only."
        >
          {(ariaProps) => (
            <Input
              {...ariaProps}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 500000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          )}
        </Field>
        <Field label="Date" htmlFor="contribution-date" error={errors.date}>
          {(ariaProps) => (
            <Input
              {...ariaProps}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          )}
        </Field>
        <Field label="Note (optional)" htmlFor="contribution-note" className="sm:col-span-2">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              type="text"
              maxLength={200}
              placeholder="e.g. saved from skipping bubble tea"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          )}
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" size="lg">
            <Plus className="h-4 w-4" aria-hidden />
            Add contribution
          </Button>
        </div>
      </form>
    </Card>
  );
}

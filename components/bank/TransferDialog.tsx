"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { parsePositiveAmount } from "@/lib/utils/fund";

export type TransferDirection = "fund-to-bank" | "bank-to-fund";

export function TransferDialog({
  open,
  onOpenChange,
  direction,
  max,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: TransferDirection;
  max: number;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- dialog drafts must reset each time it opens
      setAmount("");
      setError(undefined);
    }
  }, [open]);

  const toBank = direction === "fund-to-bank";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parsePositiveAmount(amount, { label: "Amount" });
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (parsed.amount > max) {
      setError(toBank ? "That's more than your Future Fund can spare right now." : "That's more coins than your treasury holds.");
      return;
    }
    onConfirm(parsed.amount);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {toBank ? "Send coins to your Birthday Bank?" : "Send coins home to your Future Fund?"}
        </DialogTitle>
        <DialogDescription>
          {toBank
            ? "Coins from your Future Fund will flutter over to your Birthday Bank and become love points, ready to spend in the Boutique."
            : "Some coins will fly back home to your Future Fund, keeping your dream growing, safe and sound."}
        </DialogDescription>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-4" noValidate>
          <Field
            label="How many coins?"
            htmlFor="transfer-amount"
            error={error}
            hint={`Up to ${new Intl.NumberFormat("en-US").format(Math.floor(max))}.`}
          >
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            )}
          </Field>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Not now
            </Button>
            <Button type="submit">
              <ArrowLeftRight className="h-4 w-4" aria-hidden />
              {toBank ? "Fly to the bank" : "Fly home"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

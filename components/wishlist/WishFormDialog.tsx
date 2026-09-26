"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppState } from "@/lib/state/AppStateContext";
import { isSafeImageUrl } from "@/lib/utils/wishlist";
import { WISHLIST_CATEGORIES, type WishlistItem } from "@/types";

export type WishFormValues = {
  name: string;
  brand: string;
  category: string;
  description: string;
  estimatedPrice: string;
  currency: string;
  priority: WishlistItem["priority"];
  status: WishlistItem["status"];
  favorite: boolean;
  imageUrl: string;
};

export const emptyWishForm: WishFormValues = {
  name: "",
  brand: "",
  category: "Fashion",
  description: "",
  estimatedPrice: "",
  currency: "",
  priority: "medium",
  status: "dreaming",
  favorite: false,
  imageUrl: "",
};

type FormErrors = Partial<Record<"name" | "estimatedPrice" | "imageUrl", string>>;

export function WishFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: WishFormValues;
  onSubmit: (values: WishFormValues) => void;
}) {
  const { state } = useAppState();
  const { config } = state;
  const [values, setValues] = useState<WishFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- form drafts must reset when the dialog opens over a possibly-updated store
      setValues({ ...initial, currency: initial.currency || config.currency });
      setErrors({});
    }
  }, [open, initial, config.currency]);

  function set<K extends keyof WishFormValues>(key: K, value: WishFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (values.name.trim().length === 0) {
      nextErrors.name = "Give this wish a name.";
    }
    if (values.estimatedPrice.trim().length > 0) {
      const parsed = Number(values.estimatedPrice.replace(/,/g, "."));
      if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed < 0) {
        nextErrors.estimatedPrice = "Enter a valid non-negative number, or leave it empty.";
      }
    }
    if (values.imageUrl.trim().length > 0 && !isSafeImageUrl(values.imageUrl)) {
      nextErrors.imageUrl = "Use an http:// or https:// image link.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogTitle>{initial.name ? "Edit wish" : "Add to your wishlist"}</DialogTitle>
        <DialogDescription>
          Dreams, plans, and ideas — no checkout, no payment, just a list of things you love.
        </DialogDescription>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Name" htmlFor="wish-name" error={errors.name} className="sm:col-span-2">
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="text"
                maxLength={120}
                placeholder="e.g. Silk scarf in dusty rose"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
              />
            )}
          </Field>
          <Field label="Brand (optional)" htmlFor="wish-brand">
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="text"
                maxLength={80}
                placeholder="e.g. Chanel"
                value={values.brand}
                onChange={(event) => set("brand", event.target.value)}
              />
            )}
          </Field>
          <Field label="Category" htmlFor="wish-category">
            {(ariaProps) => (
              <Select
                {...ariaProps}
                value={values.category}
                onChange={(event) => set("category", event.target.value)}
              >
                {WISHLIST_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Priority" htmlFor="wish-priority">
            {(ariaProps) => (
              <Select
                {...ariaProps}
                value={values.priority}
                onChange={(event) =>
                  set("priority", event.target.value as WishlistItem["priority"])
                }
              >
                <option value="dream">Dream</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            )}
          </Field>
          <Field label="Description" htmlFor="wish-description" className="sm:col-span-2">
            {(ariaProps) => (
              <Textarea
                {...ariaProps}
                maxLength={600}
                placeholder="What makes it special?"
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
              />
            )}
          </Field>
          <Field
            label="Estimated price (optional)"
            htmlFor="wish-price"
            error={errors.estimatedPrice}
            hint="An estimate, never a quote."
          >
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="text"
                inputMode="decimal"
                placeholder="e.g. 1500000"
                value={values.estimatedPrice}
                onChange={(event) => set("estimatedPrice", event.target.value)}
              />
            )}
          </Field>
          <Field label="Currency" htmlFor="wish-currency">
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="text"
                maxLength={8}
                value={values.currency}
                onChange={(event) => set("currency", event.target.value.toUpperCase())}
              />
            )}
          </Field>
          <Field label="Status" htmlFor="wish-status">
            {(ariaProps) => (
              <Select
                {...ariaProps}
                value={values.status}
                onChange={(event) => set("status", event.target.value as WishlistItem["status"])}
              >
                <option value="dreaming">Dreaming</option>
                <option value="planned">Planned</option>
                <option value="gifted">Gifted</option>
              </Select>
            )}
          </Field>
          <Field
            label="Image URL (optional)"
            htmlFor="wish-image"
            error={errors.imageUrl}
            hint="http(s) links only."
          >
            {(ariaProps) => (
              <Input
                {...ariaProps}
                type="url"
                placeholder="https://…"
                value={values.imageUrl}
                onChange={(event) => set("imageUrl", event.target.value)}
              />
            )}
          </Field>
          <div className="sm:col-span-2">
            <Button
              type="button"
              variant={values.favorite ? "champagne" : "secondary"}
              onClick={() => set("favorite", !values.favorite)}
              aria-pressed={values.favorite}
            >
              <Heart
                className="h-4 w-4"
                aria-hidden
                fill={values.favorite ? "currentColor" : "none"}
              />
              {values.favorite ? "Favorited" : "Mark as favorite"}
            </Button>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial.name ? "Save changes" : "Add wish"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

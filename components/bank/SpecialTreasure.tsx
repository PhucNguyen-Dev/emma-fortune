"use client";

import { useState } from "react";
import { Gem, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { useAppState } from "@/lib/state/AppStateContext";
import { cn } from "@/lib/utils/cn";

/**
 * The rare treasure: a blurred card that can never be bought. It only wakes
 * up by chance (owner-configured rate, default 0.01%) when Emma buys things in
 * the Boutique. Until it is found, tapping it only makes it stir. Its title
 * and message are whatever the owner wrote in Settings.
 */
export function SpecialTreasure() {
  const { state, markSpecialRevealed, showToast } = useAppState();
  const { specialCard, config } = state;
  const [revealing, setRevealing] = useState(false);
  const [open, setOpen] = useState(false);
  const found = specialCard.found;

  function handleClick() {
    if (!found) {
      showToast("Something stirs inside… keep filling your bags, and it may wake. ✨", "info");
      return;
    }
    if (!revealing) {
      setRevealing(true);
      showToast("Something magical has appeared before you… 🌙", "info");
      window.setTimeout(() => setOpen(true), 900);
    }
  }

  function closeReveal() {
    setOpen(false);
    if (!specialCard.revealedAt) {
      markSpecialRevealed();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          found ? "A rare treasure has appeared — open it" : "A mysterious sleeping treasure"
        }
        className={cn(
          "group relative block w-full overflow-hidden rounded-2xl border p-5 text-left transition-all",
          found
            ? "border-champagne bg-gradient-to-br from-champagne/25 via-blush/40 to-ivory shadow-(--shadow-luxe)"
            : "border-plum/15 bg-white/50",
        )}
      >
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              found ? "bg-champagne text-plum-deep" : "bg-plum/10 text-plum/40",
            )}
          >
            <Gem className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "font-display text-lg font-semibold text-plum transition-all",
                found ? "" : "select-none blur-[5px]",
              )}
            >
              {found ? config.specialCard.title : "A treasure beyond price"}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {found
                ? "It woke up for you. Tap to open it."
                : "Something rare sleeps here. It cannot be bought — only found."}
            </p>
          </div>
          {found && (
            <Sparkles className="h-5 w-5 shrink-0 animate-sparkle text-champagne-deep" aria-hidden />
          )}
        </div>
        {found && !specialCard.revealedAt && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-sparkle bg-gradient-to-r from-transparent via-champagne/30 to-transparent"
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={config.specialCard.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/60 p-4 backdrop-blur-sm"
        >
          <Confetti active />
          <div className="w-full max-w-md animate-pop-in rounded-3xl border border-champagne/50 bg-gradient-to-br from-ivory via-blush/60 to-champagne/25 p-8 text-center shadow-(--shadow-luxe)">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plum text-champagne">
              <Gem className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-plum break-words">
              {config.specialCard.title}
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/85 break-words">
              {config.specialCard.message}
            </p>
            <Button className="mt-6" onClick={closeReveal}>
              Keep it forever
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

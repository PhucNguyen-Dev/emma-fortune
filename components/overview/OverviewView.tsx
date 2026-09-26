"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Gem,
  Heart,
  Landmark,
  Mail,
  PiggyBank,
  PartyPopper,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { BIRTHDAY_GREETINGS } from "@/lib/config/defaults";
import { useAppState } from "@/lib/state/AppStateContext";
import { currentLoveBalance } from "@/lib/utils/bank";
import { computeFundSummary } from "@/lib/utils/fund";
import { formatPoints, formatPercent, formatCurrency } from "@/lib/formatting/format";

const FEATURES: { href: string; icon: LucideIcon; title: string; line: string }[] = [
  {
    href: "/bank",
    icon: Landmark,
    title: "Birthday Bank",
    line: "Your balance is rich in love.",
  },
  {
    href: "/fund",
    icon: PiggyBank,
    title: "Future Fund",
    line: "A real goal, built one step at a time.",
  },
  {
    href: "/wishlist",
    icon: Gem,
    title: "Wish List",
    line: "The things you'd love to have.",
  },
];

/** Dismissible first-visit greeting. Never shown when motion is reduced. */
function IntroCelebration() {
  const { state, hydrated, patchPreferences } = useAppState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (state.preferences.introSeen) return;
    if (state.preferences.reducedMotion) {
      patchPreferences({ introSeen: true });
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      patchPreferences({ introSeen: true });
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot greeting can only be shown after storage hydration, never during SSR
    setVisible(true);
  }, [hydrated, state.preferences.introSeen, state.preferences.reducedMotion, patchPreferences]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    patchPreferences({ introSeen: true });
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Birthday greeting"
      className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/50 p-4 backdrop-blur-sm"
    >
      <Confetti active />
      <Card className="relative w-full max-w-md animate-pop-in p-8 text-center shadow-(--shadow-luxe)">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blush text-rose-deep">
          <PartyPopper className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold text-plum">
          Happy Birthday, {state.config.recipientName}!
        </h2>
        <p className="mt-3 text-sm text-muted">
          A little world built just for you is waiting — with treasures, promises, and
          dreams to fill.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={() => dismiss()}>
            Begin the experience
          </Button>
          <Button variant="ghost" onClick={() => dismiss()}>
            Not now
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function OverviewView() {
  const { state } = useAppState();
  const { config } = state;
  const balance = currentLoveBalance(state.transactions);
  const fund = computeFundSummary(state.contributions, config.fund.targetAmount);
  const letterPreview = config.letter.body.replace(/\s+/g, " ").slice(0, 150);

  // The greeting renders deterministically on the server, then one of the five
  // voices is chosen after mount — random per visit, never a hydration error.
  const [greeting, setGreeting] = useState(BIRTHDAY_GREETINGS[0]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the random voice can only be drawn on the client, after hydration, without breaking SSR
    setGreeting(BIRTHDAY_GREETINGS[Math.floor(Math.random() * BIRTHDAY_GREETINGS.length)]);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <IntroCelebration />

      <section className="relative overflow-hidden rounded-3xl border border-plum/10 bg-gradient-to-br from-blush via-ivory to-ivory-deep px-6 py-12 text-center sm:px-10 sm:py-16">
        <Sparkles
          className="pointer-events-none absolute left-6 top-6 h-5 w-5 animate-sparkle text-champagne"
          aria-hidden
        />
        <Sparkles
          className="pointer-events-none absolute bottom-8 right-8 h-4 w-4 animate-sparkle text-rose"
          aria-hidden
        />
        <p className="text-xs font-semibold tracking-[0.22em] text-champagne-deep uppercase">
          A private little fortune
        </p>
        <h1
          dir={greeting.dir}
          className="mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold leading-snug text-plum break-words [text-wrap:balance] sm:text-4xl"
        >
          {greeting.text}
        </h1>
        <p className="mt-3 text-xs font-medium tracking-wide text-muted">
          with love, in {greeting.lang}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
          Your taste is expensive. My love is unlimited. Let&apos;s see what&apos;s in your
          portfolio.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/bank"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-plum px-6 font-medium text-ivory shadow-sm transition-colors hover:bg-plum-deep sm:w-auto"
          >
            Open my fortune
          </Link>
          <Link
            href="/fund"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-plum/25 bg-white/70 px-6 font-medium text-plum transition-colors hover:bg-blush/60 sm:w-auto"
          >
            See my future fund
          </Link>
        </div>
      </section>

      <section aria-label="Your portfolio at a glance" className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted">
            <Landmark className="h-4 w-4" aria-hidden />
            <span className="text-xs font-semibold tracking-wide uppercase">Love Balance</span>
          </div>
          <p className="mt-2 truncate font-display text-2xl font-semibold text-plum">
            {formatPoints(balance, config.locale)}
            <span className="ml-1.5 text-xs font-normal text-muted">pts</span>
          </p>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted">
            <PiggyBank className="h-4 w-4" aria-hidden />
            <span className="text-xs font-semibold tracking-wide uppercase">Future Fund</span>
          </div>
          <p className="mt-2 truncate font-display text-2xl font-semibold text-plum">
            {formatPercent(fund.progress)}
            <span className="ml-1.5 text-xs font-normal text-muted">
              of {formatCurrency(fund.target, config.currency, config.locale)}
            </span>
          </p>
        </Card>
      </section>

      <section aria-label="Explore the three experiences">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group rounded-2xl focus-visible:outline-2"
              >
                <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-(--shadow-luxe)">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blush text-plum">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h2 className="mt-4 font-display text-lg font-semibold text-plum">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{feature.line}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-rose-deep">
                    Take me there →
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-label="Today's birthday note">
        <Link href="/letter" className="group block rounded-2xl focus-visible:outline-2">
          <Card className="paper-texture p-6 transition-shadow group-hover:shadow-(--shadow-luxe)">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-rose-deep" aria-hidden />
                <h2 className="font-display text-lg font-semibold text-plum">
                  Today&apos;s birthday note
                </h2>
              </div>
              <Badge tone="champagne">From {config.senderName}</Badge>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink/80">
              {letterPreview}
              {config.letter.body.length > 150 ? "…" : ""}
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-rose-deep">
              Read the whole letter →
            </span>
          </Card>
        </Link>
      </section>

      <section aria-label="A note from the maker" className="rounded-2xl border border-plum/10 bg-white/60 px-5 py-4">
        <p className="text-xs leading-relaxed text-muted">
          <Heart className="mr-1.5 inline h-3.5 w-3.5 text-rose-deep" aria-hidden />
          Every coin in this world was minted from love, and the Future Fund fills only
          with true, recorded steps. This whole world was handmade for you — and it lives
          right here, just between us.
        </p>
      </section>
    </div>
  );
}

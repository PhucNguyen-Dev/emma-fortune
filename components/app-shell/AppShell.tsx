"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Landmark,
  Mail,
  PiggyBank,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAppState } from "@/lib/state/AppStateContext";
import { daysUntilBirthday, isBirthdayToday, formatDay } from "@/lib/formatting/format";
import { MusicPlayer } from "@/components/app-shell/MusicPlayer";
import { cn } from "@/lib/utils/cn";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: Sparkles },
  { href: "/bank", label: "Birthday Bank", icon: Landmark },
  { href: "/fund", label: "Future Fund", icon: PiggyBank },
  { href: "/wishlist", label: "Wish List", icon: Heart },
  { href: "/letter", label: "My Letter", icon: Mail },
];

function BirthdayBadge() {
  const { state, hydrated } = useAppState();
  if (!hydrated) return null;
  const { birthdayDate } = state.config;
  if (!birthdayDate) return null;
  if (isBirthdayToday(birthdayDate)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-champagne px-2.5 py-1 text-[11px] font-semibold text-plum-deep">
        <Heart className="h-3 w-3" aria-hidden /> Today!
      </span>
    );
  }
  const days = daysUntilBirthday(birthdayDate);
  if (days !== null && days <= 30) {
    return (
      <span className="inline-flex items-center rounded-full bg-blush px-2.5 py-1 text-[11px] font-medium text-plum">
        {days === 0 ? "Today!" : `in ${days} day${days === 1 ? "" : "s"}`}
      </span>
    );
  }
  return (
    <span className="hidden items-center rounded-full bg-blush px-2.5 py-1 text-[11px] font-medium text-plum sm:inline-flex">
      {formatDay(birthdayDate, state.config.locale)}
    </span>
  );
}

export function AppShell({
  children,
  recoverySlot,
  toastSlot,
}: {
  children: ReactNode;
  recoverySlot: ReactNode;
  toastSlot: ReactNode;
}) {
  const pathname = usePathname();
  const { state } = useAppState();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-plum focus:px-4 focus:py-2 focus:text-ivory"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-plum/10 bg-ivory/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 rounded-lg"
            aria-label={`${state.config.appTitle} — home`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plum text-rose">
              <Heart className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span className="truncate font-display text-base font-semibold text-plum sm:text-lg">
              {state.config.appTitle}
            </span>
          </Link>
          <BirthdayBadge />
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-blush hover:text-plum",
                isActive("/settings") && "bg-blush text-plum",
              )}
            >
              <Settings className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>

        <nav aria-label="Primary" className="mx-auto hidden w-full max-w-5xl px-4 pb-3 sm:px-6 md:block">
          <ul className="flex flex-wrap items-center gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-plum text-ivory shadow-sm"
                        : "text-plum/80 hover:bg-blush hover:text-plum",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <div className="w-full">{recoverySlot}</div>

      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 sm:px-6 md:pb-12"
      >
        {children}
      </main>

      <footer className="mt-4 border-t border-plum/10 bg-ivory-deep/70 px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1.5 text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-plum">
            Made with <Heart className="h-3.5 w-3.5 text-rose-deep" aria-hidden /> — and a
            little music
          </p>
          <MusicPlayer />
          <p className="text-xs text-muted">
            This little world runs on love, not money — and every corner of it was made by
            hand, for one very special person.
          </p>
        </div>
      </footer>

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-plum/10 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                    active ? "text-plum" : "text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      active ? "bg-plum text-ivory" : "bg-transparent",
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <span className="max-w-full truncate">{item.label.split(" ").slice(-1)[0]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {toastSlot}
    </div>
  );
}

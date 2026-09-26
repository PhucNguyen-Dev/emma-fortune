import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow && (
          <span className="text-xs font-semibold tracking-[0.18em] text-champagne-deep uppercase">
            {eyebrow}
          </span>
        )}
        {badge}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-plum sm:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">{actions}</div>}
      </div>
      <div className="gold-divider" />
    </header>
  );
}

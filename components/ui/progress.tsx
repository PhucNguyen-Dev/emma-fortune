"use client";

import { cn } from "@/lib/utils/cn";

export function ProgressBar({
  value,
  label,
  className,
}: {
  /** 0..1 — values above 1 should be capped by the caller for display. */
  value: number;
  label: string;
  className?: string;
}) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-3 w-full overflow-hidden rounded-full bg-blush", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-rose to-champagne transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

import type { ComponentType, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center gap-3 border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush text-rose-deep">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      )}
      <p className="font-display text-lg font-semibold text-plum">{title}</p>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {action}
    </Card>
  );
}

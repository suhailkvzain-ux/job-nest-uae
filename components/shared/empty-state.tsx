import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Generic "nothing here" state — e.g. no jobs match the current filters.
 * Pass `action` (a Button/Link) to offer a way out, like "Clear filters".
 */
export function EmptyState({
  icon: Icon = SearchX,
  title = "No jobs found",
  description = "Try adjusting your filters or search terms to see more results.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-soft">
        <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SuccessStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Positive-outcome counterpart to `EmptyState`/`ErrorState`. */
export function SuccessState({
  title = "All set",
  description = "Your action completed successfully.",
  action,
  className,
}: SuccessStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-success/20 bg-success/5 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-soft">
        <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

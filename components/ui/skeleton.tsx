import { cn } from "@/lib/utils";

/**
 * Base skeleton block. Compose these into shape-specific loaders — see
 * `components/shared/loading-skeleton.tsx` for a job-card example.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton-shimmer rounded-lg", className)} {...props} />;
}

export { Skeleton };

import { cn } from "@/lib/utils";

interface AdPlaceholderProps {
  className?: string;
  label?: string;
  /** Matches common IAB ad unit sizes for accurate layout reservation. */
  size?: "banner" | "leaderboard" | "square" | "skyscraper";
}

const sizeMap: Record<NonNullable<AdPlaceholderProps["size"]>, string> = {
  banner: "h-[100px] w-full max-w-[468px]",
  leaderboard: "h-[90px] w-full max-w-[728px]",
  square: "h-[250px] w-full max-w-[300px]",
  skyscraper: "h-[600px] w-full max-w-[160px]",
};

/**
 * Reserves layout space for a future ad slot so ad integration later
 * doesn't shift page layout (avoids CLS). Swap the inner content for a real
 * ad component when a network is integrated — the outer sizing stays.
 */
export function AdPlaceholder({ className, label = "Advertisement", size = "banner" }: AdPlaceholderProps) {
  return (
    <div
      className={cn(
        "mx-auto flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground",
        sizeMap[size],
        className,
      )}
      role="complementary"
      aria-label={label}
    >
      {label}
    </div>
  );
}

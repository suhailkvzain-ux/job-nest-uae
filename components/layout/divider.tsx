import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Layout-level divider — thin wrapper around the `Separator` primitive
 * that also supports an optional centered label (e.g. "OR").
 */
export function Divider({
  label,
  className,
  orientation = "horizontal",
}: {
  label?: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  if (!label) {
    return <Separator orientation={orientation} className={className} />;
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Separator className="flex-1" />
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

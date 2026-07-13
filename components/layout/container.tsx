import { cn } from "@/lib/utils";

/**
 * Horizontal centering + max-width wrapper. Wrap page sections in this
 * instead of repeating `container mx-auto px-6` everywhere.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("container", className)}>{children}</div>;
}

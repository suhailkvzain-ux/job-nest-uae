import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column count at each breakpoint. Defaults to a common card-grid pattern. */
  cols?: { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: "sm" | "md" | "lg";
}

const gapMap = { sm: "gap-4", md: "gap-6", lg: "gap-8" };

const colsClass = (n: number | undefined, prefix: string) =>
  n ? `${prefix}grid-cols-${n}` : "";

/**
 * Responsive CSS grid. Used for job/company/category card grids across
 * the site — pass `cols` to override the default 1 → 2 → 3 ramp.
 */
export function Grid({
  cols = { base: 1, sm: 2, lg: 3 },
  gap = "md",
  className,
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        colsClass(cols.base, ""),
        colsClass(cols.sm, "sm:"),
        colsClass(cols.md, "md:"),
        colsClass(cols.lg, "lg:"),
        colsClass(cols.xl, "xl:"),
        gapMap[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

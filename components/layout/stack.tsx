import { cn } from "@/lib/utils";

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
}

const gapMap = { xs: "gap-1.5", sm: "gap-3", md: "gap-5", lg: "gap-8", xl: "gap-12" };
const alignMap = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
const justifyMap = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" };

/**
 * Flexbox layout primitive for one-dimensional stacking (vertical by
 * default). Prefer this over ad-hoc `flex flex-col gap-*` classes so
 * spacing stays on the shared scale.
 */
export function Stack({
  direction = "col",
  gap = "md",
  align,
  justify,
  wrap = false,
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapMap[gap],
        align && alignMap[align],
        justify && justifyMap[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

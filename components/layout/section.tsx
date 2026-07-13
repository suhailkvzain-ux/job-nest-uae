import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Removes default vertical padding when a section needs custom spacing. */
  spacing?: "default" | "compact" | "none";
}

const spacingMap = {
  default: "py-16 md:py-24",
  compact: "py-8 md:py-12",
  none: "",
};

/**
 * Vertical rhythm wrapper for full-width page sections (hero, featured
 * jobs, categories, etc.). Keeps spacing consistent across the site.
 * Forwards standard section attributes (`id`, `aria-label`, ...) so
 * pages can anchor-link to a section or label it for assistive tech.
 */
export function Section({ className, children, spacing = "default", ...props }: SectionProps) {
  return (
    <section className={cn(spacingMap[spacing], className)} {...props}>
      {children}
    </section>
  );
}

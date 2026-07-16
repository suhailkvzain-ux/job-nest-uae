import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Removes default vertical padding when a section needs custom spacing. */
  spacing?: "default" | "compact" | "none";
}

const spacingMap = {
  default: "py-10 md:py-20",
  compact: "py-6 md:py-10",
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

import { cn } from "@/lib/utils";

/**
 * Keeps its children pinned within the viewport while the page scrolls
 * past — used for the job detail page's ApplyCard / filter sidebar.
 * `topOffset` should match the sticky header's height.
 */
export function StickySidebar({
  children,
  className,
  topOffset = "6rem",
}: {
  children: React.ReactNode;
  className?: string;
  topOffset?: string;
}) {
  return (
    <div className={cn("self-start", className)} style={{ position: "sticky", top: topOffset }}>
      {children}
    </div>
  );
}

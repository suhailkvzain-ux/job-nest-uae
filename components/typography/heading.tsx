import * as React from "react";

import { cn } from "@/lib/utils";

type HeadingLevel = "display" | "h1" | "h2" | "h3" | "h4";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Visual scale — independent from the semantic `as` element, so a
   * visually small heading can still be an `<h2>` for document outline. */
  level?: HeadingLevel;
  /** Semantic element to render. Defaults to a sensible mapping of `level`. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  gradient?: boolean;
}

const levelClass: Record<HeadingLevel, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
};

const defaultElement: Record<HeadingLevel, HeadingProps["as"]> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
};

/**
 * Semantic + visual heading component covering the design system's type
 * scale (Display, H1–H4). Use `level` for the visual size and `as` when
 * the semantic heading level needs to differ (e.g. a visually-h2 heading
 * that's still an `<h3>` for correct document structure).
 */
export function Heading({ level = "h2", as, gradient = false, className, children, ...props }: HeadingProps) {
  const Component = as ?? defaultElement[level] ?? "h2";

  return (
    <Component
      className={cn(levelClass[level], "text-balance text-foreground", gradient && "text-gradient-brand", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

import * as React from "react";

import { cn } from "@/lib/utils";

type TextVariant = "body" | "caption" | "small";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  tone?: "primary" | "secondary";
  as?: "p" | "span" | "div";
}

const variantClass: Record<TextVariant, string> = {
  body: "text-body",
  caption: "text-caption",
  small: "text-small",
};

const toneClass = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
};

/** General-purpose paragraph/caption/small text component. */
export function Text({ variant = "body", tone = "primary", as: Component = "p", className, children, ...props }: TextProps) {
  return (
    <Component className={cn(variantClass[variant], toneClass[tone], className)} {...props}>
      {children}
    </Component>
  );
}

/** Semantic alias for `Text` at the body variant — reads better at call sites. */
export function Paragraph(props: Omit<TextProps, "variant">) {
  return <Text variant="body" {...props} />;
}

/** Semantic alias for `Text` at the caption variant. */
export function Caption(props: Omit<TextProps, "variant">) {
  return <Text variant="caption" {...props} />;
}

/** Form/meta label text — uppercase, tracked-out, muted. */
export function FieldLabel({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}
      {...props}
    >
      {children}
    </span>
  );
}

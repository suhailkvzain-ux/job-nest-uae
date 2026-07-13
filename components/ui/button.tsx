import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Base button primitive — Primary (default), Secondary, Ghost, Outline,
 * Link, and CTA (large gradient call-to-action) variants. `asChild`
 * (via Radix Slot) lets a `<Link>` render with button styles without an
 * extra wrapping element, e.g. `<Button asChild><Link href="/jobs">...`.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium " +
    "transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand-gradient text-primary-foreground shadow-soft hover:shadow-soft-lg hover:brightness-105",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-background hover:bg-muted",
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-brand-gradient font-semibold tracking-tight text-primary-foreground shadow-[0_1px_1px_rgba(255,255,255,0.35)_inset,0_10px_24px_-8px_hsl(var(--brand-start)/0.55)] ring-1 ring-white/15 hover:shadow-[0_1px_1px_rgba(255,255,255,0.4)_inset,0_16px_32px_-8px_hsl(var(--brand-start)/0.6)] hover:brightness-[1.07] active:scale-[0.97] active:brightness-95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-sm",
        lg: "h-13 px-8 text-base",
        cta: "h-14 px-10 text-base",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

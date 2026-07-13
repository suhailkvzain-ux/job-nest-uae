import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IconButtonProps extends Omit<ButtonProps, "size" | "children"> {
  icon: LucideIcon;
  /** Required — icon-only buttons must have an accessible name. */
  "aria-label": string;
  size?: "sm" | "default" | "lg";
}

const sizeMap = {
  sm: { button: "h-8 w-8", icon: "h-3.5 w-3.5" },
  default: { button: "h-10 w-10", icon: "h-4 w-4" },
  lg: { button: "h-12 w-12", icon: "h-5 w-5" },
};

/** Icon-only button — enforces an aria-label at the type level. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = "default", variant = "outline", className, ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      className={cn("rounded-full p-0", sizeMap[size].button, className)}
      {...props}
    >
      <Icon className={sizeMap[size].icon} />
    </Button>
  ),
);
IconButton.displayName = "IconButton";

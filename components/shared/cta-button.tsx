import { ArrowRight } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

/** Large call-to-action button — gradient, elevated, with a trailing arrow. */
export const CtaButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => (
    <Button ref={ref} variant="cta" size="cta" className={className} {...props}>
      {children}
      <ArrowRight className="h-4.5 w-4.5" />
    </Button>
  ),
);
CtaButton.displayName = "CtaButton";

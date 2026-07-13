import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-icon-sm w-icon-sm",
  md: "h-icon-md w-icon-md",
  lg: "h-icon-lg w-icon-lg",
  xl: "h-icon-xl w-icon-xl",
};

/** Simple animated loading indicator — use inside buttons or standalone. */
export function Spinner({
  size = "md",
  className,
  label = "Loading",
}: {
  size?: keyof typeof sizeMap;
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <Loader2 className={cn("animate-spin text-current", sizeMap[size], className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

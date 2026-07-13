import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Clears every active filter — shown only when at least one is applied. */
export function ResetFilters({ onReset, activeCount }: { onReset: () => void; activeCount: number }) {
  if (activeCount === 0) return null;

  return (
    <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
      <X className="h-3.5 w-3.5" /> Clear filters ({activeCount})
    </Button>
  );
}

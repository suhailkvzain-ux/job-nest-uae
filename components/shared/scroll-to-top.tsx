"use client";

import { ArrowUp } from "lucide-react";

import { IconButton } from "@/components/shared/icon-button";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { cn } from "@/lib/utils";

/** Floating "back to top" button — appears once the page has scrolled. */
export function ScrollToTop({ threshold = 480, className }: { threshold?: number; className?: string }) {
  const visible = useScrollPosition(threshold);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-sticky transition-all duration-slow",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        className,
      )}
    >
      <IconButton
        icon={ArrowUp}
        aria-label="Scroll to top"
        variant="secondary"
        className="glass shadow-soft-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileFilterDrawerProps {
  children: React.ReactNode;
  activeCount?: number;
  footer?: React.ReactNode;
}

/**
 * Slide-over filter drawer for mobile/tablet — the desktop sticky
 * sidebar's contents are passed in as `children` unchanged, so the two
 * surfaces never drift out of sync (`JobsFilterSidebar` renders this on
 * small screens and a plain sticky `<aside>` on `lg:`).
 */
export function MobileFilterDrawer({ children, activeCount = 0, footer }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-xs text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-modal lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Filter jobs"
              className={cn(
                "absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-card shadow-soft-xl",
              )}
            >
              <div className="flex items-center justify-between border-b border-border/60 p-4">
                <h2 className="text-base font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close filters">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">{children}</div>

              {footer && <div className="border-t border-border/60 p-4">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

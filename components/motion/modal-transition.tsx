"use client";

import { AnimatePresence, motion } from "framer-motion";

import { modalBackdropTransition, modalTransition } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

interface ModalTransitionProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Animated backdrop + panel wrapper for custom modal/dialog content.
 * Pairs well with Radix Dialog's unstyled primitive if one is added
 * later — for now this can wrap any panel content directly.
 */
export function ModalTransition({ open, onOpenChange, children, className }: ModalTransitionProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <motion.div
            variants={modalBackdropTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => onOpenChange?.(false)}
            aria-hidden="true"
          />
          <motion.div
            variants={modalTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            className={cn("relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-soft-xl", className)}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

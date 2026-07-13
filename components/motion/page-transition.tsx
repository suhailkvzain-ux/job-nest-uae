"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { pageTransition } from "@/lib/motion/variants";

/**
 * Wraps route content (e.g. in a layout) so navigating between pages
 * fades/slides rather than hard-cutting. Keyed on pathname so
 * AnimatePresence detects the route change.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} variants={pageTransition} initial="initial" animate="animate" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

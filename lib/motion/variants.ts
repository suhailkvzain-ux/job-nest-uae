import type { Variants } from "framer-motion";

/**
 * Reusable Framer Motion variants for the whole app. Import these into
 * `motion.div` (etc.) directly, or use the thin wrapper components in
 * `components/motion/` for the common case.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE_OUT_EXPO } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const slideInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

/** Parent variant — pairs with `staggerItem` on each child. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = fadeUp;

/** `whileHover`/`whileTap` presets — spread directly onto a `motion.*` element. */
export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2, ease: EASE_OUT_EXPO } },
  whileTap: { y: 0 },
};

export const cardHover = {
  whileHover: { y: -4, scale: 1.01, transition: { duration: 0.2, ease: EASE_OUT_EXPO } },
};

export const buttonHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

/** Full-page transition — wrap route content that should fade/slide between navigations. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE_OUT_EXPO } },
};

/** Modal/dialog enter-exit transition (backdrop + panel share the timing). */
export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15, ease: EASE_OUT_EXPO } },
};

export const modalBackdropTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

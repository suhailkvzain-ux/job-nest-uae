"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import {
  fadeIn,
  fadeUp,
  scaleIn,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideInUp,
  staggerContainer,
  staggerItem,
} from "@/lib/motion/variants";

type MotionWrapperProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "viewport"> & {
  /** Re-plays the animation every time it scrolls into view (vs. once). */
  repeat?: boolean;
};

function makeViewportWrapper(variants: typeof fadeIn, displayName: string) {
  function Wrapper({ repeat = false, ...props }: MotionWrapperProps) {
    return (
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: !repeat, amount: 0.2 }}
        {...props}
      />
    );
  }
  Wrapper.displayName = displayName;
  return Wrapper;
}

/** Fades in when scrolled into view. */
export const FadeIn = makeViewportWrapper(fadeIn, "FadeIn");
/** Fades in while translating up 16px — the default "reveal" animation. */
export const FadeUp = makeViewportWrapper(fadeUp, "FadeUp");
/** Scales up from 95% while fading in — good for cards/modals. */
export const ScaleIn = makeViewportWrapper(scaleIn, "ScaleIn");
/** Slides in from the left. */
export const SlideInLeft = makeViewportWrapper(slideInLeft, "SlideInLeft");
/** Slides in from the right. */
export const SlideInRight = makeViewportWrapper(slideInRight, "SlideInRight");
/** Slides in from below. */
export const SlideInUp = makeViewportWrapper(slideInUp, "SlideInUp");
/** Slides in from above. */
export const SlideInDown = makeViewportWrapper(slideInDown, "SlideInDown");

/**
 * Stagger container — wrap a list of `<StaggerItem>` children (e.g. a
 * card grid) so they animate in one after another instead of all at once.
 */
export function StaggerContainer({ repeat = false, ...props }: MotionWrapperProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, amount: 0.1 }}
      {...props}
    />
  );
}

/** A single item inside a `<StaggerContainer>` — inherits its parent's stagger timing. */
export function StaggerItem(props: Omit<HTMLMotionProps<"div">, "variants">) {
  return <motion.div variants={staggerItem} {...props} />;
}

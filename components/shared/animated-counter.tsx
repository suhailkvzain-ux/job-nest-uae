"use client";

import { animate, useInView, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { formatNumber } from "@/utils/format";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  /** Formats the interim/final number — defaults to locale thousand separators. */
  format?: (value: number) => string;
  suffix?: string;
}

/**
 * Counts up from 0 to `value` once scrolled into view (plays once).
 * Used by the homepage hero's live stats row.
 */
export function AnimatedCounter({
  value,
  duration = 1.4,
  className,
  format = formatNumber,
  suffix = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(format(0));

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplay(format(Math.round(latest)));
    });
    return unsubscribe;
  }, [motionValue, format]);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, motionValue, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

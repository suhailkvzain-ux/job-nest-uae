import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether the page is currently being scrolled up or down, with a
 * small threshold so tiny jitters near the top don't flip the value —
 * used by the header to hide on scroll-down and reappear on scroll-up.
 */
export function useScrollDirection(threshold = 8): "up" | "down" {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      if (Math.abs(diff) > threshold) {
        setDirection(diff > 0 ? "down" : "up");
        lastScrollY.current = currentScrollY;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return direction;
}

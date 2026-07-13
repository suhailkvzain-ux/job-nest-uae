import { useEffect, useState } from "react";

/**
 * Tracks vertical scroll position — used by the header to toggle its
 * glassmorphism / elevated state once the page has scrolled past the top.
 */
export function useScrollPosition(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}

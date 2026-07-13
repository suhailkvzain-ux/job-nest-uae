"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Light/dark toggle — a single icon button that flips between the two
 * (system preference is still respected on first load via
 * `ThemeProvider`'s `defaultTheme="system"`; clicking this pins an
 * explicit choice in localStorage from then on, which is `next-themes`'
 * default behavior).
 *
 * `next-themes` only knows the real theme after hydration (it reads
 * localStorage/`prefers-color-scheme` client-side), so `resolvedTheme`
 * is `undefined` during the initial server render. Rendering a
 * neutral, non-flipping icon until `mounted` is true avoids a
 * hydration mismatch and a flash of the wrong icon.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"
      }
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4.5 w-4.5" />
        ) : (
          <Moon className="h-4.5 w-4.5" />
        )
      ) : (
        <Moon className="h-4.5 w-4.5 opacity-0" />
      )}
    </button>
  );
}

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Thin wrapper around `next-themes`' provider — kept in its own
 * Client Component so the root layout (a Server Component) can render
 * it without itself becoming a client boundary. `attribute="class"`
 * matches `darkMode: ["class"]` in `tailwind.config.ts`: toggling adds/
 * removes `dark` on `<html>`, which is what every `dark:` utility and
 * the `.dark { ... }` token block in `globals.css` key off of.
 * `defaultTheme="system"` respects the visitor's OS preference on
 * first visit; `enableSystem` keeps that in sync if they never
 * explicitly choose light/dark themselves.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

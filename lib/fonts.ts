import { Inter } from "next/font/google";

/**
 * Primary typeface.
 *
 * Inter is used for its clean, neutral, high-legibility letterforms — the
 * closest widely-licensed match to the Apple-inspired system-font feel
 * requested for the design system, without pulling in a paid font.
 */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

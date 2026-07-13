import { Poppins } from "next/font/google";

/**
 * Primary typeface — Poppins, per direct request. Poppins ships as
 * static weight files (no variable-font axis), so every weight the
 * design system actually uses is listed explicitly: 300 (light) for
 * de-emphasized text, 400 (regular) for body copy, 500 (medium) for
 * labels/subheadings, 600 (semibold) and 700 (bold) for headings/CTAs.
 * Tailwind's `font-light`/`font-normal`/`font-medium`/`font-semibold`/
 * `font-bold` utilities map onto these loaded weights automatically —
 * nothing else in the codebase needs to change for weight classes to
 * render correctly.
 */
export const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

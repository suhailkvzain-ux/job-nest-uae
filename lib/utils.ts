import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `tailwind-merge`'s default config only recognizes Tailwind's built-in
 * `fontSize` scale (`text-xs`...`text-9xl`) as the "font-size" class
 * group. Our design system's type scale
 * (`tailwind.config.ts` -> `theme.extend.fontSize`) adds custom keys —
 * `text-display`, `text-h1`...`text-h4`, `text-body`, `text-caption`,
 * `text-small` — that twMerge doesn't recognize as font-size at all.
 * Left unregistered, twMerge falls back to treating them as unknown
 * `text-color` utilities, which means `cn("text-display", "text-foreground")`
 * silently drops `text-display` (both get bucketed into the same
 * "text color" conflict group, and the later class wins) — every
 * `<Heading>` in the app was rendering as unstyled 16px/400 body text
 * instead of its intended size+weight because of this exact collision.
 * Registering these keys under the real "font-size" group fixes the
 * conflict resolution without changing anything else about how classes
 * merge.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-h1",
        "text-h2",
        "text-h3",
        "text-h4",
        "text-body",
        "text-caption",
        "text-small",
      ],
    },
  },
});

/**
 * Merge Tailwind class names safely, resolving conflicting utility classes
 * (e.g. "p-2 p-4" -> "p-4"). Standard shadcn/ui helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

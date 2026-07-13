import type { Metadata } from "next";

export interface BuildTwitterCardParams {
  title: string;
  description: string;
  image: string;
  handle?: string;
}

/** Builds the `twitter` slice of a Next.js `Metadata` object — always `summary_large_image`, the card type that actually renders a preview image in-feed (the default `summary` card only shows a small thumbnail). */
export function buildTwitterCard({ title, description, image, handle }: BuildTwitterCardParams): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    ...(handle ? { site: handle, creator: handle } : {}),
  };
}

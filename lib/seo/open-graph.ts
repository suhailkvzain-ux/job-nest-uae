import type { Metadata } from "next";

export interface BuildOpenGraphParams {
  title: string;
  description: string;
  url: string;
  siteName: string;
  image: string;
  imageAlt?: string;
  type?: "website" | "article";
  locale?: string;
}

/** Builds the `openGraph` slice of a Next.js `Metadata` object — a pure function so any page can compose its own Open Graph data without going through the full `generateMetadata()` orchestrator if it needs to. */
export function buildOpenGraph({
  title,
  description,
  url,
  siteName,
  image,
  imageAlt,
  type = "website",
  locale = "en_AE",
}: BuildOpenGraphParams): Metadata["openGraph"] {
  return {
    title,
    description,
    url,
    siteName,
    images: [{ url: image, width: 1200, height: 630, alt: imageAlt ?? title }],
    locale,
    type,
  };
}

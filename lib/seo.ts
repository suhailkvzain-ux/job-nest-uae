import type { Metadata } from "next";

import { siteConfig } from "@/constants/site";

type ConstructMetadataParams = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

/**
 * Build a Next.js Metadata object with Job Nest UAE defaults, so every page
 * only has to override the fields that differ (title, description, path).
 *
 * Usage:
 *   export const metadata = constructMetadata({
 *     title: "Marketing Jobs in Dubai",
 *     path: "/jobs/marketing",
 *   });
 */
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  noIndex = false,
}: ConstructMetadataParams = {}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const fullTitle = title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
      locale: "en_AE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

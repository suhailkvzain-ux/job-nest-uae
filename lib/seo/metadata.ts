import type { Metadata } from "next";

import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { buildOpenGraph } from "@/lib/seo/open-graph";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { buildTwitterCard } from "@/lib/seo/twitter-card";

export interface GenerateMetadataParams {
  title?: string;
  description?: string;
  /** Extra keywords specific to this page — merged with (not replacing) the site-wide default keyword list from Settings/`siteConfig`. */
  keywords?: string[];
  path?: string;
  image?: string;
  noIndex?: boolean;
  /** Overrides just the Open Graph/Twitter title — falls back to `title` when omitted. */
  ogTitle?: string;
  /** Overrides just the Open Graph/Twitter description — falls back to `description` when omitted. */
  ogDescription?: string;
  type?: "website" | "article";
}

/**
 * The one function every page in this project calls to build its
 * `Metadata` — title, description, keywords, canonical URL, Open
 * Graph, Twitter/X Card, and robots directives, all in one object,
 * sourced from Phase 13's Settings module with `constants/site.ts` as
 * the fallback for anything not yet configured in `/admin/settings`.
 *
 * Named `generateMetadata()` per the Phase 14 spec's reusable-helpers
 * list — every page's own Next.js-required `export async function
 * generateMetadata()` calls into this one, aliasing the import (e.g.
 * `import { generateMetadata as buildMetadata } from "@/lib/seo"`)
 * since a single file can't export two functions with the same name.
 */
export async function generateMetadata({
  title,
  description,
  keywords = [],
  path = "/",
  image,
  noIndex = false,
  ogTitle,
  ogDescription,
  type = "website",
}: GenerateMetadataParams = {}): Promise<Metadata> {
  const defaults = await getSiteMetadataDefaults();

  const resolvedDescription = description ?? defaults.description;
  const fullTitle = title ? `${title} | ${defaults.siteName}` : defaults.siteName;
  const resolvedOgTitle = ogTitle ?? title ?? defaults.siteName;
  const resolvedOgDescription = ogDescription ?? resolvedDescription;
  const resolvedImage = image ?? defaults.ogImage;
  const url = buildCanonicalUrl(defaults.baseUrl, path);
  const mergedKeywords = Array.from(new Set([...keywords, ...defaults.keywords]));

  return {
    title: fullTitle,
    description: resolvedDescription,
    keywords: mergedKeywords,
    metadataBase: new URL(defaults.baseUrl),
    alternates: {
      canonical: url,
    },
    // Only set when Settings' Branding "Favicon" upload is configured —
    // otherwise omitted so Next's `/icon` file-convention route
    // (`app/icon.tsx`) applies automatically.
    ...(defaults.favicon ? { icons: { icon: defaults.favicon } } : {}),
    openGraph: buildOpenGraph({
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      url,
      siteName: defaults.siteName,
      image: resolvedImage,
      type,
    }),
    twitter: buildTwitterCard({
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      image: resolvedImage,
      handle: defaults.twitterHandle,
    }),
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

import { siteConfig } from "@/constants/site";
import { getAllSettings } from "@/services/settings.service";

/**
 * Resolves the site-wide defaults every SEO helper composes with —
 * bridging Phase 13's Settings module into the SEO system so an admin
 * changing "Website Name," "Default Meta Keywords," the canonical
 * domain, uploaded OG image, or social links in `/admin/settings`
 * immediately changes what every page's metadata/JSON-LD emits,
 * without a code change or redeploy. Falls back to the static
 * `constants/site.ts` values field-by-field for any setting an admin
 * hasn't configured yet (a fresh install with empty Settings rows still
 * renders complete, sensible metadata).
 *
 * Transitively cached: `getAllSettings()` is wrapped in `unstable_cache`
 * (see `services/settings.service.ts`), so calling this on every single
 * page's `generateMetadata()` is a cheap cache read, not a database
 * round trip per request.
 */
export interface SiteMetadataDefaults {
  siteName: string;
  tagline: string;
  description: string;
  keywords: string[];
  ogImage: string;
  logo: string;
  /** Set only when an admin has uploaded a custom favicon in Settings' Branding section — `null` lets the `/icon` file-convention route (`app/icon.tsx`) apply automatically instead. */
  favicon: string | null;
  baseUrl: string;
  twitterHandle: string | undefined;
  social: {
    linkedin: string;
    instagram: string;
    twitter: string;
  };
}

function extractTwitterHandle(url: string): string | undefined {
  const match = /(?:twitter|x)\.com\/([A-Za-z0-9_]+)/i.exec(url);
  return match ? `@${match[1]}` : undefined;
}

export async function getSiteMetadataDefaults(): Promise<SiteMetadataDefaults> {
  const settings = await getAllSettings();

  const siteName = settings.general.websiteName || siteConfig.name;
  const tagline = settings.general.tagline || siteConfig.description;
  const description = settings.general.description || siteConfig.description;

  const keywords = settings.seo.metaKeywords
    ? settings.seo.metaKeywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    : [...siteConfig.keywords];

  const baseUrl = (settings.seo.canonicalDomain || siteConfig.url).replace(/\/$/, "");
  // Falls back to the dynamically-rendered `/opengraph-image` route
  // (`app/opengraph-image.tsx`) rather than a static file — this
  // project ships no pre-made `public/` brand imagery, so a hardcoded
  // static path would 404 until an admin uploads one.
  const ogImage = settings.seo.ogImageUrl || `${baseUrl}/opengraph-image`;
  const logo = settings.general.logoUrl
    ? settings.general.logoUrl.startsWith("http")
      ? settings.general.logoUrl
      : `${baseUrl}${settings.general.logoUrl}`
    : `${baseUrl}/icon`;
  const favicon = settings.general.faviconUrl || null;

  const twitterUrl = settings.social.twitter || siteConfig.social.twitter;
  const twitterHandle = extractTwitterHandle(twitterUrl);

  return {
    siteName,
    tagline,
    description,
    keywords,
    ogImage,
    logo,
    favicon,
    baseUrl,
    twitterHandle,
    social: {
      linkedin: settings.social.linkedin || siteConfig.social.linkedin,
      instagram: settings.social.instagram || siteConfig.social.instagram,
      twitter: twitterUrl,
    },
  };
}

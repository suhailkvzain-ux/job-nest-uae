/**
 * Barrel for the SEO helper module — every page imports from `@/lib/seo`
 * rather than reaching into individual files, so the internal split
 * (canonical/open-graph/twitter-card/metadata/site-metadata) can change
 * without touching call sites.
 */
export { buildCanonicalUrl } from "@/lib/seo/canonical";
export { generateMetadata } from "@/lib/seo/metadata";
export { buildOpenGraph } from "@/lib/seo/open-graph";
export { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
export { buildTwitterCard } from "@/lib/seo/twitter-card";
export type { GenerateMetadataParams } from "@/lib/seo/metadata";
export type { BuildOpenGraphParams } from "@/lib/seo/open-graph";
export type { BuildTwitterCardParams } from "@/lib/seo/twitter-card";
export type { SiteMetadataDefaults } from "@/lib/seo/site-metadata";

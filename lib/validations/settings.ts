import { z } from "zod";

/**
 * Zod schemas for every Website Settings section — shapes mirror
 * `WebsiteSettings` in `lib/settings-registry.ts` field-for-field, so
 * a section's form values can be handed directly to
 * `updateSettingsSection()` once validated. Every URL/email field is
 * genuinely optional in the sense that an admin may leave it blank
 * (there's no requirement to have a Twitter account, say), so each
 * uses `optionalUrl()`/`optionalEmail()` below rather than Zod's
 * `.optional()` — these are always-present string form fields, just
 * sometimes empty, not absent keys.
 */

const optionalUrl = (label: string) =>
  z.union([z.literal(""), z.string().trim().url(`${label} must be a valid URL`)]);

const optionalEmail = (label: string) =>
  z.union([z.literal(""), z.string().trim().email(`${label} must be a valid email address`)]);

export const generalSettingsSchema = z.object({
  websiteName: z.string().trim().min(1, "Website name is required").max(150),
  tagline: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  logoUrl: z.union([z.literal(""), z.string().trim().url("Logo must be a valid URL")]).optional().default(""),
  faviconUrl: z.union([z.literal(""), z.string().trim().url("Favicon must be a valid URL")]).optional().default(""),
  defaultLanguage: z.string().trim().min(2).max(10),
  timeZone: z.string().trim().min(1, "Time zone is required").max(80),
  dateFormat: z.string().trim().min(1, "Date format is required").max(40),
  copyrightText: z.string().trim().max(300).optional().default(""),
});
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;

export const contactSettingsSchema = z.object({
  contactEmail: optionalEmail("Contact email"),
  supportEmail: optionalEmail("Support email"),
  phone: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  mapsLink: optionalUrl("Google Maps link"),
});
export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;

export const socialSettingsSchema = z.object({
  facebook: optionalUrl("Facebook URL"),
  instagram: optionalUrl("Instagram URL"),
  linkedin: optionalUrl("LinkedIn URL"),
  twitter: optionalUrl("X (Twitter) URL"),
  youtube: optionalUrl("YouTube URL"),
});
export type SocialSettingsInput = z.infer<typeof socialSettingsSchema>;

export const seoSettingsSchema = z.object({
  metaTitle: z.string().trim().max(70, "Meta title should be under 70 characters for search results").optional().default(""),
  metaDescription: z
    .string()
    .trim()
    .max(160, "Meta description should be under 160 characters for search results")
    .optional()
    .default(""),
  metaKeywords: z.string().trim().max(300).optional().default(""),
  ogImageUrl: z.union([z.literal(""), z.string().trim().url("OG image must be a valid URL")]).optional().default(""),
  canonicalDomain: z.union([z.literal(""), z.string().trim().url("Canonical domain must be a valid URL")]).optional().default(""),
});
export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;

/**
 * Google IDs are loosely pattern-checked (not strictly enforced as an
 * error) since Google occasionally changes ID prefixes/formats — a
 * too-strict regex here would reject a legitimate ID sooner than
 * Google itself would reject the integration. Empty is always valid
 * (the integration is simply off until filled in).
 */
export const googleSettingsSchema = z.object({
  gaMeasurementId: z
    .union([z.literal(""), z.string().trim().regex(/^(G|UA)-[A-Za-z0-9-]+$/, "Should look like G-XXXXXXX or UA-XXXXXXX-X")])
    .optional()
    .default(""),
  gtmId: z
    .union([z.literal(""), z.string().trim().regex(/^GTM-[A-Za-z0-9]+$/, "Should look like GTM-XXXXXXX")])
    .optional()
    .default(""),
  searchConsoleVerification: z.string().trim().max(200).optional().default(""),
  adsensePublisherId: z
    .union([z.literal(""), z.string().trim().regex(/^ca-pub-\d+$/, "Should look like ca-pub-XXXXXXXXXXXXXXXX")])
    .optional()
    .default(""),
});
export type GoogleSettingsInput = z.infer<typeof googleSettingsSchema>;

export const emailSettingsSchema = z.object({
  senderName: z.string().trim().min(1, "Sender name is required").max(100),
  senderEmail: optionalEmail("Sender email"),
  replyToEmail: optionalEmail("Reply-to email"),
});
export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;

export const behaviorSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  showFeaturedJobsOnHomepage: z.boolean(),
  jobsPerPage: z.coerce.number().int().min(1, "Must be at least 1").max(100, "Must be 100 or fewer"),
  enableBreadcrumbs: z.boolean(),
  enableRelatedJobs: z.boolean(),
  enableShareButtons: z.boolean(),
});
export type BehaviorSettingsInput = z.infer<typeof behaviorSettingsSchema>;

/** Branding upload validation — enforced server-side in the upload Server Action, mirroring how every other admin mutation never trusts client-side checks alone. */
export const ALLOWED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const MAX_LOGO_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FAVICON_UPLOAD_BYTES = 1 * 1024 * 1024; // 1 MB

export const brandingAssetKindEnum = z.enum(["logo", "favicon", "ogImage"]);
export type BrandingAssetKind = z.infer<typeof brandingAssetKindEnum>;

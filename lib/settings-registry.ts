/**
 * Single source of truth mapping every Website Settings field (grouped
 * by section, matching the Phase 13 spec's eight sections exactly) to
 * its underlying `Setting.key` (a dotted, namespaced string stored in
 * Postgres) and its `SettingType`. Everything else in this module —
 * `services/settings.service.ts`'s typed getters, the flat
 * key↔section-field mapping used when writing an update, and each
 * section's default value — is derived from this one registry, so
 * adding a new setting is one line here rather than five separate
 * edits across the service layer.
 *
 * `as const satisfies` gives each section object a literal type, and
 * `SectionValues<F>` (below) maps each field's declared `SettingType`
 * to its real TS type (`STRING` → `string`, `NUMBER` → `number`,
 * `BOOLEAN` → `boolean`), so e.g. `WebsiteSettings["behavior"]` is a
 * concrete `{ maintenanceMode: boolean; jobsPerPage: number; ... }`
 * shape — not a generic `Record<string, unknown>` — without hand-
 * writing that interface a second time.
 */

export type SettingFieldType = "STRING" | "NUMBER" | "BOOLEAN";

export interface SettingFieldDef {
  /** The literal value stored in `Setting.key` (`setting_key` column). */
  key: string;
  type: SettingFieldType;
  default: string | number | boolean;
}

type ValueOfType<T extends SettingFieldType> = T extends "BOOLEAN"
  ? boolean
  : T extends "NUMBER"
    ? number
    : string;

export type SectionValues<F extends Record<string, SettingFieldDef>> = {
  [K in keyof F]: ValueOfType<F[K]["type"]>;
};

const currentYear = new Date().getFullYear();

export const GENERAL_FIELDS = {
  websiteName: { key: "general.website_name", type: "STRING", default: "Job For UAE" },
  tagline: { key: "general.tagline", type: "STRING", default: "Find your next job across the UAE" },
  description: {
    key: "general.description",
    type: "STRING",
    default: "Job For UAE is a job discovery platform helping candidates find verified opportunities across the United Arab Emirates.",
  },
  logoUrl: { key: "general.logo_url", type: "STRING", default: "/brand/logo.svg" },
  faviconUrl: { key: "general.favicon_url", type: "STRING", default: "/brand/icon.svg" },
  defaultLanguage: { key: "general.default_language", type: "STRING", default: "en" },
  timeZone: { key: "general.time_zone", type: "STRING", default: "Asia/Dubai" },
  dateFormat: { key: "general.date_format", type: "STRING", default: "DD MMM YYYY" },
  copyrightText: {
    key: "general.copyright_text",
    type: "STRING",
    default: `© ${currentYear} Job For UAE. All rights reserved.`,
  },
} as const satisfies Record<string, SettingFieldDef>;

export const CONTACT_FIELDS = {
  contactEmail: { key: "contact.email", type: "STRING", default: "" },
  supportEmail: { key: "contact.support_email", type: "STRING", default: "" },
  phone: { key: "contact.phone", type: "STRING", default: "" },
  address: { key: "contact.address", type: "STRING", default: "" },
  mapsLink: { key: "contact.maps_link", type: "STRING", default: "" },
} as const satisfies Record<string, SettingFieldDef>;

export const SOCIAL_FIELDS = {
  facebook: { key: "social.facebook", type: "STRING", default: "" },
  instagram: { key: "social.instagram", type: "STRING", default: "" },
  linkedin: { key: "social.linkedin", type: "STRING", default: "" },
  twitter: { key: "social.twitter", type: "STRING", default: "" },
  youtube: { key: "social.youtube", type: "STRING", default: "" },
} as const satisfies Record<string, SettingFieldDef>;

export const SEO_FIELDS = {
  metaTitle: { key: "seo.meta_title", type: "STRING", default: "Job For UAE | Find Jobs in the United Arab Emirates" },
  metaDescription: {
    key: "seo.meta_description",
    type: "STRING",
    default: "Browse verified job openings across Dubai, Abu Dhabi, Sharjah, and the rest of the UAE. Apply directly with employers.",
  },
  metaKeywords: { key: "seo.meta_keywords", type: "STRING", default: "UAE jobs, Dubai jobs, Abu Dhabi jobs, careers UAE" },
  ogImageUrl: { key: "seo.og_image_url", type: "STRING", default: "" },
  canonicalDomain: { key: "seo.canonical_domain", type: "STRING", default: "" },
} as const satisfies Record<string, SettingFieldDef>;

export const GOOGLE_FIELDS = {
  gaMeasurementId: { key: "google.ga_measurement_id", type: "STRING", default: "" },
  gtmId: { key: "google.gtm_id", type: "STRING", default: "" },
  searchConsoleVerification: { key: "google.search_console_verification", type: "STRING", default: "" },
  adsensePublisherId: { key: "google.adsense_publisher_id", type: "STRING", default: "" },
} as const satisfies Record<string, SettingFieldDef>;

/**
 * Sender Name / Sender Email / Reply-To Email are the three fields the
 * spec asks for. "Prepare the structure for future SMTP integration"
 * is satisfied by the key/value store itself — adding
 * `email.smtp_host`/`email.smtp_port`/`email.smtp_username`/
 * `email.smtp_password` later is a new registry entry, not a schema
 * migration — rather than building unused SMTP fields into the UI now
 * (this phase explicitly doesn't wire an SMTP send path yet).
 */
export const EMAIL_FIELDS = {
  senderName: { key: "email.sender_name", type: "STRING", default: "Job For UAE" },
  senderEmail: { key: "email.sender_email", type: "STRING", default: "" },
  replyToEmail: { key: "email.reply_to_email", type: "STRING", default: "" },
} as const satisfies Record<string, SettingFieldDef>;

export const BEHAVIOR_FIELDS = {
  maintenanceMode: { key: "behavior.maintenance_mode", type: "BOOLEAN", default: false },
  showFeaturedJobsOnHomepage: { key: "behavior.show_featured_jobs_home", type: "BOOLEAN", default: true },
  jobsPerPage: { key: "behavior.jobs_per_page", type: "NUMBER", default: 12 },
  enableBreadcrumbs: { key: "behavior.enable_breadcrumbs", type: "BOOLEAN", default: true },
  enableRelatedJobs: { key: "behavior.enable_related_jobs", type: "BOOLEAN", default: true },
  enableShareButtons: { key: "behavior.enable_share_buttons", type: "BOOLEAN", default: true },
} as const satisfies Record<string, SettingFieldDef>;

export type GeneralSettings = SectionValues<typeof GENERAL_FIELDS>;
export type ContactSettings = SectionValues<typeof CONTACT_FIELDS>;
export type SocialSettings = SectionValues<typeof SOCIAL_FIELDS>;
export type SeoSettings = SectionValues<typeof SEO_FIELDS>;
export type GoogleSettings = SectionValues<typeof GOOGLE_FIELDS>;
export type EmailSettings = SectionValues<typeof EMAIL_FIELDS>;
export type BehaviorSettings = SectionValues<typeof BEHAVIOR_FIELDS>;

/**
 * Branding (Logo / Favicon / Default OG Image uploads) deliberately
 * has no fields of its own here — the spec's Branding section uploads
 * the exact same three assets General Settings' "Website Logo Upload"/
 * "Favicon Upload" and SEO Settings' "Default Open Graph Image"
 * already reference. Storing them under a second set of keys would
 * let a logo uploaded via "Branding" and the "General" tab silently
 * disagree. The Branding UI section uploads directly into
 * `general.logoUrl`, `general.faviconUrl`, and `seo.ogImageUrl`.
 */
export const SECTION_REGISTRY = {
  general: GENERAL_FIELDS,
  contact: CONTACT_FIELDS,
  social: SOCIAL_FIELDS,
  seo: SEO_FIELDS,
  google: GOOGLE_FIELDS,
  email: EMAIL_FIELDS,
  behavior: BEHAVIOR_FIELDS,
} as const;

export type SectionKey = keyof typeof SECTION_REGISTRY;

export interface WebsiteSettings {
  general: GeneralSettings;
  contact: ContactSettings;
  social: SocialSettings;
  seo: SeoSettings;
  google: GoogleSettings;
  email: EmailSettings;
  behavior: BehaviorSettings;
}

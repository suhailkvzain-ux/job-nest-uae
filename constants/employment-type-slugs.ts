import type { EmploymentType } from "@prisma/client";

/**
 * URL-friendly slugs for `EmploymentType`, e.g. `?type=full-time` instead
 * of the raw enum value `FULL_TIME`. Used by the /jobs page's URL
 * parsing/building utilities (`lib/jobs-url.ts`) so query strings stay
 * human-readable and match the design spec's example URLs exactly.
 */
export const EMPLOYMENT_TYPE_TO_SLUG: Record<EmploymentType, string> = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  TEMPORARY: "temporary",
  INTERNSHIP: "internship",
  REMOTE: "remote",
  HYBRID: "hybrid",
  FREELANCE: "freelance",
};

export const SLUG_TO_EMPLOYMENT_TYPE: Record<string, EmploymentType> = Object.fromEntries(
  Object.entries(EMPLOYMENT_TYPE_TO_SLUG).map(([type, slug]) => [slug, type as EmploymentType]),
);

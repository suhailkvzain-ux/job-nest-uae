import { z } from "zod";

import { slugify } from "@/utils/format";

const baseCompanyFields = {
  name: z.string().trim().min(2, "Company name must be at least 2 characters").max(150),
  website: z.string().trim().url("Must be a valid URL").optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
};

export const createCompanySchema = z.object({
  ...baseCompanyFields,
  // slug is optional on input — the service layer derives it from `name`
  // via slugify() when omitted, but an explicit override is allowed.
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = z.object(baseCompanyFields).partial();

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

/** Derives a URL-safe slug from a company name when one isn't supplied. */
export function resolveCompanySlug(input: { name: string; slug?: string }): string {
  return input.slug ?? slugify(input.name);
}

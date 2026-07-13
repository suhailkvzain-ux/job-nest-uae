import { z } from "zod";

import { slugify } from "@/utils/format";

const baseLocationFields = {
  name: z.string().trim().min(2, "Location name must be at least 2 characters").max(100),
  description: z.string().trim().max(2000).optional().nullable(),
};

export const createLocationSchema = z.object({
  ...baseLocationFields,
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = z.object(baseLocationFields).partial();

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export function resolveLocationSlug(input: { name: string; slug?: string }): string {
  return input.slug ?? slugify(input.name);
}

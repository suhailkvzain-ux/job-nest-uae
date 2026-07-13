import { z } from "zod";

import { slugify } from "@/utils/format";

const baseCategoryFields = {
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(100),
  description: z.string().trim().max(2000).optional().nullable(),
};

export const createCategorySchema = z.object({
  ...baseCategoryFields,
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object(baseCategoryFields).partial();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export function resolveCategorySlug(input: { name: string; slug?: string }): string {
  return input.slug ?? slugify(input.name);
}

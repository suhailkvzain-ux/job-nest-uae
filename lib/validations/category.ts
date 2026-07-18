import { z } from "zod";

import { CATEGORY_ICON_KEYS, DEFAULT_CATEGORY_ICON } from "@/lib/icons/category-icons";
import { slugify } from "@/utils/format";

const baseCategoryFields = {
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(100),
  description: z.string().trim().max(2000).optional().nullable(),
  icon: z.enum(CATEGORY_ICON_KEYS as [string, ...string[]]).default(DEFAULT_CATEGORY_ICON),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  popular: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
  seoTitle: z.string().trim().max(60).optional().nullable(),
  seoDescription: z.string().trim().max(160).optional().nullable(),
  seoKeywords: z.string().trim().max(200).optional().nullable(),
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

"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAndRateLimit, flattenZodErrors } from "@/lib/admin-action-helpers";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validations/category";
import {
  createCategory,
  deleteCategory,
  getCategoryTotalJobCount,
  updateCategory,
} from "@/services/categories.service";

/** Server Actions for `/admin/categories` — see `admin-companies.actions.ts` for the shared Master Data Management rationale (hard delete, job-count guard). */

export interface CategoryActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  categoryId?: string;
  slug?: string;
}

function revalidateCategoryPaths(slug?: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  if (slug) revalidatePath(`/categories/${slug}`);
}

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<CategoryActionResult> {
  try {
    await assertAdminAndRateLimit("create-category");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    const category = await createCategory(parsed.data);
    revalidateCategoryPaths(category.slug);
    return { success: true, categoryId: category.id, slug: category.slug };
  } catch {
    return { success: false, error: "Could not create the category. Please try again." };
  }
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput,
): Promise<CategoryActionResult> {
  try {
    await assertAdminAndRateLimit("update-category");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    const category = await updateCategory(id, parsed.data);
    revalidateCategoryPaths(category.slug);
    return { success: true, categoryId: category.id, slug: category.slug };
  } catch {
    return { success: false, error: "Could not update the category. Please try again." };
  }
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  try {
    await assertAdminAndRateLimit("delete-category");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const jobCount = await getCategoryTotalJobCount(id);
    if (jobCount > 0) {
      return {
        success: false,
        error:
          "This category still has active jobs. Remove or reassign them before deleting the category.",
      };
    }

    const category = await deleteCategory(id);
    revalidateCategoryPaths(category.slug);
    return { success: true, categoryId: category.id };
  } catch {
    return { success: false, error: "Could not delete the category. Please try again." };
  }
}

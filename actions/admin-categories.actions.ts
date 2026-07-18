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
  duplicateCategory,
  getCategoryTotalJobCount,
  moveCategoryOrder,
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
  revalidatePath("/");
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

/** Clones a category as an inactive "Copy of {Name}" draft — spec's Duplicate action. */
export async function duplicateCategoryAction(id: string): Promise<CategoryActionResult> {
  try {
    await assertAdminAndRateLimit("duplicate-category");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const category = await duplicateCategory(id);
    revalidateCategoryPaths();
    return { success: true, categoryId: category.id, slug: category.slug };
  } catch {
    return { success: false, error: "Could not duplicate the category. Please try again." };
  }
}

/** Nudges a category's display order up or down one position — spec's Move Up/Move Down card actions. */
export async function moveCategoryAction(
  id: string,
  direction: "up" | "down",
): Promise<CategoryActionResult> {
  try {
    await assertAdminAndRateLimit("move-category");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    await moveCategoryOrder(id, direction);
    revalidateCategoryPaths();
    return { success: true };
  } catch {
    return { success: false, error: "Could not reorder categories. Please try again." };
  }
}

/** Quick toggle for the card's Feature/Unfeature and Hide/Show actions — a partial update without opening the full edit form. */
export async function toggleCategoryFieldAction(
  id: string,
  field: "featured" | "isActive",
  value: boolean,
): Promise<CategoryActionResult> {
  try {
    await assertAdminAndRateLimit("toggle-category-field");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const category = await updateCategory(id, { [field]: value });
    revalidateCategoryPaths(category.slug);
    return { success: true, categoryId: category.id };
  } catch {
    return { success: false, error: "Could not update the category. Please try again." };
  }
}

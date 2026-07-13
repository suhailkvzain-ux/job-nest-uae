"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAndRateLimit, flattenZodErrors } from "@/lib/admin-action-helpers";
import {
  createAdvertisementSchema,
  updateAdvertisementSchema,
  type CreateAdvertisementInput,
  type UpdateAdvertisementInput,
} from "@/lib/validations/advertisement";
import {
  createAdvertisement,
  deleteAdvertisement,
  duplicateAdvertisement,
  setAdvertisementStatus,
  updateAdvertisement,
} from "@/services/advertisements.service";

/**
 * Server Actions for `/admin/advertisements`. Advertisements are
 * reference data like Companies/Categories/Locations (real delete, no
 * `deletedAt`), so this follows that same shape rather than Job's
 * soft-delete/publish-workflow one.
 */

export interface AdvertisementActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  advertisementId?: string;
}

/**
 * Every ad placement lives on public pages across the entire site
 * (home, jobs listing, single job, company/category/location), so a
 * mutation revalidates every top-level index route immediately; the
 * dynamic detail pages (`/jobs/[slug]`, `/companies/[slug]`, ...) pick
 * up the change within their existing 60s ISR window, same as any other
 * content change on those pages — an ad swap doesn't need to be more
 * instant than a job edit is.
 */
function revalidateAdPaths() {
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/companies");
  revalidatePath("/categories");
  revalidatePath("/locations");
  revalidatePath("/admin/advertisements");
}

export async function createAdvertisementAction(input: CreateAdvertisementInput): Promise<AdvertisementActionResult> {
  try {
    await assertAdminAndRateLimit("create-advertisement");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = createAdvertisementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  try {
    const ad = await createAdvertisement(parsed.data);
    revalidateAdPaths();
    return { success: true, advertisementId: ad.id };
  } catch {
    return { success: false, error: "Could not create the advertisement. Please try again." };
  }
}

export async function updateAdvertisementAction(
  id: string,
  input: UpdateAdvertisementInput,
): Promise<AdvertisementActionResult> {
  try {
    await assertAdminAndRateLimit("update-advertisement");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = updateAdvertisementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  try {
    const ad = await updateAdvertisement(id, parsed.data);
    revalidateAdPaths();
    return { success: true, advertisementId: ad.id };
  } catch {
    return { success: false, error: "Could not update the advertisement. Please try again." };
  }
}

export async function deleteAdvertisementAction(id: string): Promise<AdvertisementActionResult> {
  try {
    await assertAdminAndRateLimit("delete-advertisement");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const ad = await deleteAdvertisement(id);
    revalidateAdPaths();
    return { success: true, advertisementId: ad.id };
  } catch {
    return { success: false, error: "Could not delete the advertisement. Please try again." };
  }
}

export async function duplicateAdvertisementAction(id: string): Promise<AdvertisementActionResult> {
  try {
    await assertAdminAndRateLimit("duplicate-advertisement");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const ad = await duplicateAdvertisement(id);
    revalidateAdPaths();
    return { success: true, advertisementId: ad.id };
  } catch {
    return { success: false, error: "Could not duplicate the advertisement. Please try again." };
  }
}

export async function enableAdvertisementAction(id: string): Promise<AdvertisementActionResult> {
  try {
    await assertAdminAndRateLimit("enable-advertisement");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const ad = await setAdvertisementStatus(id, "ACTIVE");
    revalidateAdPaths();
    return { success: true, advertisementId: ad.id };
  } catch {
    return { success: false, error: "Could not enable the advertisement. Please try again." };
  }
}

export async function disableAdvertisementAction(id: string): Promise<AdvertisementActionResult> {
  try {
    await assertAdminAndRateLimit("disable-advertisement");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const ad = await setAdvertisementStatus(id, "DISABLED");
    revalidateAdPaths();
    return { success: true, advertisementId: ad.id };
  } catch {
    return { success: false, error: "Could not disable the advertisement. Please try again." };
  }
}

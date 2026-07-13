"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAndRateLimit, flattenZodErrors } from "@/lib/admin-action-helpers";
import { createLocationSchema, updateLocationSchema, type CreateLocationInput, type UpdateLocationInput } from "@/lib/validations/location";
import {
  createLocation,
  deleteLocation,
  getLocationTotalJobCount,
  updateLocation,
} from "@/services/locations.service";

/** Server Actions for `/admin/locations` — see `admin-companies.actions.ts` for the shared Master Data Management rationale (hard delete, job-count guard). */

export interface LocationActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  locationId?: string;
  slug?: string;
}

function revalidateLocationPaths(slug?: string) {
  revalidatePath("/admin/locations");
  revalidatePath("/locations");
  if (slug) revalidatePath(`/locations/${slug}`);
}

export async function createLocationAction(input: CreateLocationInput): Promise<LocationActionResult> {
  try {
    await assertAdminAndRateLimit("create-location");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = createLocationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  try {
    const location = await createLocation(parsed.data);
    revalidateLocationPaths(location.slug);
    return { success: true, locationId: location.id, slug: location.slug };
  } catch {
    return { success: false, error: "Could not create the location. Please try again." };
  }
}

export async function updateLocationAction(id: string, input: UpdateLocationInput): Promise<LocationActionResult> {
  try {
    await assertAdminAndRateLimit("update-location");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = updateLocationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  try {
    const location = await updateLocation(id, parsed.data);
    revalidateLocationPaths(location.slug);
    return { success: true, locationId: location.id, slug: location.slug };
  } catch {
    return { success: false, error: "Could not update the location. Please try again." };
  }
}

export async function deleteLocationAction(id: string): Promise<LocationActionResult> {
  try {
    await assertAdminAndRateLimit("delete-location");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const jobCount = await getLocationTotalJobCount(id);
    if (jobCount > 0) {
      return {
        success: false,
        error: "This location still has jobs referencing it (including deleted ones). Remove or reassign them before deleting the location.",
      };
    }

    const location = await deleteLocation(id);
    revalidateLocationPaths(location.slug);
    return { success: true, locationId: location.id };
  } catch {
    return { success: false, error: "Could not delete the location. Please try again." };
  }
}

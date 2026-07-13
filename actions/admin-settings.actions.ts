"use server";

import { revalidatePath, revalidateTag } from "next/cache";

// Branding uploads do real work per request (signature-check the bytes,
// resize with sharp, upload to Supabase Storage) — comfortably fast on
// a warm connection, but the platform's default server-action time
// budget can be tight for a large source image on a cold/slow
// connection. Raising it here (rather than leaving the platform
// default) is what actually fixes an upload that used to time out
// mid-request with no error surfaced to the admin — see
// `uploadBrandingAssetAction` below and the client-side timeout in
// `BrandingUploadField` for the other half of that fix.
export const maxDuration = 30;

import { assertAdminAndRateLimit, flattenZodErrors } from "@/lib/admin-action-helpers";
import { uploadBrandingAsset } from "@/lib/branding-storage";
import { matchesFileSignature } from "@/lib/file-signature";
import { optimizeBrandingImage } from "@/lib/image-optimize";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_FAVICON_UPLOAD_BYTES,
  MAX_LOGO_UPLOAD_BYTES,
  behaviorSettingsSchema,
  brandingAssetKindEnum,
  contactSettingsSchema,
  emailSettingsSchema,
  generalSettingsSchema,
  googleSettingsSchema,
  seoSettingsSchema,
  socialSettingsSchema,
  type BehaviorSettingsInput,
  type ContactSettingsInput,
  type EmailSettingsInput,
  type GeneralSettingsInput,
  type GoogleSettingsInput,
  type SeoSettingsInput,
  type SocialSettingsInput,
} from "@/lib/validations/settings";
import { updateSettingsSection } from "@/services/settings.service";

/**
 * Server Actions for `/admin/settings` — one action per section,
 * mirroring how the UI saves each section's form independently rather
 * than one giant "Save All" button. All eight sections share the same
 * shape: `assertAdminAndRateLimit()` → Zod `safeParse` →
 * `updateSettingsSection()` → invalidate the cached read → return a
 * flat `SettingsActionResult`.
 */

export interface SettingsActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function invalidateSettingsCache() {
  revalidateTag("settings");
  revalidatePath("/admin/settings");
}

export async function updateGeneralSettingsAction(input: GeneralSettingsInput): Promise<SettingsActionResult> {
  try {
    await assertAdminAndRateLimit("update-settings-general");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = generalSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZodErrors(parsed.error) };

  await updateSettingsSection("general", parsed.data);
  invalidateSettingsCache();
  return { success: true };
}

export async function updateContactSettingsAction(input: ContactSettingsInput): Promise<SettingsActionResult> {
  try {
    await assertAdminAndRateLimit("update-settings-contact");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = contactSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZodErrors(parsed.error) };

  await updateSettingsSection("contact", parsed.data);
  invalidateSettingsCache();
  return { success: true };
}

export async function updateSocialSettingsAction(input: SocialSettingsInput): Promise<SettingsActionResult> {
  try {
    await assertAdminAndRateLimit("update-settings-social");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = socialSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZodErrors(parsed.error) };

  await updateSettingsSection("social", parsed.data);
  invalidateSettingsCache();
  return { success: true };
}

export async function updateSeoSettingsAction(input: SeoSettingsInput): Promise<SettingsActionResult> {
  try {
    await assertAdminAndRateLimit("update-settings-seo");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = seoSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZodErrors(parsed.error) };

  await updateSettingsSection("seo", parsed.data);
  invalidateSettingsCache();
  return { success: true };
}

export async function updateGoogleSettingsAction(input: GoogleSettingsInput): Promise<SettingsActionResult> {
  try {
    await assertAdminAndRateLimit("update-settings-google");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = googleSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZodErrors(parsed.error) };

  await updateSettingsSection("google", parsed.data);
  invalidateSettingsCache();
  return { success: true };
}

export async function updateEmailSettingsAction(input: EmailSettingsInput): Promise<SettingsActionResult> {
  try {
    await assertAdminAndRateLimit("update-settings-email");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = emailSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZodErrors(parsed.error) };

  await updateSettingsSection("email", parsed.data);
  invalidateSettingsCache();
  return { success: true };
}

export async function updateBehaviorSettingsAction(input: BehaviorSettingsInput): Promise<SettingsActionResult> {
  try {
    await assertAdminAndRateLimit("update-settings-behavior");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = behaviorSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZodErrors(parsed.error) };

  await updateSettingsSection("behavior", parsed.data);
  invalidateSettingsCache();
  return { success: true };
}

const ASSET_SETTING_TARGET = {
  logo: { section: "general", field: "logoUrl" },
  favicon: { section: "general", field: "faviconUrl" },
  ogImage: { section: "seo", field: "ogImageUrl" },
} as const;

export interface UploadBrandingAssetResult extends SettingsActionResult {
  url?: string;
}

/**
 * Handles all three Branding uploads (Logo, Favicon, Default OG Image)
 * through one action, keyed by `kind`. Validates the file server-side
 * (never trusts the browser's `accept` attribute alone — see
 * `ALLOWED_IMAGE_MIME_TYPES`/size caps in `lib/validations/settings.ts`),
 * optimizes it (`optimizeBrandingImage`), uploads the optimized result
 * to Supabase Storage, then writes the resulting public URL straight
 * into the matching setting (`general.logoUrl`, `general.faviconUrl`,
 * or `seo.ogImageUrl`) — a successful upload and a successful save are
 * the same action, not two separate steps an admin could leave
 * half-done.
 */
export async function uploadBrandingAssetAction(formData: FormData): Promise<UploadBrandingAssetResult> {
  try {
    await assertAdminAndRateLimit("upload-branding-asset", 10);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const kindResult = brandingAssetKindEnum.safeParse(formData.get("kind"));
  if (!kindResult.success) {
    return { success: false, error: "Invalid asset kind." };
  }
  const kind = kindResult.data;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file was provided." };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return { success: false, error: "Only PNG, JPEG, WebP, or SVG images are allowed." };
  }

  const maxBytes = kind === "favicon" ? MAX_FAVICON_UPLOAD_BYTES : MAX_LOGO_UPLOAD_BYTES;
  if (file.size > maxBytes) {
    return { success: false, error: `File is too large — max ${Math.round(maxBytes / (1024 * 1024))}MB.` };
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // `file.type` is just whatever the client's multipart request claims
  // — trivially spoofed by renaming an arbitrary file or crafting the
  // request directly, bypassing any `accept="image/*"` file-picker
  // restriction entirely. Independently verify the actual bytes match
  // the declared type (PNG/JPEG/WebP signatures, or a real `<svg>` root
  // for SVG) before this ever reaches `sharp` or gets stored — this is
  // what actually prevents an executable or arbitrary file disguised as
  // an image from being accepted, which the MIME-type check above
  // cannot do on its own.
  if (!matchesFileSignature(inputBuffer, file.type)) {
    return { success: false, error: "This file's content doesn't match its declared type. Please upload a real image file." };
  }

  try {
    const optimized = await optimizeBrandingImage(kind, inputBuffer, file.type);
    const path = `${kind}-${Date.now()}.${optimized.extension}`;
    const url = await uploadBrandingAsset(path, optimized.buffer, optimized.contentType);

    const target = ASSET_SETTING_TARGET[kind];
    await updateSettingsSection(target.section, { [target.field]: url });

    invalidateSettingsCache();
    return { success: true, url };
  } catch (err) {
    // Never forward the raw error (could be a Supabase Storage error
    // message, a sharp decoding error revealing internal details, ...)
    // to the admin UI — log it server-side for diagnosis instead.
    console.error("uploadBrandingAssetAction failed:", err);
    return { success: false, error: "Upload failed. Please try again." };
  }
}

import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "branding";

/**
 * Lazily creates the `branding` Supabase Storage bucket on first use —
 * this project has no infrastructure-as-code/setup script step for
 * provisioning storage buckets ahead of time (unlike the database,
 * which is migrated via `prisma migrate`), so the alternative would be
 * a manual "create this bucket in the Supabase dashboard" step in the
 * README before Branding uploads work at all. Idempotent: safe to call
 * on every upload.
 */
async function ensureBucketExists(): Promise<void> {
  const supabase = createAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((bucket) => bucket.name === BUCKET)) return;

  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
  });
}

/**
 * Uploads one optimized branding asset (logo/favicon/OG image) to the
 * public `branding` bucket and returns its public URL — the value
 * saved into `general.logoUrl` / `general.faviconUrl` / `seo.ogImageUrl`.
 * Uses the service-role client (`createAdminClient`) since only the
 * single authenticated admin can ever reach this code path (the
 * calling Server Action gates on `assertAdminAndRateLimit` first) and
 * Storage writes need to bypass RLS the same way every other
 * service-role write in this project already does.
 */
export async function uploadBrandingAsset(path: string, buffer: Buffer, contentType: string): Promise<string> {
  const supabase = createAdminClient();
  await ensureBucketExists();

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

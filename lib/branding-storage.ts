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
// Memoized per warm serverless instance — `listBuckets()` was being
// called (and awaited) on *every single* branding upload just to check
// something that's true after the very first upload ever made. On a
// slow/cold connection to Supabase that's a full extra network round
// trip added to every upload's latency for no benefit once the bucket
// exists, which made uploads more likely to butt up against the
// platform's function execution time limit. A cold serverless
// instance re-checks once (safe — `createBucket` on an
// already-existing bucket is itself a no-op error we swallow), then
// every subsequent upload on that warm instance skips straight past.
let bucketReady = false;

async function ensureBucketExists(): Promise<void> {
  if (bucketReady) return;

  const supabase = createAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((bucket) => bucket.name === BUCKET)) {
    bucketReady = true;
    return;
  }

  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
  });
  bucketReady = true;
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

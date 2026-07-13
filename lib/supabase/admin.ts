import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service-role key.
 *
 * ⚠️ Server-only. Never import this from a Client Component or expose the
 * service-role key to the browser. Reserved for the future single-admin
 * dashboard (e.g. writing job listings, managing storage assets).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

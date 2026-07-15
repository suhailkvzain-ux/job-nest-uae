import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components.
 *
 * Job For UAE has no end-user accounts, so this is used sparingly today
 * (e.g. reading public storage assets). It becomes more relevant once the
 * single-admin dashboard needs client-side session awareness.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

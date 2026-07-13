import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SESSION_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Wires cookie read/write so the admin auth session
 * (Supabase Auth) is automatically kept in sync with the browser.
 *
 * `cookieOptions` overrides `@supabase/ssr`'s defaults — see
 * `lib/supabase/cookie-options.ts` for why (its `httpOnly` default is
 * `false`, which this project needs to be `true`).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component during render — safe to ignore
            // because middleware refreshes the session on every request.
          }
        },
      },
    },
  );
}

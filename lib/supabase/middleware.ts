import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";

/**
 * Refreshes the Supabase auth session cookie on every request and
 * returns both the (possibly re-issued) response and the current user,
 * if any. This is the standard `@supabase/ssr` middleware pattern —
 * distinct from `lib/supabase/server.ts` because middleware reads/writes
 * cookies via `NextRequest`/`NextResponse`, not `next/headers`.
 *
 * Supabase Auth tokens are short-lived; without this refresh step,
 * Server Components could see a stale/expired session between renewals.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // IMPORTANT: always use getUser() here, never getSession(). getUser()
  // re-validates the token against Supabase's auth server on every call;
  // getSession() only reads the (possibly stale/forged) local cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

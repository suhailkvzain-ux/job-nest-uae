import type { CookieOptions } from "@supabase/ssr";

/**
 * Explicit session cookie flags for both server-side Supabase clients
 * (`lib/supabase/server.ts`, `lib/supabase/middleware.ts`).
 *
 * `@supabase/ssr`'s own `DEFAULT_COOKIE_OPTIONS` ships `httpOnly: false`
 * — reasonable for its general-purpose case (some setups need
 * client-side cookie access), but wrong for this project: the browser
 * client (`lib/supabase/client.ts`) never handles the admin session
 * (sign-in/sign-out are both Server Actions), so there's no legitimate
 * reason for the session cookie to be readable from JavaScript at all.
 * `httpOnly: true` closes off a real XSS-to-session-theft path — even
 * if a future dependency vulnerability or bug ever let an attacker run
 * script on `/admin`, the session cookie itself would be unreadable to
 * `document.cookie`.
 *
 * Only used by the two *server-side* Supabase clients — never passed to
 * `createBrowserClient` in `lib/supabase/client.ts`. A browser client
 * writes cookies via `document.cookie` directly, and a browser will
 * silently refuse to set a cookie flagged `HttpOnly` from script anyway,
 * so applying this there would just break it.
 */
export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

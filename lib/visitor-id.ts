import { cookies } from "next/headers";

const VISITOR_COOKIE = "jn_visitor_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Anonymous, first-party visitor identifier for Phase 12's Analytics
 * Dashboard — lets "Total/Today/Week/Month Visitors" count distinct
 * visitors (`COUNT(DISTINCT visitorId)`) instead of raw page-view
 * events. Deliberately NOT a user account or any kind of PII: a random
 * UUID, no email/name/IP attached, set with a 1-year expiry the same
 * way a "remember this browser" cookie works. This project has no
 * public-facing accounts (by design — see the README's opening
 * paragraph) and this doesn't add one; it's the minimum a
 * "unique visitors" metric requires without one.
 *
 * Read-or-create: on a visitor's first tracked request this both
 * returns the new id and sets the cookie (Server Actions are allowed to
 * mutate cookies in Next.js); every subsequent request just reads it
 * back.
 */
export async function getOrCreateVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  try {
    cookieStore.set(VISITOR_COOKIE, id, {
      maxAge: ONE_YEAR_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  } catch {
    // `cookies().set()` throws if called outside a Server Action/Route
    // Handler (e.g. from a plain Server Component render) — tracking
    // still works for this one request via the returned id, it just
    // won't persist across requests until called from a context that
    // can set cookies. `trackPageViewAction` (a real Server Action)
    // always can.
  }
  return id;
}

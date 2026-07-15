/**
 * Minimal in-memory sliding-window rate limiter — protects the admin
 * login Server Action from brute-force credential guessing.
 *
 * This is intentionally simple (a `Map` in module scope) rather than a
 * distributed store: Job For UAE's admin surface is a single account
 * on what's expected to run as a single Next.js instance. If this is
 * ever deployed across multiple serverless instances/regions, each
 * instance keeps its own counters — swap this for a shared store (e.g.
 * Upstash Redis, `@upstash/ratelimit`) at that point, since in-memory
 * state won't be consistent across instances.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * @param key Unique identifier for the caller — e.g. `login:{ip}`.
 * @param limit Max attempts allowed within the window.
 * @param windowMs Window size in milliseconds.
 */
/**
 * Best-effort caller IP, read from the standard forwarded-for headers.
 * Shared by every rate-limited Server Action (admin and public) so
 * there's exactly one place that decides how a caller's identity is
 * derived — previously `actions/auth.actions.ts` and
 * `lib/admin-action-helpers.ts` each duplicated this same three-line
 * lookup.
 */
export async function getClientIp(): Promise<string> {
  const { headers } = await import("next/headers");
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip || headerList.get("x-real-ip") || "unknown";
}

/**
 * Convenience wrapper for the many *public*, unauthenticated Server
 * Actions (analytics/click tracking, "Load More" pagination) that need
 * a rate limit but have no admin session to also check. Returns a
 * simple boolean rather than throwing, since every one of these
 * callers wants to fail silently/gracefully (never surface an error to
 * an anonymous visitor over a dropped analytics beacon or a
 * pagination click) rather than propagate an exception.
 */
export async function isRateLimited(key: string, limit: number, windowMs = 60_000): Promise<boolean> {
  const ip = await getClientIp();
  return !rateLimit(`${key}:${ip}`, limit, windowMs).allowed;
}

export function rateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - existing.windowStart) };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterMs: 0 };
}

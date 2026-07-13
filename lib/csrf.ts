import { headers } from "next/headers";

/**
 * Explicit, defense-in-depth CSRF check for every state-changing Server
 * Action.
 *
 * Next.js's own Server Action runtime already performs an Origin/Host
 * same-site check on every POST to a Server Action and rejects a
 * mismatch before user code ever runs (see `experimental.serverActions
 * .allowedOrigins` in `next.config.ts`, which pins the exact hosts that
 * check is allowed to trust). This function re-asserts the same rule
 * explicitly, independently, inside the action itself — so the
 * protection is visible in the code that needs it (not just implied by
 * framework behavior), and so a future refactor that moves this logic
 * behind a Route Handler or a differently-configured proxy doesn't
 * silently lose it.
 *
 * Only rejects when an `Origin` header is present and disagrees with
 * the request's host — a same-origin `<form action={serverAction}>`
 * submission or `fetch()` call always sends one for a POST, so a
 * mismatch here is a real cross-site request, not a false positive from
 * a legitimately Origin-less request.
 */
export async function assertSameOrigin(): Promise<void> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!origin || !host) return;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error("Request blocked: invalid origin");
  }

  if (originHost !== host) {
    throw new Error("Request blocked: cross-site origin");
  }
}

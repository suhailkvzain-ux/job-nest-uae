"use server";

import { redirect } from "next/navigation";

import { assertSameOrigin } from "@/lib/csrf";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { adminLoginSchema } from "@/lib/validations/auth";
import { logActivity } from "@/services/activity-log.service";

export interface SignInState {
  error?: string;
}

/**
 * Admin sign-in — email + password only, against Supabase Auth. Rate
 * limited per caller IP (5 attempts / minute) to slow down brute-force
 * guessing, since this project intentionally has no account lockout UI,
 * OTP, or CAPTCHA. Even after Supabase confirms the password is correct,
 * the signed-in user's email is checked against `ADMIN_EMAIL` — this
 * platform has exactly one administrator, so any other address is
 * rejected and immediately signed back out, even if it somehow has a
 * valid Supabase account.
 *
 * Next.js Server Actions are POST-only and origin-checked by the
 * framework itself, which is what provides CSRF protection here — there
 * is no separate hand-rolled CSRF token, since one isn't needed on top
 * of that.
 */
/** Only ever follow a `redirectTo` that's a same-site `/admin/...` path — never an absolute URL or protocol-relative `//host` (open-redirect prevention). */
function safeAdminRedirect(target: FormDataEntryValue | null): string {
  if (typeof target !== "string") return "/admin/dashboard";
  if (!target.startsWith("/admin/") || target.startsWith("//")) return "/admin/dashboard";
  return target;
}

export async function signInAction(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  try {
    await assertSameOrigin();
  } catch {
    return { error: "Request blocked. Please reload the page and try again." };
  }

  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const clientKey = await getClientIp();
  const limit = rateLimit(`login:${clientKey}`, 5, 60_000);
  if (!limit.allowed) {
    const seconds = Math.ceil(limit.retryAfterMs / 1000);
    return { error: `Too many attempts. Try again in ${seconds}s.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: "Invalid email or password" };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAuthorizedAdmin = Boolean(adminEmail && data.user.email?.toLowerCase() === adminEmail.toLowerCase());

  if (!isAuthorizedAdmin) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized to access the admin panel" };
  }

  void logActivity("ADMIN_LOGIN", data.user.email ?? adminEmail ?? "unknown");

  redirect(safeAdminRedirect(formData.get("redirectTo")));
}

/**
 * Signs the admin out and returns to the login page. Explicitly uses
 * `{ scope: "global" }` — invalidates every refresh token for this
 * user, signing out on every device/browser the session is active on,
 * not just this one. (This happens to already be `supabase-js`'s
 * default scope; it's spelled out explicitly here so that fact isn't
 * silently relied upon, and to satisfy the "logout from all devices"
 * requirement in one obvious place.)
 */
export async function signOutAction(): Promise<void> {
  await assertSameOrigin().catch(() => undefined); // low-stakes CSRF target (worst case: a forced logout) — never block signing out over it
  const supabase = await createClient();

  // Logged before signing out — `logActivity()` reads the current
  // session to resolve the acting admin's email, which is only
  // available before this call invalidates it.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  void logActivity("ADMIN_LOGOUT", user?.email ?? "unknown");

  await supabase.auth.signOut({ scope: "global" });
  redirect("/admin/login");
}

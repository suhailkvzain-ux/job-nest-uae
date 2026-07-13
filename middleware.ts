import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Global middleware — the single enforcement point for admin route
 * protection. Runs on every `/admin/*` request (see `config.matcher`
 * below; the public site never passes through here).
 *
 * Rules:
 *  - `/admin/login` is the only route an unauthenticated visitor may see.
 *  - Every other `/admin/*` route requires a valid Supabase session.
 *  - The session's email must match `ADMIN_EMAIL` exactly — this project
 *    has exactly one administrator, created manually in Supabase. If
 *    `ADMIN_EMAIL` isn't configured, or a session somehow belongs to a
 *    different address, access is denied (fail closed) rather than
 *    silently trusting "any authenticated user."
 *  - An already-authenticated admin hitting `/admin/login` is redirected
 *    straight to `/admin/dashboard` instead of seeing the form again.
 *  - Bare `/admin` is redirected to whichever of the above applies.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAuthorizedAdmin = Boolean(user?.email && adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase());
  const isLoginRoute = pathname === "/admin/login";

  if (pathname === "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = isAuthorizedAdmin ? "/admin/dashboard" : "/admin/login";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute) {
    if (isAuthorizedAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (!isAuthorizedAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

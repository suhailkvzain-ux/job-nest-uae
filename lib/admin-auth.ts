import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin auth guard — called from `app/admin/(protected)/layout.tsx`
 * as a second, independent check beyond `middleware.ts`. Defense in
 * depth: middleware protects the route at the edge, this protects the
 * render itself in case a Server Component is ever invoked directly
 * (e.g. during static generation, or if the matcher is ever
 * misconfigured). Both checks apply the same rule — a valid Supabase
 * session whose email matches `ADMIN_EMAIL` exactly.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAuthorizedAdmin = Boolean(user?.email && adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase());

  if (!isAuthorizedAdmin) {
    redirect("/admin/login");
  }

  return user;
}

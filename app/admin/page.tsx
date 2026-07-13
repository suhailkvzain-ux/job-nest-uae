import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";

/**
 * Bare `/admin` — in normal operation `middleware.ts` already redirects
 * this to `/admin/login` or `/admin/dashboard` before any page renders,
 * but this route still exists (rather than 404ing) as a server-side
 * fallback in case the middleware matcher is ever changed or bypassed.
 */
export default async function AdminIndexPage() {
  await requireAdmin();
  redirect("/admin/dashboard");
}

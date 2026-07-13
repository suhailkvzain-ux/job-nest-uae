import type { ActivityAction } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Writes one row to the audit trail (Phase 12's Recent Activity
 * timeline; Phase 16 extends it to a real audit log — every admin
 * mutation the spec calls out, plus login/logout, plus *who* did it).
 * `entityLabel` is a denormalized snapshot (a job title, an
 * advertisement name) rather than a foreign key — see `ActivityLog`'s
 * doc comment in `schema.prisma` for why: the timeline must still read
 * correctly after the row it refers to is deleted (a "Job Deleted"
 * entry is, definitionally, about a job that no longer exists to join
 * against). Swallows its own failures, same as every analytics write in
 * this project — logging an activity entry must never block the
 * mutation it's describing.
 *
 * Resolves the acting administrator's email itself (rather than
 * threading it through every mutating service function's parameters)
 * by re-reading the current Supabase session — cheap, and every call
 * site is already inside an authenticated admin request by the time
 * it's reached (the calling Server Action already ran
 * `assertAdminAndRateLimit()`/`requireAdmin()` first).
 */
export async function logActivity(action: ActivityAction, entityLabel: string): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await prisma.activityLog.create({ data: { action, entityLabel, adminEmail: user?.email ?? null } });
  } catch {
    // Never let a dropped activity-log write surface to the admin.
  }
}

/** Most recent activity entries, newest first — powers the admin Analytics Dashboard's Recent Activity timeline. */
export async function getRecentActivity(take = 20) {
  return prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take });
}

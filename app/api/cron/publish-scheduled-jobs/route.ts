import { NextResponse, type NextRequest } from "next/server";

import { publishDueScheduledJobs } from "@/services/jobs.service";

/**
 * Cron target for auto-publishing scheduled jobs — see
 * `services/jobs.service.ts`'s `publishDueScheduledJobs()` for the full
 * story on the bug this fixes (the function existed since Phase 9 with
 * a doc comment saying "intended to run on a cron," but nothing ever
 * called it, so a SCHEDULED job never actually went live on its own).
 *
 * Wired up via `vercel.json`'s `crons` array (every 15 minutes — a
 * job's scheduled publish time doesn't need finer granularity than
 * that). Vercel signs every cron-triggered request with a bearer token
 * matching the `CRON_SECRET` project env var, which this route
 * verifies before doing anything — without that check, this would be
 * a public, unauthenticated endpoint that publishes jobs on demand.
 *
 * Not gated behind `requireAdmin()`/Supabase session, since Vercel's
 * cron invoker isn't a signed-in admin browsing the site — the
 * `CRON_SECRET` bearer check is the entire authorization boundary
 * here, the same pattern Vercel's own cron documentation recommends.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publishedCount = await publishDueScheduledJobs();

  return NextResponse.json({ publishedCount });
}

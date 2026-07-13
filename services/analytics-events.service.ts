import type { AnalyticsEventType } from "@prisma/client";
import { headers } from "next/headers";

import { detectDeviceType } from "@/lib/device-type";
import { prisma } from "@/lib/prisma";
import { getOrCreateVisitorId } from "@/lib/visitor-id";

interface RecordEventInput {
  type: AnalyticsEventType;
  jobId?: string;
  path?: string;
  searchQuery?: string;
}

/**
 * The single write path for every row in the Phase 12 event log.
 * Gathers device type (from the `User-Agent` header), referrer (from
 * the `Referer` header — not always present, browsers frequently strip
 * it cross-origin, hence "optional" per the spec), and the anonymous
 * visitor id itself, so every call site (`trackPageViewAction`, the
 * job view/click increments below) stays a one-line call. Failures are
 * swallowed — exactly like every other analytics increment in this
 * project, a dropped analytics event must never surface an error or
 * block the user-facing action it's attached to.
 */
export async function recordAnalyticsEvent(input: RecordEventInput): Promise<void> {
  try {
    const [headerList, visitorId] = await Promise.all([headers(), getOrCreateVisitorId()]);

    await prisma.analyticsEvent.create({
      data: {
        type: input.type,
        jobId: input.jobId ?? null,
        path: input.path ?? null,
        searchQuery: input.searchQuery ?? null,
        deviceType: detectDeviceType(headerList.get("user-agent")),
        referrer: headerList.get("referer"),
        visitorId,
      },
    });
  } catch {
    // Never let a dropped analytics write surface to the visitor.
  }
}

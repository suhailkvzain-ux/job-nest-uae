import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sanitizeAdHtml } from "@/lib/sanitize-html";
import type { AdminAdSearchInput } from "@/lib/validations/admin-advertisement";
import type {
  AdvertisementPosition,
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
} from "@/lib/validations/advertisement";
import { logActivity } from "@/services/activity-log.service";
import type { PaginatedResult } from "@/types";

/**
 * Advertisement service — the Phase 11 Advertisement Manager's data
 * layer. Advertisement is reference data like Company/Category/Location
 * (real `delete`, no soft-delete column), not a Job-like lifecycle
 * entity, so this mirrors the Master Data services' shape more than
 * Job's.
 */

function withSanitizedHtml<T extends { adType?: string; htmlCode?: string | null | undefined }>(input: T): T {
  if (input.adType === "CUSTOM_HTML" && input.htmlCode) {
    return { ...input, htmlCode: sanitizeAdHtml(input.htmlCode) };
  }
  return input;
}

export async function createAdvertisement(input: CreateAdvertisementInput) {
  return prisma.advertisement.create({ data: withSanitizedHtml(input) });
}

export async function updateAdvertisement(id: string, input: UpdateAdvertisementInput) {
  const ad = await prisma.advertisement.update({ where: { id }, data: withSanitizedHtml(input) });
  void logActivity("ADVERTISEMENT_UPDATED", ad.name);
  return ad;
}

export async function deleteAdvertisement(id: string) {
  return prisma.advertisement.delete({ where: { id } });
}

/** Creates a copy with a new name and `status: DISABLED` — a duplicated ad never goes live automatically, so the admin always reviews it (dates, targeting) before enabling. */
export async function duplicateAdvertisement(id: string) {
  const source = await prisma.advertisement.findUniqueOrThrow({ where: { id } });
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, impressions: _impressions, clicks: _clicks, ...rest } = source;

  return prisma.advertisement.create({
    data: { ...rest, name: `${source.name} (Copy)`, status: "DISABLED" },
  });
}

export async function setAdvertisementStatus(id: string, status: "ACTIVE" | "DISABLED") {
  return prisma.advertisement.update({ where: { id }, data: { status } });
}

export async function getAdvertisementById(id: string) {
  return prisma.advertisement.findUnique({ where: { id } });
}

export async function getAllAdvertisements() {
  return prisma.advertisement.findMany({ orderBy: [{ position: "asc" }, { displayOrder: "asc" }] });
}

/**
 * Every currently-eligible ad for a position — active status, and
 * within its optional start/end date window. Deliberately not filtered
 * by device here: `AdSlot` renders a desktop bucket and a mobile bucket
 * from the same result set (see that component), so one query serves
 * both rather than firing it twice per slot.
 */
export async function getEligibleAdsForPosition(position: AdvertisementPosition) {
  const now = new Date();

  return prisma.advertisement.findMany({
    where: {
      position,
      status: "ACTIVE",
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { displayOrder: "asc" },
  });
}

export async function incrementAdImpression(id: string): Promise<void> {
  await prisma.advertisement.update({ where: { id }, data: { impressions: { increment: 1 } } }).catch(() => undefined);
}

export async function incrementAdClick(id: string): Promise<void> {
  await prisma.advertisement.update({ where: { id }, data: { clicks: { increment: 1 } } }).catch(() => undefined);
}

/** CTR as a percentage, rounded to 2 decimals — `0` (not `NaN`/`Infinity`) when there have been no impressions yet. */
export function computeCtr(impressions: number, clicks: number): number {
  if (impressions <= 0) return 0;
  return Math.round((clicks / impressions) * 10000) / 100;
}

// ─────────────────────────────────────────────────────────────
// Admin list (`/admin/advertisements`)
// ─────────────────────────────────────────────────────────────

function buildAdminAdWhere(input: AdminAdSearchInput): Prisma.AdvertisementWhereInput {
  const where: Prisma.AdvertisementWhereInput = {};
  if (input.query) where.name = { contains: input.query, mode: "insensitive" };
  if (input.position) where.position = input.position;
  if (input.status) where.status = input.status;
  if (input.adType) where.adType = input.adType;
  return where;
}

function buildAdminAdOrderBy(sort: AdminAdSearchInput["sort"]): Record<string, "asc" | "desc">[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "oldest":
      return [{ createdAt: "asc" }];
    case "name_az":
      return [{ name: "asc" }];
    case "display_order":
    default:
      return [{ displayOrder: "asc" }, { createdAt: "desc" }];
  }
}

export async function getAdminAdvertisementsList(input: AdminAdSearchInput) {
  const where = buildAdminAdWhere(input);
  const orderBy = buildAdminAdOrderBy(input.sort);

  const [items, total] = await Promise.all([
    prisma.advertisement.findMany({
      where,
      orderBy,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.advertisement.count({ where }),
  ]);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
  } satisfies PaginatedResult<(typeof items)[number]>;
}

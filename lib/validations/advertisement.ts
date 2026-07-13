import { z } from "zod";

/**
 * Zod schemas for the Advertisement domain (Phase 11's Advertisement
 * Manager). Enum members are hand-listed as string literals rather than
 * imported from `@prisma/client` — same rationale as every other
 * validations file in this project: zero dependency on the generated
 * client, importable from client components/edge code.
 */

export const advertisementPositionEnum = z.enum([
  "TOP_BANNER",
  "MIDDLE_BANNER",
  "BOTTOM_BANNER",
  "DESKTOP_SIDEBAR",
  "MOBILE_BANNER",
  "HOMEPAGE_HERO",
  "HOMEPAGE_MIDDLE",
  "HOMEPAGE_FOOTER",
  "JOBS_LISTING_TOP",
  "JOBS_LISTING_MIDDLE",
  "JOBS_LISTING_BOTTOM",
  "SINGLE_JOB_TOP",
  "SINGLE_JOB_MIDDLE",
  "SINGLE_JOB_BOTTOM",
  "COMPANY_PAGE",
  "CATEGORY_PAGE",
  "LOCATION_PAGE",
]);
export type AdvertisementPosition = z.infer<typeof advertisementPositionEnum>;

export const adDeviceEnum = z.enum(["DESKTOP", "MOBILE", "ALL"]);
export type AdDevice = z.infer<typeof adDeviceEnum>;

export const adTypeEnum = z.enum(["ADSENSE", "CUSTOM_HTML", "IMAGE_BANNER"]);
export type AdType = z.infer<typeof adTypeEnum>;

export const adStatusEnum = z.enum(["ACTIVE", "DISABLED"]);
export type AdStatus = z.infer<typeof adStatusEnum>;

/** Loose but real format check — full client-ID validation happens on Google's side; this just catches obvious typos/paste errors. */
const adsenseClientPattern = /^ca-pub-\d{10,20}$/;
const adsenseSlotPattern = /^\d{6,15}$/;

const baseAdvertisementFields = {
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  position: advertisementPositionEnum,
  device: adDeviceEnum.default("ALL"),
  adType: adTypeEnum.default("CUSTOM_HTML"),
  status: adStatusEnum.default("ACTIVE"),

  adsenseClient: z
    .string()
    .trim()
    .regex(adsenseClientPattern, "Must look like ca-pub-XXXXXXXXXXXXXXXX")
    .optional()
    .nullable(),
  adsenseSlot: z.string().trim().regex(adsenseSlotPattern, "Must be a numeric AdSense slot ID").optional().nullable(),

  htmlCode: z.string().trim().min(1).optional().nullable(),

  imageUrl: z.string().trim().url("Must be a valid URL").optional().nullable(),
  targetUrl: z.string().trim().url("Must be a valid URL").optional().nullable(),
  width: z.coerce.number().int().positive().max(4000).optional().nullable(),
  height: z.coerce.number().int().positive().max(4000).optional().nullable(),

  displayOrder: z.coerce.number().int().min(0).default(0),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
};

/**
 * Every cross-field rule the spec calls for, applied identically to
 * create and update: exactly the fields the chosen `adType` needs must
 * be present, and a date range (when both ends are given) must be the
 * right way round. Written as a plain function (not a generic
 * `.superRefine()`-wrapping helper) so `z.infer` on each exported schema
 * resolves to a concrete, fully-typed object rather than a type TS can't
 * narrow past `string | number | symbol` for `keyof`.
 */
function checkAdvertisementRefinements(
  value: {
    adType?: AdType;
    adsenseClient?: string | null;
    adsenseSlot?: string | null;
    htmlCode?: string | null;
    imageUrl?: string | null;
    targetUrl?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  },
  ctx: z.RefinementCtx,
) {
  if (value.adType === "ADSENSE") {
    if (!value.adsenseClient) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "AdSense Client ID is required", path: ["adsenseClient"] });
    }
    if (!value.adsenseSlot) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "AdSense Slot ID is required", path: ["adsenseSlot"] });
    }
  }

  if (value.adType === "CUSTOM_HTML" && !value.htmlCode) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "HTML code is required", path: ["htmlCode"] });
  }

  if (value.adType === "IMAGE_BANNER") {
    if (!value.imageUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Image URL is required", path: ["imageUrl"] });
    }
    if (!value.targetUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Target URL is required", path: ["targetUrl"] });
    }
  }

  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after the start date", path: ["endDate"] });
  }
}

export const createAdvertisementSchema = z
  .object(baseAdvertisementFields)
  .superRefine(checkAdvertisementRefinements);
export type CreateAdvertisementInput = z.infer<typeof createAdvertisementSchema>;

export const updateAdvertisementSchema = z
  .object(baseAdvertisementFields)
  .partial()
  .extend({
    // `adType` must stay required even on a "partial" update — every
    // other conditional-requirement rule above is meaningless without
    // knowing which type is being validated against.
    adType: adTypeEnum,
  })
  .superRefine(checkAdvertisementRefinements);
export type UpdateAdvertisementInput = z.infer<typeof updateAdvertisementSchema>;

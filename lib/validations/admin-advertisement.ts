import { z } from "zod";

import { adStatusEnum, adTypeEnum, advertisementPositionEnum } from "@/lib/validations/advertisement";

/** Search/filter/sort/pagination schema for `/admin/advertisements`. */
export const adminAdSortEnum = z.enum(["display_order", "newest", "oldest", "name_az"]);
export type AdminAdSort = z.infer<typeof adminAdSortEnum>;

export const adminAdSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  position: advertisementPositionEnum.optional(),
  status: adStatusEnum.optional(),
  adType: adTypeEnum.optional(),
  sort: adminAdSortEnum.default("display_order"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type AdminAdSearchInput = z.infer<typeof adminAdSearchSchema>;

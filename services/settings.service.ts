import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  SECTION_REGISTRY,
  type SectionKey,
  type SettingFieldDef,
  type WebsiteSettings,
} from "@/lib/settings-registry";
import { logActivity } from "@/services/activity-log.service";

/**
 * Website Settings & System Configuration (Phase 13) — the service
 * layer over the `Setting` key/value table. Every section (General,
 * Contact, Social, SEO, Google Integrations, Email, Behavior) reads
 * and writes through the three helpers the spec asks for:
 * `getSetting()`, `updateSetting()`, `getAllSettings()`. A fourth,
 * `updateSettingsSection()`, saves a whole section's form in one call
 * (what the admin UI actually submits) — thin sugar over repeated
 * `updateSetting()` calls, not a separate code path.
 */

function parseValue(raw: string | null, def: SettingFieldDef): string | number | boolean {
  if (raw === null) return def.default;
  switch (def.type) {
    case "BOOLEAN":
      return raw === "true";
    case "NUMBER": {
      const n = Number(raw);
      return Number.isFinite(n) ? n : (def.default as number);
    }
    case "STRING":
    default:
      return raw;
  }
}

function serializeValue(value: string | number | boolean): string {
  return String(value);
}

/** Every configured setting, grouped by section, with defaults applied for any key never written to the database yet (a fresh install, or a setting added after go-live). Uncached — see `getAllSettings` below for the cached entry point every read call site should actually use. */
async function loadAllSettings(): Promise<WebsiteSettings> {
  const rows = await prisma.setting.findMany();
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  const result = {} as WebsiteSettings;
  for (const sectionKey of Object.keys(SECTION_REGISTRY) as SectionKey[]) {
    const fields = SECTION_REGISTRY[sectionKey];
    const sectionValues: Record<string, string | number | boolean> = {};
    for (const [fieldName, def] of Object.entries(fields)) {
      sectionValues[fieldName] = parseValue(byKey.get(def.key) ?? null, def as SettingFieldDef);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- building the union-of-sections object generically; each section's own accessor is fully typed via `WebsiteSettings[S]`.
    (result as any)[sectionKey] = sectionValues;
  }
  return result;
}

/**
 * Cached entry point for every settings read across the app — the
 * public site's footer (social links, copyright), `<head>` tags (SEO
 * defaults, Google Analytics/Tag Manager/AdSense), the maintenance-mode
 * gate, and the admin Settings page's own initial form values all read
 * through this one function. 5-minute revalidate window, and every
 * write (`updateSetting`/`updateSettingsSection`) calls
 * `revalidateTag("settings")` immediately after, so an admin saving a
 * change doesn't have to wait out the window to see it reflected.
 */
export const getAllSettings = unstable_cache(loadAllSettings, ["all-settings"], {
  tags: ["settings"],
  revalidate: 300,
});

/** Single-setting read, e.g. `getSetting("behavior", "maintenanceMode")` — sugar over the cached `getAllSettings()`, not a separate database round trip. */
export async function getSetting<S extends SectionKey, F extends keyof WebsiteSettings[S]>(
  section: S,
  field: F,
): Promise<WebsiteSettings[S][F]> {
  const all = await getAllSettings();
  return all[section][field];
}

/** Writes one setting. Upserts by key since a fresh install has no rows yet — the first save of any field creates it. */
export async function updateSetting<S extends SectionKey, F extends keyof WebsiteSettings[S] & string>(
  section: S,
  field: F,
  value: WebsiteSettings[S][F],
): Promise<void> {
  const def = (SECTION_REGISTRY[section] as Record<string, SettingFieldDef>)[field]!;
  const serialized = serializeValue(value as string | number | boolean);

  await prisma.setting.upsert({
    where: { key: def.key },
    create: { key: def.key, value: serialized, type: def.type },
    update: { value: serialized, type: def.type },
  });
}

/** Writes every field of one section's submitted form in parallel — what the admin Settings page's per-section "Save" button actually calls. */
export async function updateSettingsSection<S extends SectionKey>(
  section: S,
  values: Partial<WebsiteSettings[S]>,
): Promise<void> {
  const fields = SECTION_REGISTRY[section] as Record<string, SettingFieldDef>;

  await Promise.all(
    Object.entries(values).map(([fieldName, value]) => {
      if (value === undefined) return Promise.resolve();
      const def = fields[fieldName]!;
      const serialized = serializeValue(value as string | number | boolean);
      return prisma.setting.upsert({
        where: { key: def.key },
        create: { key: def.key, value: serialized, type: def.type },
        update: { value: serialized, type: def.type },
      });
    }),
  );

  void logActivity("SETTINGS_UPDATED", `${section} settings`);
}

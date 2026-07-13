import type { Metadata } from "next";

import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { getAllSettings } from "@/services/settings.service";

export const metadata: Metadata = { title: "Settings | Admin" };
export const dynamic = "force-dynamic";

/**
 * `/admin/settings` — centralized website configuration across eight
 * sections (General, Contact, Social Media, SEO, Google Integrations,
 * Email, Website Behavior, Branding), per the Phase 13 spec. Already
 * covered by the same `middleware.ts` Supabase-session guard as every
 * other route under `app/admin/(protected)/`.
 *
 * All eight sections' current values are read once, server-side, via
 * the cached `getAllSettings()` (defaults are applied automatically
 * for any setting never written to yet — a fresh install renders
 * correctly with no seed data required) and handed down to
 * `SettingsTabs`, which owns the tab navigation and per-section forms.
 */
export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage global website configuration without touching code.
        </p>
      </div>

      <SettingsTabs settings={settings} />
    </div>
  );
}

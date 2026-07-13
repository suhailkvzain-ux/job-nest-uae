import { BrandingUploadField } from "@/components/admin/settings/branding-upload-field";
import { SettingsSectionCard } from "@/components/admin/settings/settings-section-card";
import type { GeneralSettings, SeoSettings } from "@/lib/settings-registry";

/**
 * Branding — the three image uploads (Logo, Favicon, Default OG Image),
 * automatically optimized on upload (`lib/image-optimize.ts`: logo
 * resized to fit 512×512 WebP, favicon to 64×64 PNG, OG image cropped
 * to the standard 1200×630 JPEG). Writes directly into
 * `general.logoUrl`/`general.faviconUrl`/`seo.ogImageUrl` — see
 * `lib/settings-registry.ts`'s doc comment for why this section has no
 * setting keys of its own.
 */
export function BrandingSettingsPanel({
  general,
  seo,
}: {
  general: Pick<GeneralSettings, "logoUrl" | "faviconUrl">;
  seo: Pick<SeoSettings, "ogImageUrl">;
}) {
  return (
    <SettingsSectionCard title="Branding" description="Uploaded images are optimized automatically — resized and compressed for how each one is actually used.">
      <BrandingUploadField
        kind="logo"
        label="Logo"
        description="Shown in the site header. Recommended: square or wide, transparent background."
        currentUrl={general.logoUrl}
        previewClassName="h-16 w-16"
      />
      <BrandingUploadField
        kind="favicon"
        label="Favicon"
        description="Shown in the browser tab. Square image works best."
        currentUrl={general.faviconUrl}
        previewClassName="h-16 w-16"
      />
      <BrandingUploadField
        kind="ogImage"
        label="Default OG Image"
        description="Shown when a page without its own image is shared on social media. Cropped to 1200×630."
        currentUrl={seo.ogImageUrl}
        previewClassName="h-16 w-28"
      />
    </SettingsSectionCard>
  );
}

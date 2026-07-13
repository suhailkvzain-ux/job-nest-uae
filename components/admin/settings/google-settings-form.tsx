"use client";

import { updateGoogleSettingsAction } from "@/actions/admin-settings.actions";
import { SettingsSectionCard } from "@/components/admin/settings/settings-section-card";
import { SettingsSectionForm } from "@/components/admin/settings/settings-section-form";
import { FormTextInput } from "@/components/forms/form-text-input";
import { googleSettingsSchema, type GoogleSettingsInput } from "@/lib/validations/settings";

/**
 * Google Integrations — IDs only, no script-injection logic here.
 * Wiring these into `<head>` (GA/GTM loaders, the Search Console
 * verification meta tag) is SEO/analytics *generation*, which the
 * spec explicitly scopes out of this phase ("Do not build SEO
 * generation... yet"). Stored securely server-side either way: these
 * values never round-trip through anything but this admin form and
 * the `Setting` table.
 */
export function GoogleSettingsForm({ defaultValues }: { defaultValues: GoogleSettingsInput }) {
  return (
    <SettingsSectionCard
      title="Google Integrations"
      description="Analytics, Tag Manager, Search Console, and AdSense identifiers."
    >
      <SettingsSectionForm
        schema={googleSettingsSchema}
        defaultValues={defaultValues}
        action={updateGoogleSettingsAction}
        successMessage="Google integration settings saved"
      >
        {(control) => (
          <>
            <FormTextInput control={control} name="gaMeasurementId" label="Google Analytics Measurement ID" placeholder="G-XXXXXXXXXX" />
            <FormTextInput control={control} name="gtmId" label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" />
            <FormTextInput
              control={control}
              name="searchConsoleVerification"
              label="Google Search Console Verification Code"
              placeholder="Content value of the google-site-verification meta tag"
            />
            <FormTextInput control={control} name="adsensePublisherId" label="Google AdSense Publisher ID" placeholder="ca-pub-XXXXXXXXXXXXXXXX" />
          </>
        )}
      </SettingsSectionForm>
    </SettingsSectionCard>
  );
}

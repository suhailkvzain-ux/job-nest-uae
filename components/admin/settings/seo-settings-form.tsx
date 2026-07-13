"use client";

import { updateSeoSettingsAction } from "@/actions/admin-settings.actions";
import { SeoSerpPreview } from "@/components/admin/settings/seo-serp-preview";
import { SettingsSectionCard } from "@/components/admin/settings/settings-section-card";
import { SettingsSectionForm } from "@/components/admin/settings/settings-section-form";
import { FormTextInput } from "@/components/forms/form-text-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { FormUrlInput } from "@/components/forms/form-url-input";
import { seoSettingsSchema, type SeoSettingsInput } from "@/lib/validations/settings";

/** SEO Settings — site-wide defaults used whenever a page doesn't set its own meta title/description (every job/company/category/location page already does; these back the homepage and any page without one). Default OG image upload lives in Branding. */
export function SeoSettingsForm({ defaultValues }: { defaultValues: SeoSettingsInput }) {
  return (
    <SettingsSectionCard title="SEO Settings" description="Default metadata for the homepage and any page without its own.">
      <SettingsSectionForm
        schema={seoSettingsSchema}
        defaultValues={defaultValues}
        action={updateSeoSettingsAction}
        successMessage="SEO settings saved"
      >
        {(control) => (
          <>
            <FormTextInput control={control} name="metaTitle" label="Default Meta Title" />
            <FormTextarea control={control} name="metaDescription" label="Default Meta Description" rows={3} />
            <FormTextInput control={control} name="metaKeywords" label="Default Keywords" placeholder="UAE jobs, Dubai jobs, careers" />
            <FormUrlInput control={control} name="canonicalDomain" label="Canonical Domain" placeholder="https://jobnestuae.com" />
            <SeoSerpPreview control={control} />
          </>
        )}
      </SettingsSectionForm>
    </SettingsSectionCard>
  );
}

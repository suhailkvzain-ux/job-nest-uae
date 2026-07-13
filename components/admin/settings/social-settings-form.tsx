"use client";

import { updateSocialSettingsAction } from "@/actions/admin-settings.actions";
import { SettingsSectionCard } from "@/components/admin/settings/settings-section-card";
import { SettingsSectionForm } from "@/components/admin/settings/settings-section-form";
import { FormUrlInput } from "@/components/forms/form-url-input";
import { socialSettingsSchema, type SocialSettingsInput } from "@/lib/validations/settings";

export function SocialSettingsForm({ defaultValues }: { defaultValues: SocialSettingsInput }) {
  return (
    <SettingsSectionCard title="Social Media" description="Linked from the site footer. Leave blank to hide a platform's icon.">
      <SettingsSectionForm
        schema={socialSettingsSchema}
        defaultValues={defaultValues}
        action={updateSocialSettingsAction}
        successMessage="Social media links saved"
      >
        {(control) => (
          <>
            <FormUrlInput control={control} name="facebook" label="Facebook" placeholder="https://facebook.com/jobnestuae" />
            <FormUrlInput control={control} name="instagram" label="Instagram" placeholder="https://instagram.com/jobnestuae" />
            <FormUrlInput control={control} name="linkedin" label="LinkedIn" placeholder="https://linkedin.com/company/jobnestuae" />
            <FormUrlInput control={control} name="twitter" label="X (Twitter)" placeholder="https://x.com/jobnestuae" />
            <FormUrlInput control={control} name="youtube" label="YouTube" placeholder="https://youtube.com/@jobnestuae" />
          </>
        )}
      </SettingsSectionForm>
    </SettingsSectionCard>
  );
}

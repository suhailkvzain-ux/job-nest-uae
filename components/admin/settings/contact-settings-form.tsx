"use client";

import { updateContactSettingsAction } from "@/actions/admin-settings.actions";
import { SettingsSectionCard } from "@/components/admin/settings/settings-section-card";
import { SettingsSectionForm } from "@/components/admin/settings/settings-section-form";
import { FormEmailInput } from "@/components/forms/form-email-input";
import { FormTextInput } from "@/components/forms/form-text-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { FormUrlInput } from "@/components/forms/form-url-input";
import { contactSettingsSchema, type ContactSettingsInput } from "@/lib/validations/settings";

export function ContactSettingsForm({ defaultValues }: { defaultValues: ContactSettingsInput }) {
  return (
    <SettingsSectionCard title="Contact Information" description="How candidates and employers can reach the site.">
      <SettingsSectionForm
        schema={contactSettingsSchema}
        defaultValues={defaultValues}
        action={updateContactSettingsAction}
        successMessage="Contact information saved"
      >
        {(control) => (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormEmailInput control={control} name="contactEmail" label="Contact Email" />
              <FormEmailInput control={control} name="supportEmail" label="Support Email" />
            </div>
            <FormTextInput control={control} name="phone" label="Phone Number" type="tel" placeholder="+971 4 000 0000" />
            <FormTextarea control={control} name="address" label="Office Address" rows={3} />
            <FormUrlInput control={control} name="mapsLink" label="Google Maps Link" />
          </>
        )}
      </SettingsSectionForm>
    </SettingsSectionCard>
  );
}

"use client";

import { updateGeneralSettingsAction } from "@/actions/admin-settings.actions";
import { SettingsSectionCard } from "@/components/admin/settings/settings-section-card";
import { SettingsSectionForm } from "@/components/admin/settings/settings-section-form";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextInput } from "@/components/forms/form-text-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { generalSettingsSchema, type GeneralSettingsInput } from "@/lib/validations/settings";

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
];

const TIME_ZONE_OPTIONS = [
  { label: "Asia/Dubai (GST, UTC+4)", value: "Asia/Dubai" },
  { label: "UTC", value: "UTC" },
];

const DATE_FORMAT_OPTIONS = [
  { label: "DD MMM YYYY (11 Jul 2026)", value: "DD MMM YYYY" },
  { label: "MM/DD/YYYY (07/11/2026)", value: "MM/DD/YYYY" },
  { label: "DD/MM/YYYY (11/07/2026)", value: "DD/MM/YYYY" },
  { label: "YYYY-MM-DD (2026-07-11)", value: "YYYY-MM-DD" },
];

/** General Settings — website identity, locale, and copyright. Logo/Favicon uploads live in the Branding tab (see its own doc comment for why). */
export function GeneralSettingsForm({ defaultValues }: { defaultValues: GeneralSettingsInput }) {
  return (
    <SettingsSectionCard title="General Settings" description="Core site identity shown across the website and browser tab.">
      <SettingsSectionForm
        schema={generalSettingsSchema}
        defaultValues={defaultValues}
        action={updateGeneralSettingsAction}
        successMessage="General settings saved"
      >
        {(control) => (
          <>
            <FormTextInput control={control} name="websiteName" label="Website Name" required />
            <FormTextInput control={control} name="tagline" label="Website Tagline" />
            <FormTextarea control={control} name="description" label="Website Description" rows={4} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormSelect control={control} name="defaultLanguage" label="Default Language" options={LANGUAGE_OPTIONS} />
              <FormSelect control={control} name="timeZone" label="Time Zone" options={TIME_ZONE_OPTIONS} />
            </div>
            <FormSelect control={control} name="dateFormat" label="Date Format" options={DATE_FORMAT_OPTIONS} />
            <FormTextInput control={control} name="copyrightText" label="Copyright Text" placeholder="© 2026 Job Nest UAE. All rights reserved." />
          </>
        )}
      </SettingsSectionForm>
    </SettingsSectionCard>
  );
}

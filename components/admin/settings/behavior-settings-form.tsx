"use client";

import { updateBehaviorSettingsAction } from "@/actions/admin-settings.actions";
import { SettingsSectionCard } from "@/components/admin/settings/settings-section-card";
import { SettingsSectionForm } from "@/components/admin/settings/settings-section-form";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { behaviorSettingsSchema, type BehaviorSettingsInput } from "@/lib/validations/settings";

/** Website Behavior — toggles and the one numeric setting (Jobs Per Page) that shape how the public site renders, without a code change. */
export function BehaviorSettingsForm({ defaultValues }: { defaultValues: BehaviorSettingsInput }) {
  return (
    <SettingsSectionCard title="Website Behavior" description="Site-wide toggles for how pages render.">
      <SettingsSectionForm
        schema={behaviorSettingsSchema}
        defaultValues={defaultValues}
        action={updateBehaviorSettingsAction}
        successMessage="Website behavior settings saved"
      >
        {(control) => (
          <>
            <FormSwitch
              control={control}
              name="maintenanceMode"
              label="Maintenance Mode"
              description="Marks the site as under maintenance. Does not yet gate public pages — see the README's Phase 13 section."
            />
            <FormSwitch
              control={control}
              name="showFeaturedJobsOnHomepage"
              label="Show Featured Jobs on Homepage"
              description="Displays the Featured Jobs section on the homepage."
            />
            <FormNumberInput control={control} name="jobsPerPage" label="Jobs Per Page" />
            <FormSwitch
              control={control}
              name="enableBreadcrumbs"
              label="Enable Breadcrumbs"
              description="Shows breadcrumb navigation on job, company, category, and location pages."
            />
            <FormSwitch
              control={control}
              name="enableRelatedJobs"
              label="Enable Related Jobs"
              description="Shows the Related Jobs section on single job pages."
            />
            <FormSwitch
              control={control}
              name="enableShareButtons"
              label="Enable Share Buttons"
              description="Shows social share buttons on single job pages."
            />
          </>
        )}
      </SettingsSectionForm>
    </SettingsSectionCard>
  );
}

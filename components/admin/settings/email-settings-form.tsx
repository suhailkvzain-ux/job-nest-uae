"use client";

import { updateEmailSettingsAction } from "@/actions/admin-settings.actions";
import { SettingsSectionCard } from "@/components/admin/settings/settings-section-card";
import { SettingsSectionForm } from "@/components/admin/settings/settings-section-form";
import { FormEmailInput } from "@/components/forms/form-email-input";
import { FormTextInput } from "@/components/forms/form-text-input";
import { emailSettingsSchema, type EmailSettingsInput } from "@/lib/validations/settings";

/**
 * Email Settings — Sender Name/Email and Reply-To, exactly the three
 * fields the spec asks for. These are stored and ready for an actual
 * SMTP/transactional-email integration to read from later (adding
 * `email.smtp_*` keys is a registry entry away, see
 * `lib/settings-registry.ts`), but no outbound email is sent by this
 * phase — there's no SMTP send path yet to plug them into.
 */
export function EmailSettingsForm({ defaultValues }: { defaultValues: EmailSettingsInput }) {
  return (
    <SettingsSectionCard
      title="Email Settings"
      description="Identity used for future transactional email (structure only — no SMTP send path yet)."
    >
      <SettingsSectionForm
        schema={emailSettingsSchema}
        defaultValues={defaultValues}
        action={updateEmailSettingsAction}
        successMessage="Email settings saved"
      >
        {(control) => (
          <>
            <FormTextInput control={control} name="senderName" label="Sender Name" required />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormEmailInput control={control} name="senderEmail" label="Sender Email" />
              <FormEmailInput control={control} name="replyToEmail" label="Reply-To Email" />
            </div>
          </>
        )}
      </SettingsSectionForm>
    </SettingsSectionCard>
  );
}

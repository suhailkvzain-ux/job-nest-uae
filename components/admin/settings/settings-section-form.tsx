"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, type Control, type FieldValues, type Path } from "react-hook-form";
import type { ZodType, ZodTypeDef } from "zod";

import type { SettingsActionResult } from "@/actions/admin-settings.actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SettingsSectionFormProps<T extends FieldValues> {
  schema: ZodType<T, ZodTypeDef, unknown>;
  defaultValues: T;
  action: (input: T) => Promise<SettingsActionResult>;
  successMessage: string;
  children: (control: Control<T>) => ReactNode;
}

/**
 * Shared save-form shell for every text/toggle-based settings section
 * (General, Contact, Social Media, SEO, Google Integrations, Email,
 * Website Behavior) — six near-identical sections that each just
 * validate-then-call-one-Server-Action-then-toast, so this one
 * component owns that flow generically and each section only supplies
 * its Zod schema, default values, and field renderers. Branding is the
 * one section that doesn't fit this shape (file uploads, not a
 * validated text form) and has its own component.
 *
 * The Save button is disabled until the form is actually dirty, so an
 * admin can't accidentally resubmit unchanged values, and `reset(values)`
 * after a successful save clears the dirty flag against the just-saved
 * values rather than the original defaults.
 */
export function SettingsSectionForm<T extends FieldValues>({
  schema,
  defaultValues,
  action,
  successMessage,
  children,
}: SettingsSectionFormProps<T>) {
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as never,
  });

  async function onSubmit(values: T) {
    const result = await action(values);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as Path<T>, { message });
        }
      }
      toast({ title: result.error ?? "Could not save settings", variant: "destructive" });
      return;
    }

    reset(values);
    toast({ title: successMessage, variant: "success" });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {children(control)}
      <div className="flex justify-end border-t border-border/60 pt-5">
        <Button type="submit" disabled={isSubmitting || !isDirty} className="gap-2">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}

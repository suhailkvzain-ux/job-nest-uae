"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { FormTextInput } from "@/components/forms/form-text-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { FormUrlInput } from "@/components/forms/form-url-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type {
  MasterDataCreateFn,
  MasterDataFormValues,
  MasterDataRow,
  MasterDataUpdateFn,
} from "@/types/master-data";
import { slugify } from "@/utils/format";

const masterDataFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  slug: z.string().trim().min(2).max(220).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  website: z.string().trim().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

interface MasterDataFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string;
  hasWebsite: boolean;
  editingRow: MasterDataRow | null;
  createAction: MasterDataCreateFn;
  updateAction: MasterDataUpdateFn;
  onSaved: () => void;
}

/**
 * Shared create/edit form for Companies, Categories, and Locations —
 * one dialog, driven by `editingRow` (`null` means "create mode").
 * Fields beyond name/slug/description are entity-specific — today only
 * `website` (Company), toggled via `hasWebsite` — so adding a fourth
 * master-data entity later only needs a new boolean flag here rather
 * than a whole new form component.
 */
export function MasterDataFormDialog({
  open,
  onOpenChange,
  entityLabel,
  hasWebsite,
  editingRow,
  createAction,
  updateAction,
  onSaved,
}: MasterDataFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const isEdit = Boolean(editingRow);

  const form = useForm<MasterDataFormValues>({
    resolver: zodResolver(masterDataFormSchema),
    defaultValues: { name: "", slug: "", description: "", website: "" },
  });

  const { control, handleSubmit, watch, setValue, setError, reset } = form;
  const watchedName = watch("name");

  // Reset the form to the row being edited (or a blank slate for
  // create) every time the dialog opens — Radix keeps the Dialog
  // mounted between opens, so this can't rely on the component
  // re-mounting the way a fresh route/page load would.
  useEffect(() => {
    if (!open) return;
    if (editingRow) {
      reset({
        name: editingRow.name,
        slug: editingRow.slug,
        description: editingRow.description ?? "",
        website: editingRow.website ?? "",
      });
      setSlugTouched(true);
    } else {
      reset({ name: "", slug: "", description: "", website: "" });
      setSlugTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the dialog opens/targets a different row
  }, [open, editingRow]);

  useEffect(() => {
    if (slugTouched) return;
    setValue("slug", slugify(watchedName || ""), { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-derive from the name field
  }, [watchedName, slugTouched]);

  async function onSubmit(values: MasterDataFormValues) {
    setIsSubmitting(true);
    try {
      const payload: MasterDataFormValues = {
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        website: hasWebsite ? values.website || null : null,
      };

      const result = isEdit ? await updateAction(editingRow!.id, payload) : await createAction(payload);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof MasterDataFormValues, { message });
          }
        }
        toast({ title: result.error ?? `Could not save the ${entityLabel.toLowerCase()}`, variant: "destructive" });
        return;
      }

      toast({ title: isEdit ? `${entityLabel} updated` : `${entityLabel} created`, variant: "success" });
      onOpenChange(false);
      onSaved();
    } catch {
      toast({ title: "Server error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${entityLabel}` : `Create ${entityLabel}`}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update this ${entityLabel.toLowerCase()}'s details.`
              : `Add a new ${entityLabel.toLowerCase()} used across job vacancies.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          <FormTextInput control={control} name="name" label={`${entityLabel} Name`} required />

          <Controller
            control={control}
            name="slug"
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                htmlFor="slug"
                label="Slug"
                description={
                  isEdit
                    ? "Slugs can't be changed after creation — this keeps the public URL stable."
                    : "Auto-generated — edit freely, or reset to the suggested value."
                }
                error={fieldState.error?.message}
              >
                <div className="flex gap-2">
                  <Input
                    {...field}
                    id="slug"
                    value={field.value ?? ""}
                    onFocus={() => setSlugTouched(true)}
                    aria-invalid={Boolean(fieldState.error)}
                    disabled={isEdit}
                  />
                  {!isEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Reset to auto-generated slug"
                      onClick={() => setSlugTouched(false)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </FormFieldWrapper>
            )}
          />

          {hasWebsite && <FormUrlInput control={control} name="website" label="Official Website" />}

          <FormTextarea control={control} name="description" label="Description" rows={4} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : `Create ${entityLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

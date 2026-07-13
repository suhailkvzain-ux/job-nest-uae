"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Advertisement } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  createAdvertisementAction,
  updateAdvertisementAction,
} from "@/actions/admin-advertisements.actions";
import { AdPreviewPanel } from "@/components/admin/advertisements/ad-preview-panel";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextInput } from "@/components/forms/form-text-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { FormUrlInput } from "@/components/forms/form-url-input";
import { Divider } from "@/components/layout/divider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  advertisementPositionEnum,
  createAdvertisementSchema,
  type CreateAdvertisementInput,
} from "@/lib/validations/advertisement";
import { humanizeEnumValue } from "@/utils/format";

const POSITION_OPTIONS = advertisementPositionEnum.options.map((value) => ({
  label: humanizeEnumValue(value),
  value,
}));

const DEVICE_OPTIONS = [
  { label: "All Devices", value: "ALL" },
  { label: "Desktop Only", value: "DESKTOP" },
  { label: "Mobile Only", value: "MOBILE" },
];

const AD_TYPE_OPTIONS = [
  { label: "Google AdSense", value: "ADSENSE" },
  { label: "Custom HTML", value: "CUSTOM_HTML" },
  { label: "Image Banner", value: "IMAGE_BANNER" },
];

const EMPTY_DEFAULTS: CreateAdvertisementInput = {
  name: "",
  position: "TOP_BANNER",
  device: "ALL",
  adType: "CUSTOM_HTML",
  status: "ACTIVE",
  adsenseClient: null,
  adsenseSlot: null,
  htmlCode: "",
  imageUrl: null,
  targetUrl: null,
  width: null,
  height: null,
  displayOrder: 0,
  startDate: null,
  endDate: null,
};

interface AdvertisementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAd: Advertisement | null;
  onSaved: () => void;
}

/**
 * Create/Edit dialog for one advertisement — every field from the spec
 * (Basic + AdSense/HTML/Image conditional section + scheduling +
 * status), plus a live preview panel. `adType` drives which of the
 * three creative sections is shown, per the spec's exact logic table;
 * hidden sections' fields are cleared before submit so switching type
 * never leaves stale AdSense IDs on a Custom HTML row or vice versa.
 */
export function AdvertisementFormDialog({ open, onOpenChange, editingAd, onSaved }: AdvertisementFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(editingAd);

  const form = useForm<CreateAdvertisementInput>({
    resolver: zodResolver(createAdvertisementSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const { control, handleSubmit, watch, reset, setError } = form;
  const watched = watch();

  useEffect(() => {
    if (!open) return;
    if (editingAd) {
      reset({
        name: editingAd.name,
        position: editingAd.position,
        device: editingAd.device,
        adType: editingAd.adType,
        status: editingAd.status,
        adsenseClient: editingAd.adsenseClient,
        adsenseSlot: editingAd.adsenseSlot,
        htmlCode: editingAd.htmlCode,
        imageUrl: editingAd.imageUrl,
        targetUrl: editingAd.targetUrl,
        width: editingAd.width,
        height: editingAd.height,
        displayOrder: editingAd.displayOrder,
        startDate: editingAd.startDate,
        endDate: editingAd.endDate,
      });
    } else {
      reset(EMPTY_DEFAULTS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the dialog opens/targets a different row
  }, [open, editingAd]);

  async function onSubmit(values: CreateAdvertisementInput) {
    setIsSubmitting(true);
    try {
      // Only send the fields relevant to the chosen type — keeps a row
      // from carrying stale AdSense IDs after being switched to Custom
      // HTML, or stale HTML after being switched to Image Banner.
      const payload: CreateAdvertisementInput = {
        ...values,
        adsenseClient: values.adType === "ADSENSE" ? values.adsenseClient : null,
        adsenseSlot: values.adType === "ADSENSE" ? values.adsenseSlot : null,
        htmlCode: values.adType === "CUSTOM_HTML" ? values.htmlCode : null,
        imageUrl: values.adType === "IMAGE_BANNER" ? values.imageUrl : null,
        targetUrl: values.adType === "IMAGE_BANNER" ? values.targetUrl : null,
      };

      const result = isEdit
        ? await updateAdvertisementAction(editingAd!.id, payload)
        : await createAdvertisementAction(payload);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof CreateAdvertisementInput, { message });
          }
        }
        toast({ title: result.error ?? "Could not save the advertisement", variant: "destructive" });
        return;
      }

      toast({ title: isEdit ? "Advertisement updated" : "Advertisement created", variant: "success" });
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Advertisement" : "Create Advertisement"}</DialogTitle>
          <DialogDescription>
            Configure where, when, and what renders in this ad slot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormTextInput control={control} name="name" label="Advertisement Name" required className="sm:col-span-2" />
            <FormSelect control={control} name="position" label="Position" required options={POSITION_OPTIONS} />
            <FormSelect control={control} name="device" label="Device" required options={DEVICE_OPTIONS} />
            <FormSelect control={control} name="adType" label="Advertisement Type" required options={AD_TYPE_OPTIONS} />
            <FormNumberInput control={control} name="displayOrder" label="Display Order" />
          </div>

          <Divider />

          {watched.adType === "ADSENSE" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormTextInput
                control={control}
                name="adsenseClient"
                label="Google AdSense Client ID"
                placeholder="ca-pub-1234567890123456"
                required
              />
              <FormTextInput control={control} name="adsenseSlot" label="Google AdSense Slot ID" placeholder="1234567890" required />
            </div>
          )}

          {watched.adType === "CUSTOM_HTML" && (
            <FormTextarea
              control={control}
              name="htmlCode"
              label="Custom HTML Code"
              description="Paste the ad network's embed snippet (Google Ad Manager, affiliate banners, or any future network's tag)."
              rows={8}
              required
              className="[&_textarea]:font-mono [&_textarea]:text-xs"
            />
          )}

          {watched.adType === "IMAGE_BANNER" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormUrlInput
                control={control}
                name="imageUrl"
                label="Image URL"
                description="Paste a hosted image URL."
                required
                className="sm:col-span-2"
              />
              <FormUrlInput control={control} name="targetUrl" label="Target URL" required className="sm:col-span-2" />
              <FormNumberInput control={control} name="width" label="Width (px)" />
              <FormNumberInput control={control} name="height" label="Height (px)" />
            </div>
          )}

          <Divider />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormDatePicker control={control} name="startDate" label="Start Date" description="Optional — leave blank to start immediately." />
            <FormDatePicker control={control} name="endDate" label="End Date" description="Optional — leave blank to run indefinitely." />
          </div>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">Active</span>
                  <p className="text-xs text-muted-foreground">Disabled ads never render, regardless of dates.</p>
                </div>
                <Switch
                  checked={field.value === "ACTIVE"}
                  onCheckedChange={(checked) => field.onChange(checked ? "ACTIVE" : "DISABLED")}
                />
              </div>
            )}
          />

          <AdPreviewPanel
            name={watched.name}
            position={watched.position}
            device={watched.device}
            adType={watched.adType}
            adsenseClient={watched.adsenseClient}
            adsenseSlot={watched.adsenseSlot}
            htmlCode={watched.htmlCode}
            imageUrl={watched.imageUrl}
            targetUrl={watched.targetUrl}
            width={watched.width}
            height={watched.height}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Advertisement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

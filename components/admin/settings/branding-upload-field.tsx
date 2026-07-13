"use client";

import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { uploadBrandingAssetAction } from "@/actions/admin-settings.actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { BrandingAssetKind } from "@/lib/validations/settings";

interface BrandingUploadFieldProps {
  kind: BrandingAssetKind;
  label: string;
  description: string;
  currentUrl: string;
  previewClassName: string;
}

/**
 * One upload widget per Branding asset (Logo/Favicon/Default OG Image).
 * Uploading and saving are the same step (see
 * `uploadBrandingAssetAction`'s doc comment) — there's no separate
 * "now click Save" for these three fields, since a file upload has
 * already committed to a specific file the moment it's chosen, unlike
 * a text field an admin might still be mid-edit on.
 */
export function BrandingUploadField({
  kind,
  label,
  description,
  currentUrl,
  previewClassName,
}: BrandingUploadFieldProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("file", file);

    const result = await uploadBrandingAssetAction(formData);
    setIsUploading(false);
    event.target.value = "";

    if (!result.success || !result.url) {
      toast({
        title: result.error ?? `Could not upload ${label.toLowerCase()}`,
        variant: "destructive",
      });
      return;
    }

    setPreviewUrl(result.url);
    toast({ title: `${label} updated`, variant: "success" });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 ${previewClassName}`}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={label}
              width={200}
              height={200}
              priority
              className="h-full w-full object-contain"
              unoptimized={previewUrl.endsWith(".svg")}
            />
          ) : (
            <span className="px-2 text-center text-[10px] text-muted-foreground">
              No {label.toLowerCase()} yet
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? "Uploading…" : "Upload New"}
        </Button>
      </div>
    </div>
  );
}

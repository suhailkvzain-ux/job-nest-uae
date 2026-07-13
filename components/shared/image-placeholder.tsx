import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Placeholder box for images that haven't loaded / don't exist yet. */
export function ImagePlaceholder({
  className,
  aspect = "video",
  label,
}: {
  className?: string;
  aspect?: "square" | "video" | "wide";
  label?: string;
}) {
  const aspectClass = { square: "aspect-square", video: "aspect-video", wide: "aspect-[21/9]" }[aspect];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground",
        aspectClass,
        className,
      )}
    >
      <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
      {label && <span className="text-xs">{label}</span>}
    </div>
  );
}

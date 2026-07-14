import { Briefcase } from "lucide-react";
import Image from "next/image";

/**
 * The site logo mark shown next to the site name in the Header and
 * Footer. Renders the admin's uploaded Branding "Logo" (`general.logoUrl`,
 * set via `/admin/settings` → Branding) when one exists, falling back to
 * the default briefcase glyph otherwise.
 *
 * The uploaded-logo case uses a height-constrained, auto-width box
 * (`h-9 w-auto`, no forced square/rounded clipping) rather than cropping
 * every logo into a fixed 36x36 rounded square — a wide/rectangular
 * logo would otherwise get squeezed or cut off. Only the built-in
 * fallback glyph uses the branded rounded-square treatment.
 *
 * `priority` is set deliberately: this mark is always above-the-fold in
 * a sticky header, so the default lazy-loading behavior only adds a
 * pointless delay (and, inside a Radix Tabs panel that mounts on
 * demand — see `BrandingUploadField`'s preview thumbnail — lazy-loading
 * can fail to ever resolve at all since the element's real position
 * isn't known until the tab becomes active).
 */
export function SiteBrandMark({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
  if (logoUrl) {
    return (
      <span className="relative flex h-12 w-auto shrink-0 items-center">
        <Image
          src={logoUrl}
          alt={name}
          width={160}
          height={48}
          className="h-12 w-auto max-w-[180px] object-contain"
          priority
          unoptimized={logoUrl.endsWith(".svg")}
        />
      </span>
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-soft">
      <Briefcase className="h-4.5 w-4.5" strokeWidth={2.25} />
    </span>
  );
}

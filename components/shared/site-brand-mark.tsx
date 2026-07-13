import { Briefcase } from "lucide-react";
import Image from "next/image";

/**
 * The little rounded-square mark shown next to the site name in the
 * Header and Footer. Renders the admin's uploaded Branding "Logo"
 * (`general.logoUrl`, set via `/admin/settings` → Branding) when one
 * exists, falling back to the default briefcase glyph otherwise —
 * previously the Header/Footer always hardcoded the briefcase icon and
 * never looked at `logoUrl` at all, so uploading a logo in Settings had
 * no visible effect anywhere on the public site.
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
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-soft">
        <Image
          src={logoUrl}
          alt={name}
          fill
          sizes="36px"
          className="object-contain"
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

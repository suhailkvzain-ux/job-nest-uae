import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Site favicon — served at `/icon`, auto-wired by Next.js into every
 * page's `<head>` via the file-convention (no manual `icons` metadata
 * needed). Renders the same briefcase brand mark used as the fallback
 * logo in the Header/Footer (see `components/shared/site-brand-mark.tsx`)
 * on the brand gradient background, so the browser tab icon matches the
 * site's actual logo instead of a generic auto-generated letter tile.
 * Used whenever Settings' Branding "Favicon" upload (`/admin/settings`)
 * hasn't been set yet — see `generateMetadata()`, which only overrides
 * this with an explicit `icons.icon` when `general.faviconUrl` is
 * actually configured.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
          borderRadius: 14,
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

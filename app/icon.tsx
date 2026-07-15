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
        <svg width="52" height="52" viewBox="0 0 160 160" fill="none">
          <path
            d="M108 24 L114 38 L128 42 L114 46 L108 60 L102 46 L88 42 L102 38 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          <path
            d="M69 62V54a8 8 0 0 1 8-8h6a8 8 0 0 1 8 8v8"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            width="60"
            height="46"
            x="29"
            y="62"
            rx="7"
            stroke="#ffffff"
            strokeWidth="7"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}

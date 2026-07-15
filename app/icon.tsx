import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Site favicon — served at `/icon`, auto-wired by Next.js into every
 * page's `<head>` via the file-convention (no manual `icons` metadata
 * needed). Renders the same J-mark used as the fallback
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
        <svg width="46" height="46" viewBox="0 0 200 200" fill="none">
          <path
            d="M55 30 H100 V130 a45 45 0 0 1 -90 0 v-14 h32 v12 a13 13 0 0 0 26 0 V62 H55 Z"
            fill="#ffffff"
          />
          <circle cx="128" cy="62" r="15" fill="#ffffff" opacity="0.85" />
          <path d="M112 82 L146 40 L156 46 L120 96 Z" fill="#ffffff" opacity="0.85" />
          <path
            d="M158 16 L163 30 L177 35 L163 40 L158 54 L153 40 L139 35 L153 30 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}

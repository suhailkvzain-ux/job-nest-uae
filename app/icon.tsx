import { ImageResponse } from "next/og";

import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Fallback favicon — served at `/icon`, auto-wired by Next.js into
 * every page's `<head>` via the file-convention (no manual `icons`
 * metadata needed). Used whenever Settings' Branding "Favicon" upload
 * (`/admin/settings`) hasn't been set yet — see `generateMetadata()`,
 * which only overrides this with an explicit `icons.icon` when
 * `general.faviconUrl` is actually configured.
 */
export default async function Icon() {
  const defaults = await getSiteMetadataDefaults();

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
          fontSize: 36,
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        {defaults.siteName.charAt(0)}
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from "next/og";

import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Fallback Open Graph image — served at `/opengraph-image`, generated
 * on the fly with `next/og`'s `ImageResponse` rather than a static file
 * in `public/` (this project has no `public/` directory with any
 * pre-made brand imagery). Used whenever a page's own Open Graph image
 * isn't set: `getSiteMetadataDefaults()` falls back to this exact route
 * when Settings' "Default Open Graph Image" (`/admin/settings` → SEO)
 * hasn't been uploaded yet, so sharing any link — even on a brand-new
 * install with zero configuration — always renders a real, branded
 * preview card instead of a broken image.
 */
export default async function OpengraphImage() {
  const defaults = await getSiteMetadataDefaults();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.16)",
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {defaults.siteName.charAt(0)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            {defaults.siteName}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            color: "rgba(255,255,255,0.88)",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {defaults.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}

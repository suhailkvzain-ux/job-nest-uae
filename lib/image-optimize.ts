import DOMPurify from "isomorphic-dompurify";
import sharp from "sharp";

import type { BrandingAssetKind } from "@/lib/validations/settings";

export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

/**
 * Server-side image optimization for the three Branding uploads — logo,
 * favicon, and default OG image — each resized to the dimensions that
 * asset is actually used at, so the admin can upload a large source
 * file straight from their computer without hand-resizing it first.
 * SVG uploads are passed through untouched: rasterizing a vector logo
 * to hit a pixel target would defeat the point of uploading an SVG in
 * the first place, and browsers already render SVG at any size for
 * free.
 */
export async function optimizeBrandingImage(
  kind: BrandingAssetKind,
  input: Buffer,
  mimeType: string,
): Promise<OptimizedImage> {
  if (mimeType === "image/svg+xml") {
    // Unlike the raster formats below, an SVG is never re-encoded by
    // sharp (rasterizing a vector logo would defeat the point of
    // uploading one), which means nothing else in this pipeline
    // strips an embedded `<script>`, an `onload`/`onerror` event
    // handler, or a `javascript:` URI from it before it's stored and
    // served back from a public URL. Sanitize it the same way
    // `lib/sanitize-html.ts` already sanitizes admin-authored ad HTML —
    // DOMPurify's `svg` profile keeps every legitimate vector element/
    // attribute (paths, gradients, `viewBox`, ...) and strips anything
    // capable of executing script.
    const sanitized = DOMPurify.sanitize(input.toString("utf-8"), {
      USE_PROFILES: { svg: true, svgFilters: true },
    });
    return { buffer: Buffer.from(sanitized, "utf-8"), contentType: "image/svg+xml", extension: "svg" };
  }

  const image = sharp(input, { failOn: "none" }).rotate(); // .rotate() with no args auto-orients from EXIF before any resize

  switch (kind) {
    case "logo":
      return {
        buffer: await image
          .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 88 })
          .toBuffer(),
        contentType: "image/webp",
        extension: "webp",
      };
    case "favicon":
      return {
        buffer: await image.resize(64, 64, { fit: "cover" }).png({ quality: 90 }).toBuffer(),
        contentType: "image/png",
        extension: "png",
      };
    case "ogImage":
      return {
        // 1200×630 is the standard Open Graph / Twitter Card image
        // ratio every major platform crops to — cropping to it here
        // means the preview never gets awkwardly re-cropped downstream.
        buffer: await image.resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82 }).toBuffer(),
        contentType: "image/jpeg",
        extension: "jpg",
      };
  }
}

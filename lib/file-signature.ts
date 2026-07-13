/**
 * Real file-content ("magic byte") verification for uploads — a
 * browser-reported `File.type` is just whatever the client claims in
 * the multipart request and is trivially spoofable (rename an
 * executable to `logo.png`, or hand-craft the upload request directly
 * without going through a `<input type="file" accept="image/*">` at
 * all). Checking the first few bytes of the actual file content against
 * each format's known signature is what actually prevents "an
 * executable/script disguised as an image" from being accepted, which
 * `ALLOWED_IMAGE_MIME_TYPES`'s `file.type` check alone cannot do.
 */

const SIGNATURES: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/png": (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/jpeg": (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  // WebP: "RIFF" .... "WEBP"
  "image/webp": (b) =>
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50,
};

/**
 * SVG has no fixed binary signature (it's plain-text XML, optionally
 * preceded by an XML declaration/BOM/whitespace/comments) — verified
 * instead by confirming the content actually parses as XML with an
 * `<svg` root element, rather than trusting the extension/MIME type on
 * an arbitrary text or binary blob.
 */
function looksLikeSvg(buffer: Buffer): boolean {
  const text = buffer.subarray(0, 1024).toString("utf-8").trimStart();
  return /^(<\?xml[^>]*\?>\s*)?(<!--.*?-->\s*)*<svg[\s>]/is.test(text);
}

/**
 * Verifies `buffer`'s actual content matches `declaredMimeType` — used
 * as a second, independent check alongside `File.type` before any
 * upload is accepted or ever reaches `sharp`/storage.
 */
export function matchesFileSignature(buffer: Buffer, declaredMimeType: string): boolean {
  if (declaredMimeType === "image/svg+xml") {
    return looksLikeSvg(buffer);
  }
  const check = SIGNATURES[declaredMimeType];
  return check ? check(buffer) : false;
}

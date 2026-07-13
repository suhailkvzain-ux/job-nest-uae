import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes admin-authored "Custom HTML" ad code before it's persisted.
 *
 * This is deliberately *not* a strip-everything sanitizer: legitimate ad
 * tags (Google Ad Manager, affiliate/banner networks, and anything a
 * future network needs) are almost always a `<script>` or `<iframe>`
 * snippet — stripping those would break the exact feature this module
 * exists for. `script`/`iframe` are explicitly allow-listed here, but
 * DOMPurify's default attribute rules stay in force underneath that,
 * which is what actually matters: inline event handlers (`onerror`,
 * `onload`, ...), `javascript:` URLs, and malformed/unclosed markup are
 * still stripped regardless of tag.
 *
 * This is defense-in-depth, not the only safeguard. The real XSS
 * boundary for this feature is twofold: (1) only the single
 * authenticated admin can ever write an Advertisement row — no visitor
 * input reaches this function, the same trust boundary every other
 * admin-authored rich-text field in this project already relies on —
 * and (2) at render time, `AdSlot` renders Custom HTML ads inside a
 * sandboxed `<iframe>` (`sandbox="allow-scripts allow-popups
 * allow-popups-to-escape-sandbox"`, deliberately without
 * `allow-same-origin`), so even HTML that slips past this sanitizer
 * runs in an opaque cross-origin context that cannot read the parent
 * page's cookies, localStorage, or DOM.
 */
export function sanitizeAdHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["script", "iframe", "ins"],
    ADD_ATTR: ["async", "crossorigin", "allowfullscreen", "loading", "sandbox", "scrolling", "frameborder"],
    FORCE_BODY: true,
  });
}

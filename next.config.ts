import type { NextConfig } from "next";

/**
 * Next.js configuration for Job Nest UAE.
 *
 * `headers()` (Phase 16) is this project's central security-header
 * enforcement point — applied to every route (public + admin, static +
 * dynamic) rather than only routes middleware happens to match, since
 * `middleware.ts`'s matcher is scoped to `/admin/:path*` and never runs
 * for the public site at all.
 */

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` on `script-src`/`style-src` is a deliberate,
 * documented trade-off rather than an oversight: this app renders
 * Google AdSense ad units (`components/ads/adsense-script.tsx` +
 * `AdCreative`'s `<ins>` tags), which inject their own inline scripts at
 * runtime in a way that's incompatible with a nonce/`strict-dynamic`
 * CSP without a much larger rework (and one this sandbox has no way to
 * verify against a real browser, since ads only render meaningfully on
 * an approved, live, deployed site — see `AdCreative`'s own doc
 * comment). Many components also set React inline `style={{...}}`
 * props (chart dimensions, ad slot sizing), which browsers treat as
 * `style-src`, not a separate nonce-able bucket, without CSP3's
 * `style-src-attr` split being universally supported yet. Every other
 * directive below is fully locked down: no `unsafe-eval`, no wildcard
 * `default-src`, `object-src` and `frame-ancestors` both `none`/`self`
 * only, and only the specific third-party hosts this app actually loads
 * from (Google's ad network, Supabase Storage) are allow-listed —
 * anything else is blocked by default.
 */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.googletagservices.com https://*.google.com https://*.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
  "frame-src 'self' https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
  // Defense-in-depth alongside CSP's `frame-ancestors 'none'` above —
  // older browsers that don't parse CSP3's `frame-ancestors` still get
  // clickjacking protection from this header.
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers from MIME-sniffing a response into executing as a
  // different content type than declared (e.g. treating an uploaded
  // "image" as executable script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Sends the full URL as a referrer only to this app's own origin;
  // cross-origin requests (e.g. following an outbound "Apply" link to
  // an employer's site) only get the origin, not the full path/query —
  // balances real analytics utility against leaking a visitor's exact
  // in-app navigation history to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This app never uses the browser's camera/microphone/geolocation
  // APIs, and explicitly opts out of the FLoC/Topics ad-targeting APIs
  // — defaults a legitimate embedder-of-us would never need, and
  // Google's own AdSense script doesn't require any of these to
  // function.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
  },
  ...(isProd
    ? [
        // Only sent over HTTPS in production — sending this over a
        // plain-HTTP dev server would be a no-op at best and a footgun
        // at worst (browsers ignore HSTS on non-HTTPS responses
        // anyway, but there's no reason to emit it locally).
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

/** Host(s) allowed to bypass Server Actions' built-in CSRF (Origin/Host) check — see `lib/csrf.ts` for the app-level re-check on top of this. */
function serverActionAllowedOrigins(): string[] {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return [];
  try {
    return [new URL(configured).host];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `isomorphic-dompurify` pulls in `jsdom`, whose transitive deps
  // (`@exodus/bytes`, `html-encoding-sniffer`, `whatwg-url`) ship as
  // ESM-only packages using modern `exports` conditions. Webpack's
  // production server bundle rewrites `require()` calls in a way that
  // breaks that resolution ("require() of ES Module ... not
  // supported"), crashing every route that actually invokes
  // `sanitizeAdHtml`/the SVG sanitizer at runtime (ad rendering,
  // branding uploads) with a 500. Marking the package external tells
  // Next to leave it out of the webpack bundle and `require()` it
  // directly from node_modules at request time instead, where Node's
  // own module resolution (which understands `exports` conditions
  // correctly) can load it.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Modern, smaller formats first — Next negotiates via the request's
    // `Accept` header and falls back to the source format automatically
    // for browsers that don't support either.
    formats: ["image/avif", "image/webp"],
    // Optimized image responses are immutable per unique query (url +
    // width + quality), so a long cache TTL is safe and avoids
    // re-optimizing the same asset on every request.
    minimumCacheTTL: 31536000,
  },
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins(),
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

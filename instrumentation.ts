/**
 * Next.js's `register()` startup hook (file-convention, no config flag
 * needed as of Next 15) — runs exactly once when a new server instance
 * boots, before any request is handled. This is the one, framework-
 * blessed place to validate required environment variables "at
 * startup" per the Phase 16 spec, rather than only discovering a
 * missing value the first time some deep code path happens to read it.
 *
 * Guarded to the Node.js runtime only: `register()` also fires once for
 * the Edge runtime (which `middleware.ts` runs under), and validating
 * server-only secrets there is both unnecessary (middleware never reads
 * them directly) and would need a different, edge-safe env story if it
 * ever did.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getServerEnv } = await import("@/lib/env");
    getServerEnv();
  }
}

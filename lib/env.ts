import "server-only";

import { z } from "zod";

/**
 * Every environment variable this app actually reads, validated once
 * at process startup (see `instrumentation.ts`) rather than discovered
 * one missing value at a time as different code paths happen to run —
 * a misconfigured deploy should fail loudly and immediately, with a
 * list of exactly what's wrong, not fail a random admin action an hour
 * later with a cryptic "Cannot read property of undefined."
 *
 * `import "server-only"` guarantees this module (and the real secret
 * values it reads) can never be pulled into a client bundle — Next.js
 * fails the build outright if a Client Component ever imports it,
 * directly or transitively.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_URL is required (your Supabase project URL)." })
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required." })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty."),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string({ required_error: "SUPABASE_SERVICE_ROLE_KEY is required (used server-side only, for Storage uploads)." })
    .min(1, "SUPABASE_SERVICE_ROLE_KEY cannot be empty."),
  DATABASE_URL: z
    .string({ required_error: "DATABASE_URL is required (pooled Postgres connection string)." })
    .min(1, "DATABASE_URL cannot be empty."),
  DIRECT_URL: z
    .string({ required_error: "DIRECT_URL is required (direct Postgres connection string, used for migrations)." })
    .min(1, "DIRECT_URL cannot be empty."),
  ADMIN_EMAIL: z
    .string({ required_error: "ADMIN_EMAIL is required — the one address every session/action is checked against." })
    .email("ADMIN_EMAIL must be a valid email address."),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL.")
    .default("http://localhost:3000"),
  // Optional: gates `app/api/cron/publish-scheduled-jobs/route.ts`. Not
  // required at startup since a deployment that doesn't use Vercel Cron
  // (or hasn't configured it yet) should still boot fine — the route
  // itself fails closed (401) whenever this is unset, so there's no
  // insecure default to worry about either way.
  CRON_SECRET: z.string().min(16, "CRON_SECRET should be a long random string.").optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Validates `process.env` against the schema above and throws one
 * aggregated, human-readable error listing every missing/invalid
 * variable if anything's wrong. Called once from `instrumentation.ts`
 * at server boot; safe to call again anywhere that wants typed,
 * guaranteed-present env access afterward (memoized, so re-validation
 * only happens once per process).
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".") || "(env)"}: ${issue.message}`).join("\n");
    throw new Error(
      `Invalid or missing environment variables:\n${issues}\n\nCheck your .env file against .env.example — the app cannot start safely without these.`,
    );
  }

  cached = parsed.data;
  return cached;
}

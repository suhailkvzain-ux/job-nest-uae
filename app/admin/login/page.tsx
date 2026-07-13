import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { siteConfig } from "@/constants/site";

/** Admin pages must never be indexed — this is a private operational surface, not public content. */
export const metadata: Metadata = {
  title: `Admin Login | ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

/**
 * The only entry point into the admin panel. No registration, no
 * "forgot password," no OAuth buttons — deliberately, per spec: this
 * project has exactly one administrator, created directly in Supabase.
 * `middleware.ts` redirects an already-authenticated admin away from
 * this page before it ever renders, and redirects everyone else here
 * from any other `/admin/*` route.
 */
interface AdminLoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="flex w-full max-w-sm flex-col gap-8 rounded-[20px] border border-border/60 bg-card p-8 shadow-soft-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-primary-foreground">
            JN
          </span>
          <h1 className="text-xl font-semibold text-foreground">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground">{siteConfig.name} — private dashboard</p>
        </div>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}

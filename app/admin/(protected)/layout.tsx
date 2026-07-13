import type { Metadata } from "next";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Toaster } from "@/components/shared/toaster";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Every admin page under this segment is private by definition, so
 * `noindex` is set once here rather than repeated on each stub/dashboard
 * page — a page can still override it, but none need to.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Shell for every authenticated admin route (`/admin/dashboard`,
 * `/admin/jobs`, ...) — desktop fixed sidebar + sticky top bar + content
 * area. `requireAdmin()` re-checks the session server-side (defense in
 * depth on top of `middleware.ts`) and supplies the admin's email to the
 * top bar. `/admin/login` deliberately lives outside this route group,
 * so it never gets this chrome.
 */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar adminEmail={user?.email ?? "Admin"} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}

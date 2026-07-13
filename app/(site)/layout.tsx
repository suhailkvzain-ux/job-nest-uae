import { Suspense } from "react";

import { AdsenseScript } from "@/components/ads/adsense-script";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getAllSettings } from "@/services/settings.service";

/**
 * Public marketing/site route group layout — Header + Footer, present on
 * every public page (home, /jobs, /categories, /locations, /companies
 * and all their sub-routes). Moved out of the true root layout in Phase
 * 8 so `/admin/*` can have its own dashboard chrome (sidebar + top bar)
 * instead of the public site's nav — Next.js only allows one root
 * `<html>/<body>` layout, so route groups are the standard way to give
 * different sections of the app different shells while sharing it.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getAllSettings();
  const logoUrl = settings.general.logoUrl || null;

  return (
    <>
      <AdsenseScript />
      {/* `useSearchParams()` inside `PageViewTracker` requires a Suspense
          boundary per Next.js App Router rules — this is a purely
          cosmetic/tracking concern, so a `null` fallback is correct: there's
          nothing to visibly show while the tracker "loads". */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <Header logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer logoUrl={logoUrl} />
    </>
  );
}

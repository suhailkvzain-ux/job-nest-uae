import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { fontSans } from "@/lib/fonts";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata();
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * True root layout — shared by literally everything, including
 * `/admin/*`. Deliberately bare (just providers + fonts): the public
 * site's Header/Footer now live in `app/(site)/layout.tsx`, and the
 * admin dashboard has its own sidebar/top-bar shell in
 * `app/admin/(protected)/layout.tsx`. Keeping this file free of any
 * section-specific chrome is what lets both sections coexist under one
 * Next.js app without the admin panel dragging in the public nav.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(fontSans.variable)} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        {/*
          Vercel Analytics + Speed Insights — zero-config on Vercel (both
          become real once the app is deployed there; locally/off-Vercel
          they no-op rather than error). This is the monitoring hook the
          Phase 15 spec asks for: Core Web Vitals (via Speed Insights) and
          traffic (via Analytics) both become visible in the Vercel
          dashboard with no further wiring, and both are cheap enough
          (small, deferred, non-blocking scripts) to not affect the
          metrics they're measuring.
        */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Container } from "@/components/layout/container";
import { SiteBrandMark } from "@/components/shared/site-brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { mainNav } from "@/constants/nav";
import { siteConfig } from "@/constants/site";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { cn } from "@/lib/utils";

/**
 * Sticky site header — glassmorphism surface once scrolled, and hides
 * itself when the user scrolls down (reappearing on scroll-up) so long
 * job listings don't lose screen space to a header that's always visible.
 * Mobile nav is a simple slide-down panel; a full off-canvas /
 * focus-trapped menu is a nice-to-have for a later pass.
 */
export function Header({ logoUrl }: { logoUrl?: string | null } = {}) {
  const scrolled = useScrollPosition();
  const direction = useScrollDirection();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hidden = scrolled && direction === "down" && !mobileOpen;

  return (
    <header
      className={cn(
        "sticky top-0 z-header w-full transition-transform duration-slow ease-out-expo",
        scrolled ? "glass" : "bg-transparent",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <Container className="flex h-18 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <SiteBrandMark logoUrl={logoUrl} name={siteConfig.shortName} />
          {!logoUrl && <span className="text-base">{siteConfig.shortName}</span>}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/jobs" className={cn(buttonVariants({ variant: "cta" }), "px-7")}>
            Browse Jobs
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass border-t border-border/60 md:hidden"
          aria-label="Mobile navigation"
        >
          <Container className="flex flex-col gap-1 py-4">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/jobs"
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants({ variant: "cta" }), "mt-2 justify-center")}
            >
              Browse Jobs
            </Link>
          </Container>
        </motion.nav>
      )}
    </header>
  );
}

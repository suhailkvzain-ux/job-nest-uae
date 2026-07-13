"use client";

import { motion } from "framer-motion";
import { Menu, X, Briefcase } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Container } from "@/components/layout/container";
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
export function Header() {
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
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-soft">
            <Briefcase className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <span className="text-base">{siteConfig.shortName}</span>
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

        <div className="hidden md:block">
          <Link href="/jobs" className={cn(buttonVariants({ size: "lg", variant: "cta" }))}>
            Browse Jobs
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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

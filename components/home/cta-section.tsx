import { ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { FadeUp } from "@/components/motion/motion-wrappers";
import { Heading } from "@/components/typography/heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Closing full-width CTA banner — a darker "night sky" panel (deep
 * navy-to-brand gradient + soft radial glow + faint star dots) with a
 * small hand-composed "launch" motif (a tilted rocket badge sitting on
 * soft cloud-like blobs, echoing a hand-illustrated banner) rather
 * than a flat gradient box with just text — the plain version of this
 * banner was one of the flattest, most "generated" -looking spots on
 * the page.
 */
export function CtaSection() {
  return (
    <Section>
      <Container>
        <FadeUp className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,hsl(230_45%_12%)_0%,hsl(var(--brand-start))_60%,hsl(var(--brand-end))_100%)] px-8 py-16 text-center shadow-soft-xl md:px-16 md:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_60%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(1.5px 1.5px at 20% 30%, white, transparent), radial-gradient(1.5px 1.5px at 70% 20%, white, transparent), radial-gradient(1.5px 1.5px at 85% 65%, white, transparent), radial-gradient(1.5px 1.5px at 40% 80%, white, transparent), radial-gradient(1.5px 1.5px at 55% 45%, white, transparent)",
            }}
            aria-hidden="true"
          />

          {/* Hand-composed launch motif — cloud blobs + a tilted rocket badge, static (no motion). */}
          <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
            <div className="absolute -right-6 bottom-4 h-24 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-16 bottom-0 h-16 w-28 rounded-full bg-white/10 blur-xl" />
            <div className="absolute right-10 top-8 flex h-16 w-16 -rotate-12 items-center justify-center rounded-3xl bg-white/15 shadow-soft-lg ring-1 ring-white/25 backdrop-blur-sm">
              <Rocket className="h-7 w-7 text-white" strokeWidth={1.75} />
            </div>
          </div>

          <div className="relative flex flex-col items-center gap-6">
            <Heading level="h2" as="h2" className="max-w-xl text-primary-foreground">
              Start Your Career Journey Today
            </Heading>
            <p className="max-w-md text-sm text-primary-foreground/80">
              Thousands of verified vacancies across every emirate — new ones added daily.
            </p>
            <Link
              href="/jobs"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 bg-white text-primary shadow-soft-lg hover:bg-white/90 hover:brightness-100",
              )}
            >
              Browse All Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}

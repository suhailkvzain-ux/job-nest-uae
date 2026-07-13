import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { FadeUp } from "@/components/motion/motion-wrappers";
import { Heading } from "@/components/typography/heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Closing full-width CTA banner — deliberately a darker "night sky"
 * panel (deep navy-to-brand gradient + soft radial glow + a few faint
 * star dots) rather than the same bright brand gradient used
 * elsewhere on the page, so it reads as a distinct closing moment
 * instead of "another purple box."
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

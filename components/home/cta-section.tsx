import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { FadeUp } from "@/components/motion/motion-wrappers";
import { Heading } from "@/components/typography/heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Closing full-width CTA banner. */
export function CtaSection() {
  return (
    <Section>
      <Container>
        <FadeUp className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-16 text-center shadow-soft-xl md:px-16 md:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-6">
            <Heading level="h2" as="h2" className="max-w-xl text-primary-foreground">
              Start Your Career Journey Today
            </Heading>
            <Link
              href="/jobs"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-primary shadow-soft-lg hover:bg-white/90 hover:brightness-100",
              )}
            >
              Browse All Jobs
            </Link>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}

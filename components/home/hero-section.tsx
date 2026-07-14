"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { HeroVisual } from "@/components/home/hero-visual";
import { QuickFilterChips } from "@/components/home/quick-filter-chips";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { FadeUp } from "@/components/motion/motion-wrappers";
import { AdvancedSearch, type AdvancedSearchValue } from "@/components/search/advanced-search";
import type { EntityOption } from "@/components/search/entity-search";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { CtaButton } from "@/components/shared/cta-button";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import type { HomeStats } from "@/services/stats.service";

interface HeroSectionProps {
  locations: EntityOption[];
  categories: EntityOption[];
  stats: HomeStats;
}

const STAT_ITEMS = (stats: HomeStats) => [
  { label: "Total Jobs", value: stats.totalJobs },
  { label: "Companies", value: stats.totalCompanies },
  { label: "Categories", value: stats.totalCategories },
  { label: "UAE Locations", value: stats.totalLocations },
];

/**
 * Homepage hero — an asymmetric two-column layout (headline/search on
 * the left, a composed illustration on the right) rather than the
 * previous centered, stacked layout. Centered-everything heroes are
 * the single most common "default template" pattern, so moving to a
 * two-column layout with a real focal visual (see `HeroVisual`) is
 * what actually reads as designed rather than generated. The stats
 * row is pulled out of the gradient band into its own white card that
 * overlaps the bottom edge — a deliberate "break out of the section"
 * detail that flat single-background heroes never have.
 */
export function HeroSection({ locations, categories, stats }: HeroSectionProps) {
  const router = useRouter();

  function handleSearch(value: AdvancedSearchValue) {
    const params = new URLSearchParams();
    if (value.query) params.set("query", value.query);
    if (value.locationSlug) params.set("location", value.locationSlug);
    if (value.categorySlug) params.set("category", value.categorySlug);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <Section spacing="none" className="relative overflow-hidden pb-28 pt-16 md:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-brand-gradient-radial" aria-hidden="true" />

      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <FadeUp className="flex flex-col items-start gap-5 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            UAE&apos;s Verified Job Board
          </span>
          <Heading level="display" as="h1" className="max-w-xl">
            Find <span className="text-gradient-brand">Verified Jobs</span> Across the UAE
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg text-lg">
            Job Nest UAE publishes only verified vacancies sourced directly from official
            employers — browse freely, then apply straight on the employer&apos;s own site or
            email.
          </Paragraph>

          <div className="w-full max-w-xl">
            <AdvancedSearch locations={locations} categories={categories} onSubmit={handleSearch} />
          </div>

          <QuickFilterChips className="justify-start" />

          <CtaButton onClick={() => router.push("/jobs")}>Browse All Jobs</CtaButton>
        </FadeUp>

        <FadeUp>
          <HeroVisual />
        </FadeUp>
      </Container>

      {/* Overlapping trust/stats card — breaks out of the gradient band
          the way a purely centered hero never does. */}
      <Container className="relative mt-14">
        <FadeUp className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-6 rounded-3xl border border-border/60 bg-card px-8 py-6 shadow-soft-xl sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            100% verified, zero recruitment fees
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {STAT_ITEMS(stats).map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <AnimatedCounter value={stat.value} className="text-h4 font-semibold text-foreground" suffix="+" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}

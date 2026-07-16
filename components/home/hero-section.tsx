"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

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
 * Homepage hero — three fully separate, stacked blocks with normal
 * spacing between them (no overlap): (1) a dark navy statement banner
 * with just the badge/headline/subtext, (2) a white search panel
 * below it (the functional "do something" surface), and (3) a plain
 * stats row further down. An earlier draft had the search panel
 * overlap the banner's bottom edge via a negative margin — that also
 * forced the banner to carry extra bottom padding to make room for
 * the overlap, which left a large dead-space gap. Normal margin-top
 * spacing between blocks avoids both problems.
 */
export function HeroSection({ locations, categories, stats }: HeroSectionProps) {
  const router = useRouter();

  function handleSearch(value: AdvancedSearchValue) {
    const params = new URLSearchParams();
    if (value.query) params.set("search", value.query);
    if (value.locationSlug) params.set("location", value.locationSlug);
    if (value.categorySlug) params.set("category", value.categorySlug);
    if (value.experience) params.set("experience", value.experience);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <Section spacing="none" className="relative pb-10 pt-4 md:pb-16 md:pt-10">
      <Container>
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-5 py-8 shadow-soft-xl sm:px-10 sm:py-12 md:rounded-[2rem] md:py-16">
          {/* Soft brand-tinted glows for depth, no motion */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" aria-hidden="true" />

          <FadeUp className="relative mx-auto flex max-w-2xl flex-col items-center gap-3 text-center sm:gap-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/15 backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              UAE&apos;s Verified Job Board
            </span>
            <Heading level="display" as="h1" className="text-2xl text-white sm:text-4xl md:text-5xl">
              Find <span className="text-gradient-brand">Verified Jobs</span> Across the UAE
            </Heading>
            <Paragraph className="max-w-lg text-sm text-white/70 sm:text-lg">
              Job For UAE publishes only verified vacancies sourced directly from official
              employers — browse freely, then apply straight on the employer&apos;s own site or
              email.
            </Paragraph>
          </FadeUp>
        </div>
      </Container>

      {/* Search panel — a fully separate white card below the banner,
          with normal spacing (no overlap), so the search bar stays
          fully legible and the two blocks read as distinct sections. */}
      <Container className="relative mt-4 sm:mt-6">
        <FadeUp className="mx-auto w-full max-w-4xl rounded-2xl bg-card p-4 shadow-soft-xl ring-1 ring-border/60 sm:rounded-3xl sm:p-8">
          <AdvancedSearch locations={locations} categories={categories} onSubmit={handleSearch} />
          <QuickFilterChips className="mt-3 justify-center sm:mt-4" />
          <div className="mt-4 flex justify-center sm:mt-5">
            <CtaButton onClick={() => router.push("/jobs")}>Browse All Jobs</CtaButton>
          </div>
        </FadeUp>
      </Container>

      {/* Stats row — a single compact strip (badge + numbers inline, no
          wrapping) so it reads as one line even on small phones instead
          of stacking into extra vertical scroll. */}
      <Container className="relative mt-4 sm:mt-6">
        <FadeUp className="mx-auto flex max-w-4xl items-center justify-between gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft-xl scrollbar-none sm:justify-center sm:gap-x-8 sm:rounded-3xl sm:px-8 sm:py-5">
          <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground sm:text-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-primary sm:h-4.5 sm:w-4.5" />
            <span className="whitespace-nowrap">Zero recruitment fees</span>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="flex shrink-0 items-center gap-x-4 sm:gap-x-8">
            {STAT_ITEMS(stats).map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <AnimatedCounter value={stat.value} className="text-sm font-semibold text-foreground sm:text-h4" suffix="+" />
                <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">
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

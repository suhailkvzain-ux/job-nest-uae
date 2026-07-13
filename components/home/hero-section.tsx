"use client";

import { Briefcase, MapPin, Search as SearchIcon, Sparkles } from "lucide-react";
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
 * Small floating icon badges scattered around the hero — purely
 * decorative, echoing the "digital growth" reference mood (orbiting
 * icon chips around a central visual) without copying any specific
 * illustration. Hidden below `lg` so they never crowd the headline on
 * small screens.
 */
function FloatingBadges() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      <span className="absolute right-[8%] top-6 flex h-12 w-12 animate-float items-center justify-center rounded-2xl bg-card shadow-soft-lg ring-1 ring-border/60">
        <Briefcase className="h-5 w-5 text-primary" />
      </span>
      <span
        className="absolute left-[10%] top-16 flex h-11 w-11 animate-float items-center justify-center rounded-full bg-card shadow-soft-lg ring-1 ring-border/60"
        style={{ animationDelay: "0.6s" }}
      >
        <SearchIcon className="h-4.5 w-4.5 text-badge-green-foreground" />
      </span>
      <span
        className="absolute right-[16%] bottom-2 flex h-10 w-10 animate-float items-center justify-center rounded-2xl bg-card shadow-soft-lg ring-1 ring-border/60"
        style={{ animationDelay: "1.2s" }}
      >
        <MapPin className="h-4 w-4 text-badge-orange-foreground" />
      </span>
      <span
        className="absolute left-[6%] bottom-10 flex h-9 w-9 animate-float items-center justify-center rounded-full bg-card shadow-soft-lg ring-1 ring-border/60"
        style={{ animationDelay: "1.8s" }}
      >
        <Sparkles className="h-4 w-4 text-badge-purple-foreground" />
      </span>
    </div>
  );
}

/**
 * Homepage hero — headline, search, quick filter chips, and the animated
 * live-stats row. A Client Component only because the search bar needs
 * `useRouter` to navigate to `/jobs` with the chosen query params, and
 * the stat counters animate on scroll into view.
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
    <Section spacing="none" className="relative overflow-hidden pb-20 pt-16 md:pt-24">
      <div
        className="pointer-events-none absolute inset-0 bg-brand-gradient-radial"
        aria-hidden="true"
      />
      <FloatingBadges />
      <Container className="relative flex flex-col items-center gap-8 text-center">
        <FadeUp className="flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            UAE&apos;s Verified Job Board
          </span>
          <Heading level="display" as="h1" className="max-w-3xl">
            Find <span className="text-gradient-brand">Verified Jobs</span> Across the UAE
          </Heading>
          <Paragraph tone="secondary" className="max-w-xl text-lg">
            Job Nest UAE publishes only verified vacancies sourced directly from official
            employers — browse freely, then apply straight on the employer&apos;s own site or
            email.
          </Paragraph>
        </FadeUp>

        <FadeUp className="w-full max-w-3xl">
          <AdvancedSearch locations={locations} categories={categories} onSubmit={handleSearch} />
        </FadeUp>

        <FadeUp>
          <QuickFilterChips />
        </FadeUp>

        <FadeUp>
          <CtaButton onClick={() => router.push("/jobs")}>Browse All Jobs</CtaButton>
        </FadeUp>

        <FadeUp className="grid w-full max-w-2xl grid-cols-2 gap-6 pt-6 sm:grid-cols-4">
          {STAT_ITEMS(stats).map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <AnimatedCounter
                value={stat.value}
                className="text-h3 font-semibold text-foreground"
                suffix="+"
              />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </FadeUp>
      </Container>
    </Section>
  );
}

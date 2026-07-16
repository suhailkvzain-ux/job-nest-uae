import { Building2 } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { AvatarFallback, Avatar as UiAvatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompanyWithJobCount } from "@/services/companies.service";

const AVATAR_TINTS = [
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
];

function tintForName(name: string) {
  const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_TINTS[sum % AVATAR_TINTS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Homepage "Top Hiring Companies" — only companies currently hiring
 * (see `getCompaniesWithJobCounts()`). Rendered as a single
 * horizontally swipeable row of compact chips (logo + name + job
 * count) instead of a wrapping grid, so it stays a single line of
 * scroll rather than stacking rows down the page.
 */
export function PopularCompaniesSection({ companies }: { companies: CompanyWithJobCount[] }) {
  return (
    <Section className="bg-surface" id="companies" aria-labelledby="companies-heading">
      <Container className="flex flex-col gap-5 sm:gap-10">
        <div className="flex flex-col items-center gap-1.5 text-center sm:gap-3">
          <Heading level="h2" as="h2" id="companies-heading" className="text-xl sm:text-h2">
            Top Hiring Companies
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg text-xs sm:text-body">
            Employers actively hiring on Job For UAE right now.
          </Paragraph>
        </div>

        {companies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies hiring yet"
            description="Companies with live vacancies will appear here."
          />
        ) : (
          <>
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-none sm:gap-4 sm:px-0 lg:mx-0">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.slug}`}
                  className="group flex w-[92px] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card px-2 py-3 text-center transition-shadow hover:shadow-soft-lg sm:w-[120px] sm:gap-2.5 sm:py-4"
                >
                  <UiAvatar className="h-10 w-10 rounded-2xl sm:h-14 sm:w-14">
                    <AvatarFallback className={cn("rounded-2xl text-xs font-semibold sm:text-base", tintForName(company.name))}>
                      {initials(company.name)}
                    </AvatarFallback>
                  </UiAvatar>
                  <span className="line-clamp-1 text-[11px] font-medium text-foreground group-hover:text-primary sm:text-sm">
                    {company.name}
                  </span>
                  {typeof company.jobCount === "number" && (
                    <span className="text-[10px] text-muted-foreground sm:text-xs">{company.jobCount} Jobs</span>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex justify-center">
              <Link href="/companies" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                View All Companies
              </Link>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}

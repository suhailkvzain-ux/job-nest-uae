import { Banknote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLd } from "@/components/shared/json-ld";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { Card, CardContent } from "@/components/ui/card";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { getSalaryRangesByCategory } from "@/services/categories.service";
import { formatNumber } from "@/utils/format";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "UAE Salary Guide",
    description:
      "Average salary ranges by job category in the UAE, calculated live from currently published vacancies on Job For UAE.",
    path: "/salary-guide",
  });
}

/**
 * Salary Guide — average monthly salary range per category, computed
 * live from currently published job listings (see
 * `getSalaryRangesByCategory()`), not hard-coded market-report numbers
 * that go stale. Categories with no live listings are simply left out
 * rather than shown with a fabricated range.
 */
export default async function SalaryGuidePage() {
  const [ranges, defaults] = await Promise.all([getSalaryRangesByCategory(), getSiteMetadataDefaults()]);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: defaults.baseUrl },
          { name: "Salary Guide", url: `${defaults.baseUrl}/salary-guide` },
        ])}
      />
      <Section spacing="compact">
        <Container className="flex flex-col gap-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Salary Guide" }]} />
          <div className="flex flex-col items-center gap-2 text-center">
            <Heading level="h2" as="h1">
              UAE Salary Guide
            </Heading>
            <Paragraph tone="secondary" className="max-w-2xl">
              Average monthly salary ranges by category, calculated live from vacancies currently
              published on Job For UAE — not a static market report, so figures move as new jobs
              are added.
            </Paragraph>
          </div>

          {ranges.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="Not enough data yet"
              description="Salary ranges appear here once enough jobs with salary information are published."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ranges.map((range) => (
                <Link key={range.id} href={`/categories/${range.slug}`} className="block h-full">
                  <Card className="h-full transition-shadow hover:shadow-soft-lg">
                    <CardContent className="flex flex-col gap-2 p-5">
                      <span className="font-semibold text-foreground">{range.name}</span>
                      <span className="text-lg font-semibold text-primary">
                        AED {formatNumber(Math.round(range.avgMin ?? 0))}
                        {range.avgMax ? ` – ${formatNumber(Math.round(range.avgMax))}` : "+"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Based on {range.jobCount} live {range.jobCount === 1 ? "vacancy" : "vacancies"} · per month
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Figures are simple averages of the salary ranges employers listed on published
              vacancies, and will vary by experience, company, and specific role. Use them as a
              general guide alongside the individual listing details, not a guarantee of offer.
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}

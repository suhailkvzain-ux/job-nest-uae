import { Building2 } from "lucide-react";
import type { Metadata } from "next";

import { CompanyCard } from "@/components/cards/company-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { DirectorySearchBar } from "@/components/shared/directory-search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { getAllCompaniesWithJobCounts } from "@/services/companies.service";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Companies Hiring in the UAE",
    description:
      "Browse every employer currently hiring on Job For UAE, sorted A–Z. No logos — every company gets a clean, auto-generated initials avatar.",
    path: "/companies",
  });
}

interface CompaniesPageProps {
  searchParams: Promise<{ search?: string }>;
}

/**
 * Companies directory — only companies with at least one live published
 * job (unlike the categories/locations directories, which show every
 * reference row), sorted alphabetically, with a server-rendered,
 * URL-synced name search.
 */
export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const { search } = await searchParams;
  const companies = await getAllCompaniesWithJobCounts();

  const filtered = search
    ? companies.filter((company) => company.name.toLowerCase().includes(search.toLowerCase()))
    : companies;

  return (
    <Section spacing="default">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Heading level="h1" as="h1">
            Companies Hiring Now
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
            Every employer currently hiring on Job For UAE, sorted A–Z.
          </Paragraph>
          <DirectorySearchBar placeholder="Search companies…" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={search ? `No companies match "${search}"` : "No companies hiring yet"}
            description={search ? "Try a different search term." : "Companies with live vacancies will appear here."}
          />
        ) : (
          <Grid cols={{ base: 2, sm: 3, lg: 4 }} gap="md">
            {filtered.map((company) => (
              <CompanyCard
                key={company.id}
                name={company.name}
                slug={company.slug}
                jobCount={company.jobCount}
                website={company.website}
              />
            ))}
          </Grid>
        )}
      </Container>
    </Section>
  );
}

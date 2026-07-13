import { CompanyCard } from "@/components/cards/company-card";
import { Grid } from "@/components/layout/grid";
import { Heading } from "@/components/typography/heading";
import type { CompanyWithJobCount } from "@/services/companies.service";

/** "Related companies" rail on the company detail page — feed it `getRelatedCompanies()`. */
export function RelatedCompaniesSection({ companies }: { companies: CompanyWithJobCount[] }) {
  if (companies.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <Heading level="h4">Related Companies</Heading>
      <Grid cols={{ base: 2, sm: 3, lg: 6 }} gap="md">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            name={company.name}
            slug={company.slug}
            jobCount={company.jobCount}
            website={company.website}
          />
        ))}
      </Grid>
    </section>
  );
}

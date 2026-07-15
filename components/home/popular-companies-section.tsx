import { Building2 } from "lucide-react";
import Link from "next/link";

import { CompanyCard } from "@/components/cards/company-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerItem } from "@/components/motion/motion-wrappers";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompanyWithJobCount } from "@/services/companies.service";

/**
 * Homepage "Popular Companies" — only companies currently hiring (see
 * `getCompaniesWithJobCounts()`). No logos anywhere in this project;
 * `CompanyCard` generates initials avatars automatically.
 */
export function PopularCompaniesSection({ companies }: { companies: CompanyWithJobCount[] }) {
  return (
    <Section className="bg-surface" id="companies" aria-labelledby="companies-heading">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Heading level="h2" as="h2" id="companies-heading">
            Popular Companies
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
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
            <StaggerContainer>
              <Grid cols={{ base: 2, sm: 3, lg: 4 }} gap="md">
                {companies.map((company) => (
                  <StaggerItem key={company.id}>
                    <CompanyCard name={company.name} slug={company.slug} jobCount={company.jobCount} website={company.website} />
                  </StaggerItem>
                ))}
              </Grid>
            </StaggerContainer>

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

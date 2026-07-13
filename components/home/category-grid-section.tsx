import { Layers } from "lucide-react";

import { CategoryCard } from "@/components/cards/category-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerItem } from "@/components/motion/motion-wrappers";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import type { CategoryWithJobCount } from "@/services/categories.service";

/** Homepage "Browse by Category" grid. */
export function CategoryGridSection({ categories }: { categories: CategoryWithJobCount[] }) {
  return (
    <Section className="bg-surface" id="categories" aria-labelledby="categories-heading">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Heading level="h2" as="h2" id="categories-heading">
            Browse by Category
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
            Find vacancies in the industry and job function you&apos;re targeting.
          </Paragraph>
        </div>

        {categories.length === 0 ? (
          <EmptyState icon={Layers} title="No categories yet" description="Categories will appear here once added." />
        ) : (
          <StaggerContainer>
            <Grid cols={{ base: 2, sm: 3, lg: 5 }} gap="md">
              {categories.map((category) => (
                <StaggerItem key={category.id}>
                  <CategoryCard name={category.name} slug={category.slug} jobCount={category.jobCount} />
                </StaggerItem>
              ))}
            </Grid>
          </StaggerContainer>
        )}
      </Container>
    </Section>
  );
}

import { Layers } from "lucide-react";

import { CategoryCard, type CategoryCardProps } from "@/components/cards/category-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerItem } from "@/components/motion/motion-wrappers";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryWithJobCount } from "@/services/categories.service";
import Link from "next/link";

const ACCENT_CYCLE: NonNullable<CategoryCardProps["accent"]>[] = ["purple", "green", "blue", "orange"];

/** Homepage "Browse by Category" grid. */
export function CategoryGridSection({ categories }: { categories: CategoryWithJobCount[] }) {
  return (
    <Section className="bg-surface" id="categories" aria-labelledby="categories-heading">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="rounded-full bg-brand-gradient-soft px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Explore Opportunities
          </span>
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
          <>
            <StaggerContainer>
              <Grid cols={{ base: 2, sm: 3, lg: 5 }} gap="md">
                {categories.map((category, index) => (
                  <StaggerItem key={category.id}>
                    <CategoryCard
                      name={category.name}
                      slug={category.slug}
                      jobCount={category.jobCount}
                      accent={ACCENT_CYCLE[index % ACCENT_CYCLE.length]}
                    />
                  </StaggerItem>
                ))}
              </Grid>
            </StaggerContainer>

            <div className="flex justify-center">
              <Link href="/categories" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                View All Categories
              </Link>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}

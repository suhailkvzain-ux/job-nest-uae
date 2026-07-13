import { Layers } from "lucide-react";
import type { Metadata } from "next";

import { CategoryCard } from "@/components/cards/category-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { DirectorySearchBar } from "@/components/shared/directory-search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { constructMetadata } from "@/lib/seo";
import { getCategoriesWithJobCounts } from "@/services/categories.service";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Browse Job Categories",
  description:
    "Explore verified UAE job vacancies by industry and job function — from engineering to hospitality, all sorted A–Z.",
  path: "/categories",
});

interface CategoriesPageProps {
  searchParams: Promise<{ search?: string }>;
}

/**
 * Categories directory — every category (including ones with zero live
 * jobs, same "show every reference row" rule the homepage grid uses),
 * sorted alphabetically, with a server-rendered, URL-synced name search.
 */
export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { search } = await searchParams;
  const categories = await getCategoriesWithJobCounts();

  const filtered = search
    ? categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  return (
    <Section spacing="default">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Heading level="h1" as="h1">
            Job Categories
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
            Browse verified vacancies by industry and job function across the UAE.
          </Paragraph>
          <DirectorySearchBar placeholder="Search categories…" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Layers}
            title={search ? `No categories match "${search}"` : "No categories yet"}
            description={
              search ? "Try a different search term." : "Categories will appear here once added."
            }
          />
        ) : (
          <Grid cols={{ base: 2, sm: 3, lg: 5 }} gap="md">
            {filtered.map((category) => (
              <CategoryCard key={category.id} name={category.name} slug={category.slug} jobCount={category.jobCount} />
            ))}
          </Grid>
        )}
      </Container>
    </Section>
  );
}

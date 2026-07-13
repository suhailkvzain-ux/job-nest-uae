import { CategoryCard } from "@/components/cards/category-card";
import { Grid } from "@/components/layout/grid";
import { Heading } from "@/components/typography/heading";
import type { CategoryWithJobCount } from "@/services/categories.service";

/** "Related categories" rail on the category detail page — feed it `getRelatedCategories()`. */
export function RelatedCategoriesSection({ categories }: { categories: CategoryWithJobCount[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <Heading level="h4">Related Categories</Heading>
      <Grid cols={{ base: 2, sm: 3, lg: 6 }} gap="md">
        {categories.map((category) => (
          <CategoryCard key={category.id} name={category.name} slug={category.slug} jobCount={category.jobCount} />
        ))}
      </Grid>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/categories/category-form";
import { getCategoryById } from "@/services/categories.service";

export const metadata: Metadata = { title: "Edit Category | Admin" };
export const dynamic = "force-dynamic";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Edit Category</h1>
        <p className="text-sm text-muted-foreground">Update "{category.name}".</p>
      </div>
      <CategoryForm
        mode="edit"
        categoryId={category.id}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon ?? "briefcase",
          displayOrder: category.displayOrder,
          isActive: category.isActive,
          featured: category.featured,
          popular: category.popular,
          showOnHomepage: category.showOnHomepage,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          seoKeywords: category.seoKeywords,
        }}
      />
    </div>
  );
}

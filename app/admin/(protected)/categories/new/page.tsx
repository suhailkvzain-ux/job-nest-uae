import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/categories/category-form";

export const metadata: Metadata = { title: "Add Category | Admin" };

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Add Category</h1>
        <p className="text-sm text-muted-foreground">Create a new job category.</p>
      </div>
      <CategoryForm mode="create" />
    </div>
  );
}

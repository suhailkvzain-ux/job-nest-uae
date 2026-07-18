"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteCategoryAction,
  duplicateCategoryAction,
  moveCategoryAction,
  toggleCategoryFieldAction,
} from "@/actions/admin-categories.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { getCategoryIcon } from "@/lib/icons/category-icons";
import type { CategoryWithJobCount } from "@/services/categories.service";
import { formatNumber } from "@/utils/format";

/** The premium card grid from the reference spec — icon, name, description, job count, badges, and full action set (Move Up/Down, Feature/Unfeature, Hide/Show, Duplicate, Delete). */
export function CategoryGrid({ categories }: { categories: CategoryWithJobCount[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithJobCount | null>(null);

  function runAction(label: string, action: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast({ title: label, variant: "success" });
        router.refresh();
      } else {
        toast({ title: "Action failed", description: result.error, variant: "destructive" });
      }
    });
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-16 text-center">
        <p className="text-sm text-muted-foreground">No categories found.</p>
        <Button asChild size="sm">
          <Link href="/admin/categories/new">Create Category</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <Card key={category.id} className="transition-transform hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground">Order {category.displayOrder}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {category.name}
                  </Link>
                  {category.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{category.description}</p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(category.jobCount)} Jobs
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {category.featured && (
                    <Badge className="gap-1 bg-badge-orange text-badge-orange-foreground">Featured</Badge>
                  )}
                  {category.popular && (
                    <Badge className="gap-1 bg-badge-purple text-badge-purple-foreground">Popular</Badge>
                  )}
                  <Badge variant={category.isActive ? "success" : "outline"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-1 border-t border-border/60 pt-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Move up"
                    disabled={index === 0 || isPending}
                    onClick={() => runAction("Order updated", () => moveCategoryAction(category.id, "up"))}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Move down"
                    disabled={index === categories.length - 1 || isPending}
                    onClick={() => runAction("Order updated", () => moveCategoryAction(category.id, "down"))}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" asChild>
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={category.featured ? "Unfeature" : "Feature"}
                    disabled={isPending}
                    onClick={() =>
                      runAction(category.featured ? "Unfeatured" : "Featured", () =>
                        toggleCategoryFieldAction(category.id, "featured", !category.featured),
                      )
                    }
                  >
                    <Star className={`h-4 w-4 ${category.featured ? "fill-current text-badge-orange-foreground" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={category.isActive ? "Hide" : "Show"}
                    disabled={isPending}
                    onClick={() =>
                      runAction(category.isActive ? "Hidden" : "Shown", () =>
                        toggleCategoryFieldAction(category.id, "isActive", !category.isActive),
                      )
                    }
                  >
                    {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Duplicate"
                    disabled={isPending}
                    onClick={() => runAction("Category duplicated", () => duplicateCategoryAction(category.id))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This category will be removed. Jobs using this category should be reassigned before
              deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) return;
                const id = deleteTarget.id;
                setDeleteTarget(null);
                runAction("Category deleted", () => deleteCategoryAction(id));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

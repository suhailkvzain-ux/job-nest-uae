"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/admin-categories.actions";
import { CategoryIconPicker } from "@/components/admin/categories/category-icon-picker";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { FormTextInput } from "@/components/forms/form-text-input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getCategoryIcon } from "@/lib/icons/category-icons";
import { createCategorySchema, type CreateCategoryInput } from "@/lib/validations/category";
import { slugify } from "@/utils/format";

const EMPTY_DEFAULTS: CreateCategoryInput = {
  name: "",
  description: null,
  icon: "briefcase",
  displayOrder: 0,
  isActive: true,
  featured: false,
  popular: false,
  showOnHomepage: false,
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
  slug: "",
};

interface CategoryFormProps {
  mode: "create" | "edit";
  categoryId?: string;
  defaultValues?: Partial<CreateCategoryInput>;
}

/** Shared Add/Edit Category form — live preview card on the right, matching the reference spec exactly. */
export function CategoryForm({ mode, categoryId, defaultValues }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
    mode: "onBlur",
  });

  const { control, handleSubmit, watch, setValue, setError, formState } = form;

  const watchedName = watch("name");
  const watchedIcon = watch("icon");
  const watchedDescription = watch("description");
  const watchedFeatured = watch("featured");
  const watchedIsActive = watch("isActive");

  if (!slugTouched) {
    const suggested = slugify(watchedName ?? "");
    if (suggested !== watch("slug")) setValue("slug", suggested, { shouldDirty: false });
  }

  const PreviewIcon = getCategoryIcon(watchedIcon);

  async function onSubmit(data: CreateCategoryInput) {
    setIsSubmitting(true);
    try {
      const result =
        mode === "create"
          ? await createCategoryAction(data)
          : await updateCategoryAction(categoryId!, data);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof CreateCategoryInput, { message });
          }
        }
        toast({ title: result.error ?? "Could not save the category", variant: "destructive" });
        return;
      }

      toast({
        title: mode === "create" ? "Category created" : "Category updated",
        variant: "success",
      });
      router.push("/admin/categories");
    } catch {
      toast({ title: "Server error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onDelete() {
    if (!categoryId) return;
    setIsDeleting(true);
    const result = await deleteCategoryAction(categoryId);
    setIsDeleting(false);
    setDeleteOpen(false);
    if (result.success) {
      toast({ title: "Category deleted", variant: "success" });
      router.push("/admin/categories");
    } else {
      toast({ title: result.error ?? "Could not delete the category", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FormTextInput control={control} name="name" label="Category Name" required />

            <Controller
              control={control}
              name="slug"
              render={({ field, fieldState }) => (
                <FormFieldWrapper
                  htmlFor="slug"
                  label="Slug"
                  description="Auto-generated from the category name — edit freely, or reset."
                  error={fieldState.error?.message}
                >
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      id="slug"
                      value={field.value ?? ""}
                      onFocus={() => setSlugTouched(true)}
                      aria-invalid={Boolean(fieldState.error)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Reset to auto-generated slug"
                      onClick={() => setSlugTouched(false)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </FormFieldWrapper>
              )}
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Category Icon</span>
              <p className="text-xs text-muted-foreground">Choose an icon to represent this category</p>
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-muted">
                      <PreviewIcon className="h-5 w-5 text-foreground" />
                    </div>
                    <CategoryIconPicker value={field.value} onChange={field.onChange} />
                  </div>
                )}
              />
            </div>

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <FormFieldWrapper
                  htmlFor="description"
                  label="Description (Optional)"
                  error={fieldState.error?.message}
                >
                  <Textarea
                    {...field}
                    id="description"
                    value={field.value ?? ""}
                    maxLength={300}
                    rows={4}
                    placeholder="Enter category description..."
                  />
                  <span className="mt-1 block text-right text-xs text-muted-foreground">
                    {(field.value ?? "").length} / 300
                  </span>
                </FormFieldWrapper>
              )}
            />

            <FormNumberInput
              control={control}
              name="displayOrder"
              label="Display Order"
              description="Categories will be displayed in this order"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visibility & Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormSwitch control={control} name="isActive" label="Active" description="Visible on the public site" />
            <FormSwitch control={control} name="featured" label="Featured Category" />
            <FormSwitch control={control} name="popular" label="Popular Category" />
            <FormSwitch control={control} name="showOnHomepage" label="Show On Homepage" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormTextInput control={control} name="seoTitle" label="SEO Title" className="sm:col-span-2" />
            <FormTextInput
              control={control}
              name="seoDescription"
              label="SEO Description"
              className="sm:col-span-2"
            />
            <FormTextInput control={control} name="seoKeywords" label="SEO Keywords" className="sm:col-span-2" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PreviewIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{watchedName || "Category Name"}</span>
                  <span className="text-xs text-muted-foreground">
                    {watchedDescription || "Category description appears here"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedFeatured && <Badge className="bg-badge-orange text-badge-orange-foreground">Featured</Badge>}
                <Badge variant={watchedIsActive ? "success" : "outline"}>
                  {watchedIsActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <Button type="button" className="w-full gap-2" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {mode === "create" ? "Add Category" : "Update Category"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/admin/categories")}>
              Cancel
            </Button>
            {mode === "edit" && categoryId && (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This category will be removed. Jobs using this category should be reassigned before
              deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

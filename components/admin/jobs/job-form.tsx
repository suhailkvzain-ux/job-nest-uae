"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { JobStatus } from "@prisma/client";
import {
  CalendarClock,
  Loader2,
  RotateCcw,
  Save,
  Send,
  Archive as ArchiveIcon,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { createCategoryAction } from "@/actions/admin-categories.actions";
import { createCompanyAction } from "@/actions/admin-companies.actions";
import {
  archiveJobAction,
  createJobAction,
  publishJobAction,
  scheduleJobAction,
  updateJobAction,
} from "@/actions/admin-jobs.actions";
import { JobSeoPreview } from "@/components/admin/jobs/job-seo-preview";
import { JobStatusBadge } from "@/components/badges/status-badges";
import { FormCombobox } from "@/components/forms/form-combobox";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormEmailInput } from "@/components/forms/form-email-input";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormRichTextEditor } from "@/components/forms/form-rich-text-editor";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { FormTagsInput } from "@/components/forms/form-tags-input";
import { FormTextInput } from "@/components/forms/form-text-input";
import { FormUrlInput } from "@/components/forms/form-url-input";
import { Divider } from "@/components/layout/divider";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { siteConfig } from "@/constants/site";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { employmentTypeEnum, createJobSchema, type CreateJobInput } from "@/lib/validations/job";
import { slugify } from "@/utils/format";

export interface JobFormOption {
  id: string;
  name: string;
}

interface JobFormProps {
  mode: "create" | "edit";
  jobId?: string;
  currentStatus?: JobStatus;
  defaultValues?: Partial<CreateJobInput>;
  companies: JobFormOption[];
  categories: JobFormOption[];
  locations: JobFormOption[];
}

const EMPLOYMENT_TYPE_OPTIONS = employmentTypeEnum.options.map((value) => ({
  label: value
    .toLowerCase()
    .split("_")
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" "),
  value,
}));

const EMPTY_DEFAULTS: CreateJobInput = {
  title: "",
  description: "",
  responsibilities: null,
  requirements: null,
  benefits: null,
  companyId: "",
  categoryId: "",
  locationId: "",
  area: null,
  employmentType: "FULL_TIME",
  experience: null,
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: "AED",
  education: null,
  visaStatus: null,
  nationality: null,
  languages: [],
  vacancies: 1,
  officialWebsite: null,
  officialEmail: null,
  applicationDeadline: null,
  status: "DRAFT",
  featured: false,
  verified: false,
  metaTitle: null,
  metaDescription: null,
  ogTitle: null,
  ogDescription: null,
  slug: "",
};

type PublishIntent = "draft" | "publish" | "schedule" | "archive";

/**
 * Shared Create/Edit job form — every field lives here once; the two
 * route pages differ only in `mode`/`defaultValues`/`jobId`. Publish
 * state is intentionally NOT one of the form's own editable fields:
 * saving content (Save Draft) never silently changes an already-
 * published job's status, and Publish Now/Schedule/Archive are separate
 * explicit actions layered on top of the content save, each calling the
 * matching dedicated service function (`publishJob`/`scheduleJob`/
 * `archiveJob`) so the "what happens when a job goes live" business
 * logic (setting `publishedAt` correctly) stays in one place rather
 * than being re-implemented here.
 */
export function JobForm({
  mode,
  jobId,
  currentStatus,
  defaultValues,
  companies,
  categories,
  locations,
}: JobFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [submittingIntent, setSubmittingIntent] = useState<PublishIntent | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [leaveWarningOpen, setLeaveWarningOpen] = useState(false);
  const [companyOptions, setCompanyOptions] = useState(companies);
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [locationOptions, setLocationOptions] = useState(locations);

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
    mode: "onBlur",
  });

  const { control, handleSubmit, watch, setValue, setError, formState } = form;

  useUnsavedChangesWarning(formState.isDirty);

  const watchedTitle = watch("title");
  const watchedCompanyId = watch("companyId");
  const watchedLocationId = watch("locationId");
  const watchedSlug = watch("slug");
  const watchedMetaTitle = watch("metaTitle");
  const watchedMetaDescription = watch("metaDescription");

  // Live slug suggestion — recomputed from title + company + location
  // until the admin manually edits the slug field, matching the "auto-
  // generate, allow manual editing" spec. The server still re-runs
  // whatever's submitted through `slugify()` + a uniqueness check
  // regardless, so this is purely a client-side preview/convenience.
  useEffect(() => {
    if (slugTouched) return;
    const company = companyOptions.find((c) => c.id === watchedCompanyId)?.name;
    const location = locationOptions.find((l) => l.id === watchedLocationId)?.name;
    const base = [watchedTitle, company, location].filter(Boolean).join(" ");
    setValue("slug", slugify(base), { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-derive from these three source fields
  }, [
    watchedTitle,
    watchedCompanyId,
    watchedLocationId,
    slugTouched,
    companyOptions,
    locationOptions,
  ]);

  async function handleCreateCompany(name: string) {
    const result = await createCompanyAction({ name });
    if (!result.success || !result.companyId) {
      toast({ title: result.error ?? "Could not create company", variant: "destructive" });
      return null;
    }
    const created = { id: result.companyId, name };
    setCompanyOptions((prev) => [...prev, created]);
    return { label: created.name, value: created.id };
  }

  async function handleCreateCategory(name: string) {
    const result = await createCategoryAction({ name });
    if (!result.success || !result.categoryId) {
      toast({ title: result.error ?? "Could not create category", variant: "destructive" });
      return null;
    }
    const created = { id: result.categoryId, name };
    setCategoryOptions((prev) => [...prev, created]);
    return { label: created.name, value: created.id };
  }

  async function onSubmit(data: CreateJobInput, intent: PublishIntent) {
    setSubmittingIntent(intent);
    try {
      let resultJobId: string | undefined;

      if (mode === "create") {
        const result = await createJobAction(data);
        if (!result.success) {
          if (result.fieldErrors) {
            for (const [field, message] of Object.entries(result.fieldErrors)) {
              setError(field as keyof CreateJobInput, { message });
            }
          }
          toast({ title: result.error ?? "Could not save the job", variant: "destructive" });
          return;
        }
        resultJobId = result.jobId;
      } else {
        // Never send `status` on a plain content update — it's changed
        // only by the explicit publish/schedule/archive actions below,
        // never as a side effect of editing a description or salary.
        const { status: _status, ...rest } = data;
        const result = await updateJobAction(jobId!, rest);
        if (!result.success) {
          if (result.fieldErrors) {
            for (const [field, message] of Object.entries(result.fieldErrors)) {
              setError(field as keyof CreateJobInput, { message });
            }
          }
          toast({ title: result.error ?? "Could not save the job", variant: "destructive" });
          return;
        }
        resultJobId = result.jobId;
      }

      if (!resultJobId) return;

      if (intent === "publish") {
        const result = await publishJobAction(resultJobId);
        if (!result.success) {
          toast({
            title: "Saved, but publishing failed",
            description: result.error,
            variant: "destructive",
          });
          router.push("/admin/jobs");
          return;
        }
      } else if (intent === "schedule" && scheduleDate) {
        const result = await scheduleJobAction(resultJobId, scheduleDate);
        if (!result.success) {
          toast({
            title: "Saved, but scheduling failed",
            description: result.error,
            variant: "destructive",
          });
          router.push("/admin/jobs");
          return;
        }
      } else if (intent === "archive") {
        const result = await archiveJobAction(resultJobId);
        if (!result.success) {
          toast({
            title: "Saved, but archiving failed",
            description: result.error,
            variant: "destructive",
          });
          router.push("/admin/jobs");
          return;
        }
      }

      const messages: Record<PublishIntent, string> = {
        draft: mode === "create" ? "Job created as draft" : "Draft saved",
        publish: "Job published",
        schedule: "Job scheduled",
        archive: "Job archived",
      };
      toast({ title: messages[intent], variant: "success" });
      router.push("/admin/jobs");
    } catch {
      toast({ title: "Server error", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmittingIntent(null);
    }
  }

  function handleCancel() {
    if (formState.isDirty) {
      setLeaveWarningOpen(true);
    } else {
      router.push("/admin/jobs");
    }
  }

  const isBusy = submittingIntent !== null;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]"
    >
      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormTextInput
              control={control}
              name="title"
              label="Job Title"
              required
              className="sm:col-span-2"
            />
            <FormCombobox
              control={control}
              name="companyId"
              label="Company"
              required
              entityName="company"
              placeholder="Search or add a company…"
              options={companyOptions.map((c) => ({ label: c.name, value: c.id }))}
              onCreate={handleCreateCompany}
            />
            <FormCombobox
              control={control}
              name="categoryId"
              label="Category"
              required
              entityName="category"
              placeholder="Search or add a category…"
              options={categoryOptions.map((c) => ({ label: c.name, value: c.id }))}
              onCreate={handleCreateCategory}
            />
            <FormSelect
              control={control}
              name="locationId"
              label="Location"
              required
              placeholder="Select an emirate…"
              options={locationOptions.map((l) => ({ label: l.name, value: l.id }))}
            />
            {/*
              Free-text sub-area (e.g. "Al Quoz", "Al Karama") — a plain
              manually-typed field, deliberately NOT a combobox tied to
              `locations`. Locations is restricted to exactly the 7
              emirates (the Select above); this is just extra display
              detail with no reference-data management of its own.
            */}
            <FormTextInput
              control={control}
              name="area"
              label="Area"
              placeholder="e.g. Al Quoz, Al Karama"
            />
            <FormSelect
              control={control}
              name="employmentType"
              label="Employment Type"
              required
              options={EMPLOYMENT_TYPE_OPTIONS}
            />
            <FormTextInput
              control={control}
              name="experience"
              label="Experience"
              placeholder="e.g. 3–5 years"
            />
            <FormNumberInput control={control} name="salaryMin" label="Salary Min" />
            <FormNumberInput control={control} name="salaryMax" label="Salary Max" />
            <FormTextInput
              control={control}
              name="salaryCurrency"
              label="Currency"
              placeholder="AED"
            />
            <FormTextInput control={control} name="education" label="Education" />
            <FormTextInput control={control} name="nationality" label="Nationality" />
            <FormTagsInput
              control={control}
              name="languages"
              label="Languages"
              className="sm:col-span-2"
            />
            <FormNumberInput control={control} name="vacancies" label="Number of Vacancies" />
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
              <FormSwitch control={control} name="featured" label="Featured" className="flex-1" />
              <FormSwitch control={control} name="verified" label="Verified" className="flex-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormUrlInput
              control={control}
              name="officialWebsite"
              label="Official Website"
              description="At least a website or an email is required."
            />
            <FormEmailInput control={control} name="officialEmail" label="Official Email" />
            <FormDatePicker
              control={control}
              name="applicationDeadline"
              label="Application Deadline"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <FormRichTextEditor
              control={control}
              name="description"
              label="Job Description"
              required
            />
            <FormRichTextEditor
              control={control}
              name="responsibilities"
              label="Responsibilities"
            />
            <FormRichTextEditor control={control} name="requirements" label="Requirements" />
            <FormRichTextEditor control={control} name="benefits" label="Benefits" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Controller
                control={control}
                name="slug"
                render={({ field, fieldState }) => (
                  <FormFieldWrapper
                    htmlFor="slug"
                    label="URL Slug"
                    description="Auto-generated from title + company + location — edit freely, or reset to the suggested value."
                    error={fieldState.error?.message}
                    className="sm:col-span-2"
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
              <FormTextInput control={control} name="metaTitle" label="Meta Title" />
              <FormTextInput control={control} name="metaDescription" label="Meta Description" />
              <FormTextInput control={control} name="ogTitle" label="Open Graph Title" />
              <FormTextInput
                control={control}
                name="ogDescription"
                label="Open Graph Description"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Canonical URL (derived from slug)
              </span>
              <code className="truncate rounded-lg bg-muted px-3 py-2 text-xs text-foreground">
                {siteConfig.url}/jobs/{watchedSlug || "…"}
              </code>
            </div>

            <Divider />

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Google Search Preview
              </span>
              <JobSeoPreview
                slug={watchedSlug ?? ""}
                title={watchedMetaTitle || watchedTitle}
                description={watchedMetaDescription ?? ""}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publish</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {currentStatus && (
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                <span className="text-sm text-muted-foreground">Current status</span>
                <JobStatusBadge status={currentStatus} />
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={isBusy}
              onClick={handleSubmit((data) => onSubmit(data, "draft"))}
            >
              {submittingIntent === "draft" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>

            <Button
              type="button"
              className="w-full gap-2"
              disabled={isBusy}
              onClick={handleSubmit((data) => onSubmit(data, "publish"))}
            >
              {submittingIntent === "publish" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish Now
            </Button>

            <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="w-full gap-2" disabled={isBusy}>
                  <CalendarClock className="h-4 w-4" />
                  Schedule Publish
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  autoFocus
                />
                <div className="border-t border-border/60 p-3">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    disabled={!scheduleDate || isBusy}
                    onClick={() => {
                      setScheduleOpen(false);
                      handleSubmit((data) => onSubmit(data, "schedule"))();
                    }}
                  >
                    Confirm Schedule
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {mode === "edit" && (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                disabled={isBusy}
                onClick={handleSubmit((data) => onSubmit(data, "archive"))}
              >
                {submittingIntent === "archive" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArchiveIcon className="h-4 w-4" />
                )}
                Archive
              </Button>
            )}

            {mode === "edit" && jobId && (
              <Button type="button" variant="ghost" className="w-full gap-2" asChild>
                <Link href={`/admin/jobs/${jobId}/preview`}>
                  <Eye className="h-4 w-4" /> Preview
                </Link>
              </Button>
            )}

            <Divider />

            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={leaveWarningOpen} onOpenChange={setLeaveWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits on this job. Leaving now will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setLeaveWarningOpen(false)}>
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={() => router.push("/admin/jobs")}>
              Discard & Leave
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

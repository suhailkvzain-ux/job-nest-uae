import type { Metadata } from "next";
import Link from "next/link";

import { JobForm } from "@/components/admin/jobs/job-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { CreateJobInput } from "@/lib/validations/job";
import { getAllCategories } from "@/services/categories.service";
import { getAllCompanies } from "@/services/companies.service";
import { getJobByIdWithRelations, type JobWithRelations } from "@/services/jobs.service";
import { getAllLocations } from "@/services/locations.service";

export const metadata: Metadata = { title: "Edit Job | Admin" };
export const dynamic = "force-dynamic";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

/** Maps a fetched `JobWithRelations` row onto the flat `CreateJobInput` shape the shared form works with. */
function toDefaultValues(job: JobWithRelations): Partial<CreateJobInput> {
  return {
    title: job.title,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    benefits: job.benefits,
    companyId: job.companyId,
    categoryId: job.categoryId,
    locationId: job.locationId,
    area: job.area,
    employmentType: job.employmentType,
    experience: job.experience,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    education: job.education,
    visaStatus: job.visaStatus,
    nationality: job.nationality,
    languages: job.languages,
    vacancies: job.vacancies,
    officialWebsite: job.officialWebsite,
    officialEmail: job.officialEmail,
    applicationDeadline: job.applicationDeadline,
    status: job.status,
    featured: job.featured,
    verified: job.verified,
    metaTitle: job.metaTitle,
    metaDescription: job.metaDescription,
    ogTitle: job.ogTitle,
    ogDescription: job.ogDescription,
    slug: job.slug,
  };
}

/**
 * `/admin/jobs/[id]/edit` — same `JobForm` as the create page, in "edit"
 * mode, pre-filled from the existing row. A soft-deleted job is treated
 * as not-found here (same as the public site): there's no restore flow
 * in this phase, so editing a deleted row would be a dead end.
 */
export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;

  const [job, companies, categories, locations] = await Promise.all([
    getJobByIdWithRelations(id),
    getAllCompanies(),
    getAllCategories(),
    getAllLocations(),
  ]);

  if (!job || job.deletedAt) {
    return (
      <EmptyState
        title="Job not found"
        description="This job may have been deleted. Go back to the job list to find what you're looking for."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/jobs">Back to Jobs</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Edit Job</h1>
        <p className="text-sm text-muted-foreground">{job.title}</p>
      </div>

      <JobForm
        mode="edit"
        jobId={job.id}
        currentStatus={job.status}
        defaultValues={toDefaultValues(job)}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
      />
    </div>
  );
}

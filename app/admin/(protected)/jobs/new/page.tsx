import type { Metadata } from "next";

import { JobForm } from "@/components/admin/jobs/job-form";
import { getAllCategories } from "@/services/categories.service";
import { getAllCompanies } from "@/services/companies.service";
import { getAllLocations } from "@/services/locations.service";

export const metadata: Metadata = { title: "Create Job | Admin" };

/**
 * `/admin/jobs/new` — a thin Server Component wrapper: fetch the three
 * dropdown source lists in parallel, then hand off to the shared
 * `JobForm` in "create" mode. All the actual form logic (validation,
 * submit intents, slug preview) lives in the form component so this
 * page and the edit page only differ in `mode`/`defaultValues`/`jobId`.
 */
export default async function NewJobPage() {
  const [companies, categories, locations] = await Promise.all([
    getAllCompanies(),
    getAllCategories(),
    getAllLocations(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Create New Job</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details below, then save as a draft or publish immediately.
        </p>
      </div>

      <JobForm
        mode="create"
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
      />
    </div>
  );
}

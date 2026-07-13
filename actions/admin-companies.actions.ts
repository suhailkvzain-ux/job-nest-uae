"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAndRateLimit, flattenZodErrors } from "@/lib/admin-action-helpers";
import { createCompanySchema, updateCompanySchema, type CreateCompanyInput, type UpdateCompanyInput } from "@/lib/validations/company";
import {
  createCompany,
  deleteCompany,
  getCompanyTotalJobCount,
  updateCompany,
} from "@/services/companies.service";

/**
 * Server Actions for `/admin/companies` — Master Data Management.
 * Companies are reference data (no soft-delete column, unlike Job), so
 * deletion here is a real hard delete, gated by a job-count check
 * rather than a `deletedAt` flag: a company with jobs still pointing at
 * it can never be removed, since the `Job.companyId` foreign key would
 * otherwise be left dangling or force an unintended cascade.
 */

export interface CompanyActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  companyId?: string;
  slug?: string;
}

function revalidateCompanyPaths(slug?: string) {
  revalidatePath("/admin/companies");
  revalidatePath("/companies");
  if (slug) revalidatePath(`/companies/${slug}`);
}

export async function createCompanyAction(input: CreateCompanyInput): Promise<CompanyActionResult> {
  try {
    await assertAdminAndRateLimit("create-company");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = createCompanySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  try {
    const company = await createCompany(parsed.data);
    revalidateCompanyPaths(company.slug);
    return { success: true, companyId: company.id, slug: company.slug };
  } catch {
    return { success: false, error: "Could not create the company. Please try again." };
  }
}

export async function updateCompanyAction(id: string, input: UpdateCompanyInput): Promise<CompanyActionResult> {
  try {
    await assertAdminAndRateLimit("update-company");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = updateCompanySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  try {
    const company = await updateCompany(id, parsed.data);
    revalidateCompanyPaths(company.slug);
    return { success: true, companyId: company.id, slug: company.slug };
  } catch {
    return { success: false, error: "Could not update the company. Please try again." };
  }
}

export async function deleteCompanyAction(id: string): Promise<CompanyActionResult> {
  try {
    await assertAdminAndRateLimit("delete-company");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const jobCount = await getCompanyTotalJobCount(id);
    if (jobCount > 0) {
      return {
        success: false,
        error: "This company has active jobs. Remove company from jobs before deleting.",
      };
    }

    const company = await deleteCompany(id);
    revalidateCompanyPaths(company.slug);
    return { success: true, companyId: company.id };
  } catch {
    return { success: false, error: "Could not delete the company. Please try again." };
  }
}

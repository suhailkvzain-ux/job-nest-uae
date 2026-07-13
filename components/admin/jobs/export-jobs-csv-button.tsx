"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JobWithRelations } from "@/services/jobs.service";
import { formatDate } from "@/utils/format";

function toCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Exports the currently-loaded page of the Jobs table to CSV —
 * client-side, from data already fetched for the table (no extra
 * request). Marked "optional" in the spec; implemented as a light,
 * dependency-free `Blob` download rather than a dedicated export route
 * since a page's worth of rows (≤20) needs nothing heavier.
 */
export function ExportJobsCsvButton({ jobs }: { jobs: JobWithRelations[] }) {
  function handleExport() {
    const headers = [
      "Title",
      "Company",
      "Category",
      "Location",
      "Employment Type",
      "Status",
      "Featured",
      "Verified",
      "Published Date",
      "Deadline",
      "Last Updated",
    ];

    const rows = jobs.map((job) =>
      [
        job.title,
        job.company.name,
        job.category.name,
        job.location.name,
        job.employmentType,
        job.status,
        job.featured ? "Yes" : "No",
        job.verified ? "Yes" : "No",
        job.publishedAt ? formatDate(job.publishedAt) : "",
        job.applicationDeadline ? formatDate(job.applicationDeadline) : "",
        formatDate(job.updatedAt),
      ]
        .map((v) => toCsvValue(String(v)))
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `job-nest-jobs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (jobs.length === 0) return null;

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" /> Export CSV
    </Button>
  );
}

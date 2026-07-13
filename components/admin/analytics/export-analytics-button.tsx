"use client";

import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KpiSummary, TopJobRow } from "@/services/analytics.service";
import { formatDate } from "@/utils/format";

function toCsvValue(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const TOP_JOBS_HEADERS = [
  "Job Title",
  "Company",
  "Views",
  "Website Clicks",
  "Email Clicks",
  "CTR (%)",
  "Published Date",
];

function topJobsRows(topJobs: TopJobRow[]): string[][] {
  return topJobs.map((job) => [
    job.title,
    job.companyName,
    String(job.views),
    String(job.websiteClicks),
    String(job.emailClicks),
    String(job.ctr),
    job.publishedAt ? formatDate(job.publishedAt) : "",
  ]);
}

function kpiRows(kpis: KpiSummary): string[][] {
  return [
    ["Total Visitors", String(kpis.totalVisitors)],
    ["Visitors Today", String(kpis.visitorsToday)],
    ["Visitors This Week", String(kpis.visitorsThisWeek)],
    ["Visitors This Month", String(kpis.visitorsThisMonth)],
    ["Total Page Views", String(kpis.totalPageViews)],
    ["Total Published Jobs", String(kpis.totalPublishedJobs)],
    ["Total Job Views", String(kpis.totalJobViews)],
    ["Website Apply Clicks", String(kpis.websiteApplyClicks)],
    ["Email Apply Clicks", String(kpis.emailApplyClicks)],
    ["Share Clicks", String(kpis.shareClicks)],
  ];
}

/**
 * Exports the dashboard's current snapshot — KPI summary + the loaded
 * page of the Top Jobs table — to CSV or Excel, entirely client-side
 * from data already on the page (same "no extra request" precedent as
 * `ExportJobsCsvButton` in Phase 9). Excel export uses SheetJS
 * (`xlsx`), producing a two-sheet workbook (KPI Summary, Top Jobs)
 * rather than flattening everything into one CSV-shaped sheet.
 */
export function ExportAnalyticsButton({ kpis, topJobs }: { kpis: KpiSummary; topJobs: TopJobRow[] }) {
  const dateStamp = new Date().toISOString().slice(0, 10);

  function handleExportCsv() {
    const kpiSection = ["KPI Summary", ...kpiRows(kpis).map((r) => r.join(","))];
    const jobsSection = [
      "",
      "Top Performing Jobs",
      TOP_JOBS_HEADERS.join(","),
      ...topJobsRows(topJobs).map((row) => row.map((v) => toCsvValue(v)).join(",")),
    ];
    const csv = [...kpiSection, ...jobsSection].join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `job-nest-analytics-${dateStamp}.csv`);
  }

  async function handleExportExcel() {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    const kpiSheet = XLSX.utils.aoa_to_sheet([["Metric", "Value"], ...kpiRows(kpis)]);
    XLSX.utils.book_append_sheet(wb, kpiSheet, "KPI Summary");

    const jobsSheet = XLSX.utils.aoa_to_sheet([TOP_JOBS_HEADERS, ...topJobsRows(topJobs)]);
    XLSX.utils.book_append_sheet(wb, jobsSheet, "Top Jobs");

    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    downloadBlob(
      new Blob([buffer], { type: "application/octet-stream" }),
      `job-nest-analytics-${dateStamp}.xlsx`,
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleExportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4" /> Export Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

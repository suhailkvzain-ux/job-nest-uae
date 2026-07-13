import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import type { TopJobRow } from "@/services/analytics.service";
import { formatDate, formatNumber } from "@/utils/format";

/** Top Performing Jobs — Job Title, Company, Views, Website Clicks, Email Clicks, CTR, Published Date, per the spec. */
export function TopJobsTable({ rows }: { rows: TopJobRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No job activity yet"
        description="No page views or apply clicks were recorded for this period."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="py-3 pl-4 pr-4 font-medium">
              Job Title
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Company
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Views
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Website Clicks
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Email Clicks
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              CTR
            </th>
            <th scope="col" className="py-3 pl-4 pr-4 font-medium">
              Published
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="max-w-72 truncate py-3 pl-4 pr-4 font-medium text-foreground">
                <Link href={`/jobs/${row.slug}`} target="_blank" className="hover:text-primary hover:underline">
                  {row.title}
                </Link>
              </td>
              <td className="max-w-48 truncate py-3 pr-4 text-muted-foreground">{row.companyName}</td>
              <td className="py-3 pr-4 text-right tabular-nums text-foreground">{formatNumber(row.views)}</td>
              <td className="py-3 pr-4 text-right tabular-nums text-foreground">{formatNumber(row.websiteClicks)}</td>
              <td className="py-3 pr-4 text-right tabular-nums text-foreground">{formatNumber(row.emailClicks)}</td>
              <td className="py-3 pr-4 text-right">
                <Badge variant={row.ctr > 0 ? "default" : "secondary"}>{row.ctr}%</Badge>
              </td>
              <td className="py-3 pl-4 pr-4 text-muted-foreground">
                {row.publishedAt ? formatDate(row.publishedAt) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { EmptyState } from "@/components/shared/empty-state";
import { formatNumber } from "@/utils/format";

interface TopEntityRow {
  id: string;
  name: string;
  publishedJobs: number;
  totalViews: number;
  totalApplyClicks?: number;
}

/**
 * Shared rendering for the Top Companies / Top Categories / Top
 * Locations tables — all three share the same {name, publishedJobs,
 * totalViews} shape, with Top Companies adding a fourth "Apply Clicks"
 * column. One component instead of three near-identical ones.
 */
export function TopEntitiesTable({
  rows,
  nameHeader,
  emptyLabel,
  showApplyClicks = false,
}: {
  rows: TopEntityRow[];
  nameHeader: string;
  emptyLabel: string;
  showApplyClicks?: boolean;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyLabel} description="No activity was recorded for this period." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="py-3 pl-4 pr-4 font-medium">
              {nameHeader}
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Published Jobs
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Total Views
            </th>
            {showApplyClicks && (
              <th scope="col" className="py-3 pl-4 pr-4 text-right font-medium">
                Apply Clicks
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="max-w-56 truncate py-3 pl-4 pr-4 font-medium text-foreground">{row.name}</td>
              <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                {formatNumber(row.publishedJobs)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums text-foreground">{formatNumber(row.totalViews)}</td>
              {showApplyClicks && (
                <td className="py-3 pl-4 pr-4 text-right tabular-nums text-foreground">
                  {formatNumber(row.totalApplyClicks ?? 0)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

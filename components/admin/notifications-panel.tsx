import { AlertTriangle, CalendarClock, FileEdit } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminNotifications } from "@/services/dashboard.service";
import { formatDate } from "@/utils/format";

function NotificationList({
  icon: Icon,
  title,
  jobs,
  emptyLabel,
  dateFor,
}: {
  icon: LucideIcon;
  title: string;
  jobs: { id: string; slug: string; title: string; applicationDeadline: Date | null; publishedAt: Date | null }[];
  emptyLabel: string;
  dateFor: (job: { applicationDeadline: Date | null; publishedAt: Date | null }) => string | null;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2.5 space-y-0">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {jobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-3 text-sm">
                <Link
                  href={`/jobs/${job.slug}`}
                  target="_blank"
                  className="truncate font-medium text-foreground hover:text-primary"
                >
                  {job.title}
                </Link>
                {dateFor(job) && <span className="shrink-0 text-xs text-muted-foreground">{dateFor(job)}</span>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** Dashboard alerts — scheduled jobs, jobs nearing their application deadline, and open drafts. All optional per spec; each renders its own quiet empty state rather than being hidden entirely, so the admin always sees all three sections exist. */
export function NotificationsPanel({ notifications }: { notifications: AdminNotifications }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <NotificationList
        icon={CalendarClock}
        title="Scheduled Jobs"
        jobs={notifications.scheduledJobs}
        emptyLabel="No jobs currently scheduled."
        dateFor={(job) => (job.publishedAt ? formatDate(job.publishedAt) : null)}
      />
      <NotificationList
        icon={AlertTriangle}
        title="Jobs Near Deadline"
        jobs={notifications.nearDeadlineJobs}
        emptyLabel="Nothing closing in the next 3 days."
        dateFor={(job) => (job.applicationDeadline ? formatDate(job.applicationDeadline) : null)}
      />
      <NotificationList
        icon={FileEdit}
        title="Draft Jobs"
        jobs={notifications.draftJobs}
        emptyLabel="No open drafts."
        dateFor={() => null}
      />
    </div>
  );
}

import {
  Award,
  Banknote,
  Briefcase,
  Calendar,
  CalendarClock,
  Globe2,
  GraduationCap,
  Languages as LanguagesIcon,
  MapPin,
  ShieldCheck,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

import { employmentTypeLabels } from "@/components/badges/status-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JobWithRelations } from "@/services/jobs.service";
import { formatDate, formatNumber } from "@/utils/format";

interface InfoItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

function formatSalary(job: JobWithRelations): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryCurrency} ${formatNumber(job.salaryMin)} – ${formatNumber(job.salaryMax)} / month`;
  }
  return `${job.salaryCurrency} ${formatNumber((job.salaryMin ?? job.salaryMax)!)}+ / month`;
}

/** Builds the exhaustive fact list for the job detail page's "Job Information" card — every field the spec calls for, each omitted individually when the underlying value is empty. */
function buildInfoItems(job: JobWithRelations): InfoItem[] {
  const items: InfoItem[] = [
    { icon: Briefcase, label: "Employment Type", value: employmentTypeLabels[job.employmentType] },
    { icon: MapPin, label: "Location", value: job.location.name },
    { icon: Tag, label: "Category", value: job.category.name },
  ];

  if (job.experience) items.push({ icon: Award, label: "Experience", value: job.experience });
  if (job.education) items.push({ icon: GraduationCap, label: "Education", value: job.education });

  const salary = formatSalary(job);
  if (salary) items.push({ icon: Banknote, label: "Salary", value: salary });

  if (job.visaStatus) items.push({ icon: ShieldCheck, label: "Visa Status", value: job.visaStatus });
  if (job.nationality) items.push({ icon: Globe2, label: "Nationality", value: job.nationality });
  if (job.languages.length > 0) {
    items.push({ icon: LanguagesIcon, label: "Languages", value: job.languages.join(", ") });
  }

  items.push({ icon: Users, label: "Vacancies", value: String(job.vacancies) });

  if (job.applicationDeadline) {
    items.push({ icon: CalendarClock, label: "Application Deadline", value: formatDate(job.applicationDeadline) });
  }
  if (job.publishedAt) {
    items.push({ icon: Calendar, label: "Posted Date", value: formatDate(job.publishedAt) });
  }

  return items;
}

/** Clean, exhaustive "Job Information" fact card for the job detail sidebar. */
export function JobInformationCard({ job }: { job: JobWithRelations }) {
  const items = buildInfoItems(job);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Job Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-col">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

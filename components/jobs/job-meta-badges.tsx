import { Banknote, Briefcase, CalendarClock, Clock, GraduationCap, Languages as LanguagesIcon, MapPin, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber, formatPostedTime } from "@/utils/format";

/** Formats a job's salary range with its currency, e.g. "AED 8,000 – 11,000". */
export function SalaryBadge({
  min,
  max,
  currency = "AED",
  className,
}: {
  min?: number | null;
  max?: number | null;
  currency?: string;
  className?: string;
}) {
  if (!min && !max) return null;

  const label =
    min && max
      ? `${currency} ${formatNumber(min)} – ${formatNumber(max)}`
      : `${currency} ${formatNumber((min ?? max)!)}+`;

  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <Banknote className="h-3 w-3" /> {label}
    </Badge>
  );
}

export function ExperienceBadge({ experience, className }: { experience?: string | null; className?: string }) {
  if (!experience) return null;
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <Briefcase className="h-3 w-3" /> {experience}
    </Badge>
  );
}

export function LocationBadge({ location, className }: { location: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <MapPin className="h-3 w-3" /> {location}
    </Badge>
  );
}

/** "Just now" / "5 minutes ago" / "Yesterday" / "2 weeks ago" — pass the job's `publishedAt`. */
export function PostedTimeBadge({ date, className }: { date: Date | string; className?: string }) {
  return (
    <span className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <Clock className="h-3 w-3" /> {formatPostedTime(date)}
    </span>
  );
}


/**
 * The following badges are used on the job **detail** page header only
 * (not on job cards, which stick to the compact five-fact `JobMeta`
 * row) — they cover the remaining facts the Phase 6 spec asks the
 * header to surface: Education, Visa Status, Nationality, Languages,
 * Vacancies, and Application Deadline.
 */

export function EducationBadge({ education, className }: { education?: string | null; className?: string }) {
  if (!education) return null;
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <GraduationCap className="h-3 w-3" /> {education}
    </Badge>
  );
}

export function VisaStatusBadge({ visaStatus, className }: { visaStatus?: string | null; className?: string }) {
  if (!visaStatus) return null;
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <ShieldCheck className="h-3 w-3" /> {visaStatus}
    </Badge>
  );
}

export function NationalityBadge({ nationality, className }: { nationality?: string | null; className?: string }) {
  if (!nationality) return null;
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      {nationality}
    </Badge>
  );
}

export function LanguagesBadge({ languages, className }: { languages?: string[]; className?: string }) {
  if (!languages || languages.length === 0) return null;
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <LanguagesIcon className="h-3 w-3" /> {languages.join(", ")}
    </Badge>
  );
}

export function VacanciesBadge({ vacancies, className }: { vacancies?: number; className?: string }) {
  if (!vacancies || vacancies < 1) return null;
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <Users className="h-3 w-3" /> {vacancies} {vacancies === 1 ? "Vacancy" : "Vacancies"}
    </Badge>
  );
}

/** "Apply before 10 Jul 2026" — pass the job's `applicationDeadline`. */
export function DeadlineBadge({ deadline, className }: { deadline?: Date | string | null; className?: string }) {
  if (!deadline) return null;
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <CalendarClock className="h-3 w-3" /> Apply before {formatDate(deadline)}
    </Badge>
  );
}

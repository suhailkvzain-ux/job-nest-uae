import type { EmploymentType, JobStatus } from "@prisma/client";
import { BadgeCheck, Flame, Home, Sparkles, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Verified employer/listing indicator. */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="success" className={cn("gap-1", className)}>
      <BadgeCheck className="h-3 w-3" /> Verified
    </Badge>
  );
}

/** Featured/promoted listing indicator. */
export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn("gap-1 bg-badge-orange text-badge-orange-foreground", className)}>
      <Star className="h-3 w-3 fill-current" /> Featured
    </Badge>
  );
}

/** Urgent hiring indicator — independent of Featured/Verified, per the admin spec's own Urgent Hiring toggle. */
export function UrgentBadge({ className }: { className?: string }) {
  return (
    <Badge variant="destructive" className={cn("gap-1", className)}>
      <Flame className="h-3 w-3 fill-current" /> Urgent
    </Badge>
  );
}

/** Recently-posted indicator — pass `postedAt` and it only renders within `withinHours`. */
export function NewBadge({
  postedAt,
  withinHours = 48,
  className,
}: {
  postedAt: Date | string;
  withinHours?: number;
  className?: string;
}) {
  const posted = typeof postedAt === "string" ? new Date(postedAt) : postedAt;
  const hoursSince = (Date.now() - posted.getTime()) / (1000 * 60 * 60);
  if (hoursSince > withinHours) return null;

  return (
    <Badge className={cn("gap-1 bg-badge-purple text-badge-purple-foreground", className)}>
      <Sparkles className="h-3 w-3" /> New
    </Badge>
  );
}

/** Remote-friendly indicator (independent of the EmploymentType badge). */
export function RemoteBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Home className="h-3 w-3" /> Remote
    </Badge>
  );
}

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  FREELANCE: "Freelance",
};

const employmentTypeColor: Record<EmploymentType, string> = {
  FULL_TIME: "bg-badge-blue text-badge-blue-foreground",
  PART_TIME: "bg-badge-gray text-badge-gray-foreground",
  CONTRACT: "bg-badge-orange text-badge-orange-foreground",
  TEMPORARY: "bg-badge-orange text-badge-orange-foreground",
  INTERNSHIP: "bg-badge-purple text-badge-purple-foreground",
  REMOTE: "bg-badge-green text-badge-green-foreground",
  HYBRID: "bg-badge-green text-badge-green-foreground",
  FREELANCE: "bg-badge-purple text-badge-purple-foreground",
};

/** Renders the correct color/label for any `EmploymentType` enum value. */
export function EmploymentTypeBadge({ type, className }: { type: EmploymentType; className?: string }) {
  return <Badge className={cn(employmentTypeColor[type], className)}>{employmentTypeLabels[type]}</Badge>;
}

// Convenience named exports for the three types called out explicitly in
// the design spec — thin wrappers over EmploymentTypeBadge.
export const FullTimeBadge = (props: { className?: string }) => (
  <EmploymentTypeBadge type="FULL_TIME" {...props} />
);
export const PartTimeBadge = (props: { className?: string }) => (
  <EmploymentTypeBadge type="PART_TIME" {...props} />
);
export const ContractBadge = (props: { className?: string }) => (
  <EmploymentTypeBadge type="CONTRACT" {...props} />
);


const jobStatusLabels: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  SCHEDULED: "Scheduled",
  ARCHIVED: "Archived",
};

const jobStatusVariant: Record<JobStatus, "default" | "success" | "outline" | "destructive"> = {
  DRAFT: "outline",
  PUBLISHED: "success",
  SCHEDULED: "default",
  ARCHIVED: "destructive",
};

/** Admin-only status indicator — the public site never shows non-Published jobs, so this lives alongside the other badges but is only ever used in `/admin`. */
export function JobStatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <Badge variant={jobStatusVariant[status]} className={className}>
      {jobStatusLabels[status]}
    </Badge>
  );
}

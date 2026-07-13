import { Building2, ExternalLink, Globe } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CompanyCardProps {
  name: string;
  slug: string;
  logoUrl?: string | null;
  jobCount?: number;
  location?: string;
  /** Official company website — rendered as its own external link, separate from the card's `/companies/[slug]` link. */
  website?: string | null;
  className?: string;
}

/**
 * Company directory card. Not a single whole-card `<Link>` — the
 * official website needs to be its own real, independently-clickable
 * anchor (nested anchors are invalid HTML/React), so the name/avatar and
 * the "View Profile" button each carry their own link to
 * `/companies/[slug]` instead.
 */
export function CompanyCard({ name, slug, logoUrl, jobCount, location, website, className }: CompanyCardProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={cn("group h-full transition-shadow hover:shadow-soft-lg", className)}>
      <CardContent className="flex h-full flex-col items-center gap-3 p-6 text-center">
        <Link href={`/companies/${slug}`} className="flex flex-col items-center gap-3">
          <Avatar className="h-14 w-14 rounded-2xl">
            {logoUrl && <AvatarImage src={logoUrl} alt="" />}
            <AvatarFallback className="rounded-2xl text-base">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground group-hover:text-primary">{name}</span>
        </Link>

        {location && (
          <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">{location}</span>
        )}

        {typeof jobCount === "number" && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Building2 className="h-3 w-3" />
            {jobCount} {jobCount === 1 ? "open role" : "open roles"}
          </span>
        )}

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Globe className="h-3 w-3" /> Official website
          </a>
        )}

        <Link
          href={`/companies/${slug}`}
          className="mt-auto flex items-center gap-1 pt-2 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          View profile <ExternalLink className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

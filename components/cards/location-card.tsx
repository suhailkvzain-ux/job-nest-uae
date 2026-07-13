import { MapPin } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface LocationCardProps {
  name: string;
  slug: string;
  jobCount?: number;
  className?: string;
}

/** Emirate/location tile — links to `/locations/[slug]`. */
export function LocationCard({ name, slug, jobCount, className }: LocationCardProps) {
  return (
    <Link href={`/locations/${slug}`} className="block">
      <Card className={cn("group h-full transition-all hover:-translate-y-0.5 hover:shadow-soft-lg", className)}>
        <CardContent className="flex flex-col gap-4 p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary transition-colors group-hover:bg-brand-gradient group-hover:text-primary-foreground">
            <MapPin className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-foreground">{name}</span>
            {typeof jobCount === "number" && (
              <span className="text-sm text-muted-foreground">
                {jobCount} {jobCount === 1 ? "job" : "jobs"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

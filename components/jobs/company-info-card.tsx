import type { Company } from "@prisma/client";
import { ExternalLink, Globe } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Sidebar card summarizing the hiring company on the job detail page. */
export function CompanyInfoCard({ company }: { company: Pick<Company, "name" | "slug" | "website" | "description"> }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Avatar className="h-12 w-12 rounded-2xl">
          <AvatarFallback className="rounded-2xl">
            {company.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-base">{company.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {company.description && <p className="text-sm text-muted-foreground">{company.description}</p>}
        <div className="flex flex-col gap-2">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Globe className="h-3.5 w-3.5" /> Visit website
            </a>
          )}
          <Link
            href={`/jobs?company=${company.slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-center")}
          >
            View all jobs from {company.name} <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

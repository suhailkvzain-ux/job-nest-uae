import { Briefcase } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Job-specific 404 — shown whenever `/jobs/[slug]` resolves to a job
 * that's a draft, archived, soft-deleted, scheduled-but-not-yet-live, or
 * past its application deadline. More specific than the root 404 so a
 * visitor following a stale/shared link understands the listing itself
 * is gone, not the whole site.
 */
export default function JobNotFound() {
  return (
    <Container className="py-20">
      <EmptyState
        icon={Briefcase}
        title="This job listing is no longer available"
        description="It may have been filled, closed, or removed by the employer. Browse our other verified vacancies instead."
        action={
          <Link href="/jobs" className={cn(buttonVariants({ size: "sm" }))}>
            Browse all jobs
          </Link>
        }
      />
    </Container>
  );
}

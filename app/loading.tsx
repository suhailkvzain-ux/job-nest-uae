import { Container } from "@/components/layout/container";
import { JobListSkeleton } from "@/components/shared/loading-skeleton";

/**
 * Global route loading UI (Next.js loading.tsx convention). Route segments
 * that need a different loading shape can add their own loading.tsx, which
 * takes precedence over this one.
 */
export default function Loading() {
  return (
    <Container className="py-16">
      <JobListSkeleton />
    </Container>
  );
}

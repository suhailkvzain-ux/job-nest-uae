"use client";

import { useEffect } from "react";

import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/shared/error-state";

/**
 * Global error boundary (Next.js error.tsx convention). Must be a Client
 * Component. Catches errors thrown in Server or Client Components below it
 * in the tree, except the root layout (see global-error.tsx for that case,
 * added later if needed).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook up to an error-reporting service (e.g. Sentry) in a later phase.
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16">
      <ErrorState onRetry={reset} />
    </Container>
  );
}

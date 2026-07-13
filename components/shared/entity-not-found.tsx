import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared 404 body for the category/location/company detail pages — only
 * the copy and "browse all" link differ per entity type.
 */
export function EntityNotFound({
  icon,
  label,
  browseHref,
  browseLabel,
}: {
  icon: LucideIcon;
  label: string;
  browseHref: string;
  browseLabel: string;
}) {
  return (
    <Container className="py-20">
      <EmptyState
        icon={icon}
        title={`This ${label} doesn't exist`}
        description={`It may have been renamed or removed. Browse our full list of ${label}s instead.`}
        action={
          <Link href={browseHref} className={cn(buttonVariants({ size: "sm" }))}>
            {browseLabel}
          </Link>
        }
      />
    </Container>
  );
}

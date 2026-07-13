import type { LucideIcon } from "lucide-react";
import { BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { formatNumber } from "@/utils/format";

interface EntityDetailHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
  title: string;
  description?: string | null;
  totalJobs: number;
  icon?: LucideIcon;
  /** Replaces the icon badge — used by the company detail page's initials avatar. */
  avatar?: ReactNode;
  /** Extra inline content under the title, e.g. the company's official website link. */
  meta?: ReactNode;
}

/**
 * Shared header for the category/location/company detail pages —
 * breadcrumb, an icon or avatar, title, optional description, the
 * "Published Jobs" count badge, and an optional meta slot. Mirrors
 * `JobsPageHeader`'s look so all of these landing pages feel like one
 * consistent family.
 */
export function EntityDetailHeader({
  breadcrumbItems,
  title,
  description,
  totalJobs,
  icon: Icon,
  avatar,
  meta,
}: EntityDetailHeaderProps) {
  return (
    <Section spacing="compact" className="border-b border-border/60 bg-surface pt-8">
      <Container className="flex flex-col gap-4">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-start gap-4">
          {avatar ??
            (Icon && (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                <Icon className="h-6 w-6" />
              </span>
            ))}
          <div className="flex flex-col gap-2">
            <Heading level="h1" as="h1">
              {title}
            </Heading>
            {description && <Paragraph tone="secondary">{description}</Paragraph>}
            {meta}
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
              <BadgeCheck className="h-3.5 w-3.5" />
              {formatNumber(totalJobs)} Published {totalJobs === 1 ? "Job" : "Jobs"}
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

import { BadgeCheck } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { formatNumber } from "@/utils/format";

/** /jobs page header — title, subtitle, and the live published-jobs count. */
export function JobsPageHeader({ totalJobs }: { totalJobs: number }) {
  return (
    <Section spacing="compact" className="border-b border-border/60 bg-surface pt-8">
      <Container className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "All Jobs", href: "/jobs" }]} />
        <div className="flex flex-col gap-2">
          <Heading level="h1" as="h1">
            All UAE Jobs
          </Heading>
          <Paragraph tone="secondary">
            Browse verified job vacancies from official employer sources.
          </Paragraph>
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
            <BadgeCheck className="h-3.5 w-3.5" />
            {formatNumber(totalJobs)} Verified {totalJobs === 1 ? "Job" : "Jobs"}
          </span>
        </div>
      </Container>
    </Section>
  );
}

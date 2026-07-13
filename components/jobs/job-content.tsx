import { CheckCircle2, Gift, ListChecks } from "lucide-react";

import { IconList } from "@/components/shared/icon-list";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";

function linesFrom(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** Renders a job's main description as body copy (preserves line breaks). */
export function JobDescription({ description }: { description: string }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level="h4">About this role</Heading>
      <div className="flex flex-col gap-3">
        {description.split(/\r?\n{2,}/).map((paragraph, i) => (
          <Paragraph key={i} tone="secondary">
            {paragraph}
          </Paragraph>
        ))}
      </div>
    </section>
  );
}

/** Renders `requirements` free text as a bulleted list (splits on newlines). */
export function RequirementsList({ requirements }: { requirements: string }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level="h4">Requirements</Heading>
      <IconList items={linesFrom(requirements).map((label) => ({ icon: ListChecks, label }))} />
    </section>
  );
}

/** Renders `benefits` free text as a bulleted list. */
export function BenefitsList({ benefits }: { benefits: string }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level="h4">Benefits</Heading>
      <IconList items={linesFrom(benefits).map((label) => ({ icon: Gift, label }))} />
    </section>
  );
}

/** Renders `responsibilities` free text as a bulleted list. */
export function ResponsibilitiesList({ responsibilities }: { responsibilities: string }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level="h4">Responsibilities</Heading>
      <IconList
        items={linesFrom(responsibilities).map((label) => ({ icon: CheckCircle2, label }))}
      />
    </section>
  );
}

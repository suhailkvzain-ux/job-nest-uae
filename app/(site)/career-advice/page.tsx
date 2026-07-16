import { FileText, MessageSquare, Plane, MapPinned } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/shared/json-ld";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { Card, CardContent } from "@/components/ui/card";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Career Advice",
    description: "Practical resume, interview, visa, and relocation guidance for job seekers applying to roles in the UAE.",
    path: "/career-advice",
  });
}

interface Guide {
  icon: LucideIcon;
  title: string;
  points: string[];
}

const GUIDES: Guide[] = [
  {
    icon: FileText,
    title: "Resume Tips",
    points: [
      "Keep it to 1–2 pages and lead with a short summary tailored to the role you're applying for.",
      "Use numbers where you can — team size, budget, percentage improvements — not just duties.",
      "List your visa/work-permit status clearly if you already hold one valid for the UAE.",
      "Match the job title and key skills from the listing in your own wording, not copy-pasted.",
    ],
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    points: [
      "Research the specific company, not just the industry — UAE employers often ask why that company.",
      "Prepare 2–3 concrete examples (situation, action, result) for common behavioral questions.",
      "For roles with a salary range listed, know your expectation in AED before you're asked.",
      "Confirm the interview format (in person, video, phone) and time zone in advance.",
    ],
  },
  {
    icon: Plane,
    title: "Visa & Work Permits",
    points: [
      "Most UAE employers sponsor the work visa once you accept an offer — this is standard, not a red flag either way to ask about.",
      "A valid employment visa is tied to the sponsoring employer; check listings for any visa status requirement before applying.",
      "Government sources (u.ae) have the current official process — always verify visa details there, not from a third party.",
    ],
  },
  {
    icon: MapPinned,
    title: "Relocating to the UAE",
    points: [
      "Dubai, Abu Dhabi, and Sharjah each have different costs of living — factor rent into any salary comparison.",
      "Many employers list housing/transport allowances separately — read the full listing description, not just the salary line.",
      "Ask about notice periods and start-date flexibility if you're relocating from abroad.",
    ],
  },
];

export default async function CareerAdvicePage() {
  const defaults = await getSiteMetadataDefaults();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: defaults.baseUrl },
          { name: "Career Advice", url: `${defaults.baseUrl}/career-advice` },
        ])}
      />
      <Section spacing="compact">
        <Container className="flex flex-col gap-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Career Advice" }]} />
          <div className="flex flex-col items-center gap-2 text-center">
            <Heading level="h2" as="h1">
              Career Advice
            </Heading>
            <Paragraph tone="secondary" className="max-w-2xl">
              Practical guidance for applying to jobs in the UAE — resumes, interviews, visas, and
              relocating.
            </Paragraph>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {GUIDES.map((guide) => (
              <Card key={guide.title}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <guide.icon className="h-4.5 w-4.5" />
                    </span>
                    <h2 className="font-semibold text-foreground">{guide.title}</h2>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {guide.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

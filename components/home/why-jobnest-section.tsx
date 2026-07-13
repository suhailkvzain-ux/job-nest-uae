import { BadgeCheck, RefreshCw, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerItem } from "@/components/motion/motion-wrappers";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "purple" | "green" | "blue";
}

const ACCENT_CLASSES: Record<Feature["accent"], string> = {
  purple: "bg-badge-purple text-badge-purple-foreground",
  green: "bg-badge-green text-badge-green-foreground",
  blue: "bg-badge-blue text-badge-blue-foreground",
};

const FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: "Verified Vacancies",
    description: "Every listing is checked against the employer's official source before it goes live.",
    accent: "purple",
  },
  {
    icon: Send,
    title: "Direct Employer Applications",
    description: "No middleman, no accounts. Apply straight on the employer's own website or email.",
    accent: "green",
  },
  {
    icon: RefreshCw,
    title: "Updated Daily",
    description: "Fresh vacancies are added and expired ones removed every single day.",
    accent: "blue",
  },
];

/** Homepage "Why Job Nest UAE" — three static trust/value-prop cards. */
export function WhyJobNestSection() {
  return (
    <Section id="why-job-nest" aria-labelledby="why-job-nest-heading">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Heading level="h2" as="h2" id="why-job-nest-heading">
            Why Job Nest UAE
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
            A discovery platform built around trust, speed, and getting out of your way.
          </Paragraph>
        </div>

        <StaggerContainer>
          <Grid cols={{ base: 1, md: 3 }} gap="lg">
            {FEATURES.map(({ icon: Icon, title, description, accent }) => (
              <StaggerItem key={title}>
                <Card className="h-full border-border/50 text-center transition-all hover:-translate-y-1 hover:shadow-soft-lg">
                  <CardContent className="flex h-full flex-col items-center gap-4 p-8">
                    <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", ACCENT_CLASSES[accent])}>
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Grid>
        </StaggerContainer>
      </Container>
    </Section>
  );
}

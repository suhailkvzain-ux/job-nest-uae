import { BadgeCheck, Building2, Layers, MapPinned, RefreshCw, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/shared/json-ld";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { Card, CardContent } from "@/components/ui/card";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { getAllSettings } from "@/services/settings.service";
import { getHomeStats } from "@/services/stats.service";
import { formatNumber } from "@/utils/format";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "About Us",
    description:
      "Job For UAE is a job discovery platform — not a recruitment agency. Learn how we verify vacancies and why every application goes straight to the employer.",
    path: "/about",
  });
}

interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
}

const VALUES: Value[] = [
  {
    icon: BadgeCheck,
    title: "Verified Vacancies",
    description: "Every listing is checked against the employer's own official source before it goes live.",
  },
  {
    icon: Send,
    title: "Direct Employer Applications",
    description: "No accounts, no middleman. Every job sends you straight to the employer's own website or email.",
  },
  {
    icon: RefreshCw,
    title: "Updated Daily",
    description: "Fresh vacancies are added and expired ones removed every single day.",
  },
];

/**
 * `/about` — one of the four static content pages (About, Contact,
 * Privacy Policy, Terms & Conditions) the site's own footer and header
 * navigation have linked to since Phase 4, but which never had a route
 * behind them until this phase. Copy leads with `general.description`/
 * `general.tagline` from `/admin/settings` (Phase 13), so the page
 * reflects whatever the admin has actually configured rather than
 * hardcoded text baked into the deploy.
 */
export default async function AboutPage() {
  const [settings, stats, defaults] = await Promise.all([getAllSettings(), getHomeStats(), getSiteMetadataDefaults()]);

  const statEntries: { label: string; value: number; icon: LucideIcon }[] = [
    { label: "Live Vacancies", value: stats.totalJobs, icon: BadgeCheck },
    { label: "Companies", value: stats.totalCompanies, icon: Building2 },
    { label: "Categories", value: stats.totalCategories, icon: Layers },
    { label: "Locations", value: stats.totalLocations, icon: MapPinned },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{ name: "Home", url: defaults.baseUrl }, { name: "About", url: `${defaults.baseUrl}/about` }])} />

      <Section spacing="compact" className="border-b border-border/60 bg-surface pt-6">
        <Container>
          <Breadcrumb items={[{ label: "About" }]} />
        </Container>
      </Section>

      <Section spacing="default">
        <Container className="flex flex-col gap-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <Heading level="h1" as="h1">
              About {settings.general.websiteName}
            </Heading>
            <Paragraph tone="secondary">{settings.general.tagline}</Paragraph>
            <Paragraph tone="secondary">{settings.general.description}</Paragraph>
          </div>

          <Grid cols={{ base: 2, md: 4 }} gap="md">
            {statEntries.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="border-border/50 text-center">
                <CardContent className="flex flex-col items-center gap-2 p-6">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  <span className="text-2xl font-semibold tracking-tight text-foreground">{formatNumber(value)}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </CardContent>
              </Card>
            ))}
          </Grid>

          <div className="flex flex-col gap-4">
            <Heading level="h2" as="h2">
              How Job For UAE Works
            </Heading>
            <Paragraph tone="secondary">
              Job For UAE is a job <strong>discovery</strong> platform, not a recruitment agency. We don&apos;t host
              applications, collect candidate accounts, or sit between you and an employer. Every listing links directly
              to the employer&apos;s own official website or email — you apply exactly the way that employer intended.
            </Paragraph>
          </div>

          <Grid cols={{ base: 1, md: 3 }} gap="lg">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="h-full border-border/50 text-center">
                <CardContent className="flex h-full flex-col items-center gap-4 p-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <Paragraph tone="secondary" className="text-sm">
                      {description}
                    </Paragraph>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>
    </>
  );
}

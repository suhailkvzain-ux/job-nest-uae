import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/shared/json-ld";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { getAllSettings } from "@/services/settings.service";

export const revalidate = 3600;

const LAST_UPDATED = "11 July 2026";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Terms & Conditions",
    description: "The terms governing your use of Job For UAE.",
    path: "/terms",
  });
}

/**
 * `/terms` — like `/privacy`, written to reflect this platform's actual
 * scope (a discovery/aggregation service with no hosted applications
 * or accounts) rather than generic boilerplate. Starting template, not
 * legal advice — have it reviewed by qualified counsel before relying
 * on it.
 */
export default async function TermsPage() {
  const [settings, defaults] = await Promise.all([getAllSettings(), getSiteMetadataDefaults()]);
  const contactEmail = settings.contact.contactEmail || settings.email.replyToEmail;

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{ name: "Home", url: defaults.baseUrl }, { name: "Terms & Conditions", url: `${defaults.baseUrl}/terms` }])} />

      <Section spacing="compact" className="border-b border-border/60 bg-surface pt-6">
        <Container>
          <Breadcrumb items={[{ label: "Terms & Conditions" }]} />
        </Container>
      </Section>

      <Section spacing="default">
        <Container className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Heading level="h1" as="h1">
              Terms &amp; Conditions
            </Heading>
            <Paragraph tone="secondary" className="text-sm">
              Last updated: {LAST_UPDATED}
            </Paragraph>
          </div>

          <Paragraph tone="secondary">
            By using {settings.general.websiteName}, you agree to the terms below. This is a starting template
            describing this platform&apos;s actual behavior — it has not been reviewed by a lawyer, and the operator
            should have it reviewed before relying on it.
          </Paragraph>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              What We Provide
            </Heading>
            <Paragraph tone="secondary">
              {settings.general.websiteName} is a job discovery and aggregation platform. We publish vacancy listings
              sourced from official employers and organize them by category, location, and company so they&apos;re
              easy to find. We do not host job applications, resumes, or candidate accounts, and we are not a party to
              any employment relationship, offer, or agreement between you and any employer.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Applying to a Job
            </Heading>
            <Paragraph tone="secondary">
              Every &quot;Apply&quot; action on this site takes you to an employer&apos;s own official website or email
              address. Your application, and any information you submit as part of it, is governed entirely by that
              employer&apos;s own process and policies — not by {settings.general.websiteName}.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Accuracy of Listings
            </Heading>
            <Paragraph tone="secondary">
              We make a reasonable effort to verify each listing against its official employer source before publishing
              and to remove expired vacancies promptly, but we cannot guarantee that every listing is accurate, current,
              or still open at the moment you view it. Always confirm details directly with the employer.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              No Fees to Job Seekers
            </Heading>
            <Paragraph tone="secondary">
              Browsing and applying to jobs through {settings.general.websiteName} is free for job seekers. We do not
              charge candidates to view or apply to any listing, and any employer or third party asking a candidate to
              pay a fee to apply or be considered should be treated as a red flag, not something this platform
              endorses.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Acceptable Use
            </Heading>
            <Paragraph tone="secondary">
              You agree not to scrape, republish, or systematically extract listings from this site without
              permission, attempt to disrupt or gain unauthorized access to any part of the platform, or use the site
              for any unlawful purpose.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Third-Party Links &amp; Advertising
            </Heading>
            <Paragraph tone="secondary">
              This site links to third-party employer websites and may display third-party advertising (including
              Google AdSense). We aren&apos;t responsible for the content, availability, or practices of any external
              site linked from {settings.general.websiteName}.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Disclaimer &amp; Limitation of Liability
            </Heading>
            <Paragraph tone="secondary">
              The site and its listings are provided &quot;as is,&quot; without warranties of any kind. To the fullest
              extent permitted by law, {settings.general.websiteName} is not liable for any loss or damage arising from
              your use of the site or reliance on any listing.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Changes to These Terms
            </Heading>
            <Paragraph tone="secondary">
              We may update these terms from time to time as the platform changes. The &quot;Last updated&quot; date
              above reflects the most recent revision. Continued use of the site after a change means you accept the
              updated terms.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Contact Us
            </Heading>
            <Paragraph tone="secondary">
              Questions about these terms can be sent to{" "}
              {contactEmail ? (
                <a href={`mailto:${contactEmail}`} className="font-medium text-primary hover:underline">
                  {contactEmail}
                </a>
              ) : (
                "the contact details on our Contact page"
              )}
              .
            </Paragraph>
          </div>
        </Container>
      </Section>
    </>
  );
}

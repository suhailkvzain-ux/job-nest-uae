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
    title: "Privacy Policy",
    description: "How Job Nest UAE collects, uses, and protects information when you use the site.",
    path: "/privacy",
    noIndex: false,
  });
}

/**
 * `/privacy` — written to describe what this specific codebase
 * actually does (anonymous visitor cookie + analytics event log from
 * Phase 12, no public user accounts, links out to employers, optional
 * Google Analytics/AdSense once configured in Settings) rather than
 * generic boilerplate that would misdescribe the product. This is a
 * starting template, not legal advice — the operator should have it
 * reviewed by qualified counsel before relying on it in production,
 * particularly for compliance with the UAE's PDPL and any other
 * jurisdiction the site serves visitors from.
 */
export default async function PrivacyPolicyPage() {
  const [settings, defaults] = await Promise.all([getAllSettings(), getSiteMetadataDefaults()]);
  const contactEmail = settings.contact.contactEmail || settings.email.replyToEmail;

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{ name: "Home", url: defaults.baseUrl }, { name: "Privacy Policy", url: `${defaults.baseUrl}/privacy` }])} />

      <Section spacing="compact" className="border-b border-border/60 bg-surface pt-6">
        <Container>
          <Breadcrumb items={[{ label: "Privacy Policy" }]} />
        </Container>
      </Section>

      <Section spacing="default">
        <Container className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Heading level="h1" as="h1">
              Privacy Policy
            </Heading>
            <Paragraph tone="secondary" className="text-sm">
              Last updated: {LAST_UPDATED}
            </Paragraph>
          </div>

          <Paragraph tone="secondary">
            This page explains what {settings.general.websiteName} collects, why, and what it&apos;s used for. This
            policy is a starting template describing this platform&apos;s actual behavior — it has not been reviewed by
            a lawyer, and the operator should have it reviewed for their specific jurisdiction and obligations (including
            the UAE&apos;s Personal Data Protection Law) before relying on it.
          </Paragraph>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              What This Platform Is
            </Heading>
            <Paragraph tone="secondary">
              {settings.general.websiteName} is a job discovery platform, not a recruitment agency. We do not host
              candidate accounts, resumes, or job applications — every listing sends you directly to the employer&apos;s
              own official website or email to apply. We never collect or store your CV, cover letter, or application
              details.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Information We Collect
            </Heading>
            <Paragraph tone="secondary">
              We use a single, anonymous, first-party cookie to distinguish repeat visits from new ones, and log basic
              interaction events — page views, job views, and clicks on an employer&apos;s &quot;Apply&quot; link or
              email — so we can show which listings are performing well. These events do not include your name, email,
              or any other information that identifies you personally, and are not linked to any account (we don&apos;t
              have any). We also record a coarse device type (desktop or mobile) derived from your browser&apos;s
              user-agent string, and the referring page, when available.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Cookies
            </Heading>
            <Paragraph tone="secondary">
              The one cookie we set ourselves is used purely for the anonymous analytics described above and expires
              after one year. If Google Analytics, Google Tag Manager, or Google AdSense are enabled by the site
              operator (see below), those services set their own cookies under their own respective privacy policies,
              which we don&apos;t control.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Advertising &amp; Third-Party Services
            </Heading>
            <Paragraph tone="secondary">
              This site may display advertising, including through Google AdSense, and may use Google Analytics and
              Google Tag Manager for site analytics, where the operator has configured these in the site&apos;s admin
              settings. These third parties may use cookies or similar technologies to serve relevant ads and measure
              their performance. You can control ad personalization through Google&apos;s own Ads Settings, and manage
              cookies generally through your browser.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Links to Employer Websites
            </Heading>
            <Paragraph tone="secondary">
              Every job listing links out to an employer&apos;s own website or email address. Once you leave{" "}
              {settings.general.websiteName} to apply, that employer&apos;s own privacy practices apply — we have no
              visibility into, or responsibility for, what happens on their site.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Children&apos;s Privacy
            </Heading>
            <Paragraph tone="secondary">
              This platform is intended for job seekers of working age and is not directed at children. We do not
              knowingly collect information from children.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Changes to This Policy
            </Heading>
            <Paragraph tone="secondary">
              We may update this policy from time to time as the platform changes. The &quot;Last updated&quot; date
              above reflects the most recent revision.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3">
            <Heading level="h3" as="h2">
              Contact Us
            </Heading>
            <Paragraph tone="secondary">
              Questions about this policy can be sent to{" "}
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

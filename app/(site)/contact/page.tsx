import { Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
import { getAllSettings } from "@/services/settings.service";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Contact Us",
    description: "Get in touch with the Job Nest UAE team — general inquiries, support, and social channels.",
    path: "/contact",
  });
}

/**
 * `/contact` — sourced entirely from Phase 13's Settings ("Contact
 * Information" and "Social Media" sections), so updating an email,
 * phone number, or address in `/admin/settings` updates this page
 * immediately with no code change. Deliberately not a working contact
 * *form* — there's no SMTP send path wired up yet (see the Settings
 * module's Email section), so a form here would either silently fail
 * or need a fake success message. Direct email/phone is the honest
 * alternative until that's built.
 */
export default async function ContactPage() {
  const [settings, defaults] = await Promise.all([getAllSettings(), getSiteMetadataDefaults()]);
  const { contact, social } = settings;

  const contactMethods = [
    contact.contactEmail && { icon: Mail, label: "Email", value: contact.contactEmail, href: `mailto:${contact.contactEmail}` },
    contact.phone && { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s+/g, "")}` },
    contact.address && { icon: MapPin, label: "Office", value: contact.address, href: contact.mapsLink || undefined },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  const socialLinks = [
    social.linkedin && { icon: Linkedin, label: "LinkedIn", href: social.linkedin },
    social.instagram && { icon: Instagram, label: "Instagram", href: social.instagram },
    social.twitter && { icon: Twitter, label: "X (Twitter)", href: social.twitter },
  ].filter(Boolean) as { icon: typeof Linkedin; label: string; href: string }[];

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{ name: "Home", url: defaults.baseUrl }, { name: "Contact", url: `${defaults.baseUrl}/contact` }])} />

      <Section spacing="compact" className="border-b border-border/60 bg-surface pt-6">
        <Container>
          <Breadcrumb items={[{ label: "Contact" }]} />
        </Container>
      </Section>

      <Section spacing="default">
        <Container className="flex flex-col gap-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <Heading level="h1" as="h1">
              Contact Us
            </Heading>
            <Paragraph tone="secondary">
              Have a question about a listing, your company&apos;s profile, or Job Nest UAE in general? Reach us directly
              below.
            </Paragraph>
            {contact.supportEmail && (
              <Paragraph tone="secondary" className="text-sm">
                Looking for support instead?{" "}
                <a href={`mailto:${contact.supportEmail}`} className="font-medium text-primary hover:underline">
                  {contact.supportEmail}
                </a>
              </Paragraph>
            )}
          </div>

          {contactMethods.length > 0 ? (
            <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              {contactMethods.map(({ icon: Icon, label, value, href }) => (
                <Card key={label} className="border-border/50 text-center">
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
                    {href ? (
                      <Link
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                        className="text-sm font-medium text-foreground hover:text-primary"
                      >
                        {value}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-foreground">{value}</span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Paragraph tone="secondary" className="text-center">
              Contact details haven&apos;t been configured yet.
            </Paragraph>
          )}

          {socialLinks.length > 0 && (
            <div className="flex flex-col items-center gap-3">
              <Heading level="h3" as="h2">
                Follow Us
              </Heading>
              <div className="flex items-center gap-3">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-soft transition-colors hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

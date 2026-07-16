import { Bookmark, Mail, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { Card, CardContent } from "@/components/ui/card";
import { generateMetadata as buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Profile",
    description: "Job For UAE is a free, account-free job discovery platform. Manage your saved jobs and get in touch here.",
    path: "/profile",
    noIndex: true,
  });
}

const LINKS = [
  { href: "/saved", icon: Bookmark, title: "Saved Jobs", description: "Jobs you've bookmarked on this device." },
  { href: "/jobs", icon: Search, title: "Browse Jobs", description: "Search every verified vacancy on the platform." },
  { href: "/contact", icon: Mail, title: "Contact Us", description: "Questions, feedback, or a listing to report." },
];

/**
 * "Profile" tab destination — this site has no user accounts (job
 * seekers apply directly on the employer's own site/email, never
 * through us), so this is an information hub rather than a fake login
 * screen: shortcuts to Saved Jobs, Browse Jobs, and Contact, plus a
 * short explainer of why there's no sign-in.
 */
export default function ProfilePage() {
  return (
    <Section spacing="compact">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Heading level="h2" as="h1">
            Profile
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
            Job For UAE doesn&apos;t require an account — browse freely and apply directly on
            each employer&apos;s own site or email.
          </Paragraph>
        </div>

        <div className="mx-auto grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="block h-full">
              <Card className="h-full transition-shadow hover:shadow-soft-lg">
                <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                  <link.icon className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-foreground">{link.title}</span>
                  <span className="text-xs text-muted-foreground">{link.description}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mx-auto w-full max-w-2xl">
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Saved jobs are stored only on this device&apos;s browser (no server account), so
              they won&apos;t follow you to another device or browser — bookmark from any job
              listing to add it here.
            </p>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

import { Linkedin, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SiteBrandMark } from "@/components/shared/site-brand-mark";
import { footerNav } from "@/constants/nav";
import { siteConfig } from "@/constants/site";

export function Footer({ logoUrl }: { logoUrl?: string | null } = {}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <SiteBrandMark logoUrl={logoUrl} name={siteConfig.name} />
              {!logoUrl && <span>{siteConfig.name}</span>}
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Job For UAE on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-soft transition-colors hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Job For UAE on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-soft transition-colors hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Job For UAE on X"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-soft transition-colors hover:text-primary"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {footerNav.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>
            Job listings link out to employers&apos; official websites. Job For UAE is a discovery
            platform only.
          </p>
        </div>
      </Container>
    </footer>
  );
}

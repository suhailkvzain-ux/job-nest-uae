"use client";

import { CalendarClock, Mail, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/format";

interface ApplyCardProps {
  officialWebsite?: string | null;
  officialEmail?: string | null;
  applicationDeadline?: Date | string | null;
  vacancies?: number;
  /** Used to pre-fill the mailto link's subject line. */
  jobTitle?: string;
  onWebsiteClick?: () => void;
  onEmailClick?: () => void;
}

/**
 * Sticky "how to apply" card — always sends candidates to the employer's
 * own site/email (Job For UAE never hosts an application form). Wire
 * `onWebsiteClick`/`onEmailClick` to `incrementWebsiteClicks()` /
 * `incrementEmailClicks()` from the jobs service (bound Server Actions
 * passed down from the page). Renders nothing at all if neither
 * `officialWebsite` nor `officialEmail` is set — never an empty/disabled
 * button.
 */
export function ApplyCard({
  officialWebsite,
  officialEmail,
  applicationDeadline,
  vacancies,
  jobTitle,
  onWebsiteClick,
  onEmailClick,
}: ApplyCardProps) {
  if (!officialWebsite && !officialEmail) return null;

  const mailtoHref = officialEmail
    ? `mailto:${officialEmail}${jobTitle ? `?subject=${encodeURIComponent(`Application for ${jobTitle}`)}` : ""}`
    : undefined;

  return (
    <Card className="border-primary/20 bg-brand-gradient-soft">
      <CardHeader>
        <CardTitle className="text-base">Apply for this role</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Job For UAE is a discovery platform — you'll apply directly on the employer's official
          site or via email.
        </p>

        <div className="flex flex-col gap-2.5">
          {officialWebsite && (
            <Button
              asChild
              size="cta"
              className="w-full text-[15px] font-semibold shadow-soft-lg"
              onClick={onWebsiteClick}
            >
              <a href={officialWebsite} target="_blank" rel="noreferrer noopener">
                Apply on Official Website
              </a>
            </Button>
          )}
          {officialEmail && (
            <Button
              asChild
              variant="outline"
              size="cta"
              className="w-full text-[15px] font-semibold"
              onClick={onEmailClick}
            >
              <a href={mailtoHref}>
                <Mail className="h-4 w-4" /> Apply via Email
              </a>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          {applicationDeadline && (
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> Apply before {formatDate(applicationDeadline)}
            </span>
          )}
          {typeof vacancies === "number" && vacancies > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {vacancies} {vacancies === 1 ? "vacancy" : "vacancies"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

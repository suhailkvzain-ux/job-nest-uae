"use client";

import { ExternalLink, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApplyButtonsProps {
  officialWebsite?: string | null;
  officialEmail?: string | null;
  onWebsiteClick?: () => void;
  onEmailClick?: () => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

/**
 * The apply-button logic from the spec, in one place: website button if
 * `officialWebsite` is set, email button if `officialEmail` is set, both
 * if both exist, and — critically — renders nothing at all if neither
 * exists, rather than an empty/disabled button. Used inline on job list
 * cards; the job detail page's `ApplyCard` implements the same rule for
 * its larger sidebar buttons.
 */
export function ApplyButtons({
  officialWebsite,
  officialEmail,
  onWebsiteClick,
  onEmailClick,
  className,
  size = "sm",
}: ApplyButtonsProps) {
  if (!officialWebsite && !officialEmail) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {officialWebsite && (
        <Button asChild size={size} onClick={onWebsiteClick}>
          <a href={officialWebsite} target="_blank" rel="noreferrer noopener">
            Apply on Official Website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      )}
      {officialEmail && (
        <Button asChild size={size} variant="outline" onClick={onEmailClick}>
          <a href={`mailto:${officialEmail}`}>
            Apply via Email
            <Mail className="h-3.5 w-3.5" />
          </a>
        </Button>
      )}
    </div>
  );
}

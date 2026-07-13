import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  differenceInWeeks,
  format,
  formatDistanceToNow,
  isValid,
} from "date-fns";

/**
 * Domain-agnostic formatting helpers. Kept separate from `lib/utils.ts`
 * (which only holds the `cn()` styling helper) so display-formatting logic
 * has an obvious, single home as the app grows.
 */

/** e.g. "10 Jul 2026" */
export function formatDate(date: Date | string, pattern = "d MMM yyyy"): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return isValid(parsed) ? format(parsed, pattern) : "";
}

/** e.g. "3 days ago" — useful for generic relative timestamps. */
export function formatRelativeTime(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return isValid(parsed) ? formatDistanceToNow(parsed, { addSuffix: true }) : "";
}

/** Truncate long text (e.g. job descriptions in card previews). */
export function truncate(text: string, maxLength = 140): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/** URL-safe slug generator (e.g. company/job titles -> slugs). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * "Posted" time vocabulary used across job cards/detail pages: Just now,
 * X minutes/hours ago, Yesterday, X days ago, X weeks ago — falling back
 * to an absolute date beyond ~5 weeks so old listings don't show
 * "7 weeks ago" forever. Built on date-fns's difference* helpers rather
 * than `formatDistanceToNow` because the exact wording ("Just now",
 * "Yesterday") is specified by the design spec.
 */
export function formatPostedTime(date: Date | string): string {
  const posted = typeof date === "string" ? new Date(date) : date;
  if (!isValid(posted)) return "";

  const now = new Date();
  const minutes = differenceInMinutes(now, posted);
  const hours = differenceInHours(now, posted);
  const days = differenceInCalendarDays(now, posted);
  const weeks = differenceInWeeks(now, posted);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return formatDate(posted);
}

/** Turns a URL slug back into a readable label, e.g. "abu-dhabi" -> "Abu Dhabi". */
export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Turns a SCREAMING_SNAKE_CASE enum value (e.g. Prisma's `AdvertisementPosition`) into a human label — "JOBS_LISTING_TOP" → "Jobs Listing Top". */
export function humanizeEnumValue(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Formats a number with locale-aware thousand separators, e.g. 12,000. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-AE").format(value);
}

/** Computes click-through rate as a percentage (2 decimal places) from impressions and clicks. */
export function computeCtr(impressions: number, clicks: number): number {
  if (impressions <= 0) return 0;
  return Math.round((clicks / impressions) * 10000) / 100;
}

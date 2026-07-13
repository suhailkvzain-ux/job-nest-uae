"use client";

import { CalendarRange } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { buildAnalyticsFilterQueryString, parseAnalyticsFilterParams } from "@/lib/analytics-url";
import { cn } from "@/lib/utils";
import type { AnalyticsRange } from "@/lib/validations/analytics";
import { formatDate } from "@/utils/format";

const RANGE_OPTIONS: { label: string; value: AnalyticsRange }[] = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
];

/**
 * The dashboard's single date-range control — quick-pick buttons plus a
 * "Custom" option that opens a two-month range calendar. All state lives
 * in the URL (`range`/`from`/`to`), so the filter survives a page reload
 * and is shareable/bookmarkable, matching every other admin list page's
 * URL-as-state convention.
 */
export function AnalyticsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawParams = Object.fromEntries(searchParams.entries());
  const filter = parseAnalyticsFilterParams(rawParams);

  const [customOpen, setCustomOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(
    filter.range === "custom" ? { from: filter.from, to: filter.to } : undefined,
  );

  function applyRange(range: AnalyticsRange) {
    const qs = buildAnalyticsFilterQueryString({ range }, rawParams);
    router.push(`${pathname}${qs}`);
  }

  function applyCustomRange() {
    if (!draftRange?.from) return;
    const qs = buildAnalyticsFilterQueryString(
      { range: "custom", from: draftRange.from, to: draftRange.to ?? draftRange.from },
      rawParams,
    );
    setCustomOpen(false);
    router.push(`${pathname}${qs}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGE_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={filter.range === option.value ? "default" : "outline"}
          onClick={() => applyRange(option.value)}
        >
          {option.label}
        </Button>
      ))}

      <Popover open={customOpen} onOpenChange={setCustomOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant={filter.range === "custom" ? "default" : "outline"}
            className="gap-2"
          >
            <CalendarRange className="h-4 w-4" />
            {filter.range === "custom" && filter.from && filter.to
              ? `${formatDate(filter.from)} – ${formatDate(filter.to)}`
              : "Custom Range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0")} align="start">
          <Calendar
            mode="range"
            selected={draftRange}
            onSelect={setDraftRange}
            numberOfMonths={2}
            autoFocus
            disabled={(date) => date > new Date()}
          />
          <div className="flex justify-end gap-2 border-t border-border/60 p-3">
            <Button type="button" size="sm" variant="ghost" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" disabled={!draftRange?.from} onClick={applyCustomRange}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

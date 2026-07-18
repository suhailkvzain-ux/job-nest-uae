"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON_KEYS, getCategoryIcon } from "@/lib/icons/category-icons";

interface CategoryIconPickerProps {
  value: string | null | undefined;
  onChange: (icon: string) => void;
}

/**
 * The icon grid popup from the Categories spec — search field, grid of
 * outline icons, blue highlight on the selected one. Deliberately a
 * closed set (`CATEGORY_ICON_KEYS`) rather than a full icon-library
 * browser: the spec calls out a specific curated list, not "every
 * lucide icon," so admins aren't choosing from thousands of unrelated
 * glyphs.
 */
export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const SelectedIcon = getCategoryIcon(value);
  const filteredKeys = CATEGORY_ICON_KEYS.filter((key) =>
    key.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <SelectedIcon className="h-4 w-4" />
          Change Icon
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <Input
          placeholder="Search icons..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3 h-9"
          autoFocus
        />
        <div className="grid max-h-64 grid-cols-5 gap-2 overflow-y-auto">
          {filteredKeys.map((key) => {
            const Icon = getCategoryIcon(key);
            const selected = key === value;
            return (
              <button
                key={key}
                type="button"
                title={key}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
          {filteredKeys.length === 0 && (
            <p className="col-span-5 py-4 text-center text-xs text-muted-foreground">No icons found.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

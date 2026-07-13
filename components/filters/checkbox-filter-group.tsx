"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface CheckboxFilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

/**
 * Shared implementation behind `LocationFilter`, `CategoryFilter`,
 * `CompanyFilter`, and `EmploymentTypeFilter` — a titled list of
 * checkboxes with optional result counts, used inside the `/jobs` filter
 * sidebar.
 */
export function CheckboxFilterGroup({ title, options, selected, onChange, className }: CheckboxFilterGroupProps) {
  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="text-sm font-semibold text-foreground">{title}</legend>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => {
          const id = `filter-${title}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Checkbox id={id} checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
                <Label htmlFor={id} className="cursor-pointer font-normal text-foreground">
                  {option.label}
                </Label>
              </div>
              {typeof option.count === "number" && (
                <span className="text-xs text-muted-foreground">{option.count}</span>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

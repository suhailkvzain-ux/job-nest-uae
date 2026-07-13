import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JobSort } from "@/lib/validations/job";

export const SORT_OPTIONS: { label: string; value: JobSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Salary", value: "salary_desc" },
  { label: "Lowest Salary", value: "salary_asc" },
  { label: "A–Z", value: "az" },
  { label: "Featured First", value: "featured_first" },
];

interface SortFilterProps {
  value: JobSort;
  onChange: (value: JobSort) => void;
  /** Override the option list — e.g. the category/location/company detail pages only offer a 3-option subset. Defaults to the full 6-option `/jobs` list. */
  options?: { label: string; value: JobSort }[];
}

export function SortFilter({ value, onChange, options = SORT_OPTIONS }: SortFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as JobSort)}>
      <SelectTrigger className="w-full sm:w-56" aria-label="Sort jobs">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

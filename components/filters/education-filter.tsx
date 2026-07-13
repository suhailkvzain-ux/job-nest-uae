import { CheckboxFilterGroup } from "@/components/filters/checkbox-filter-group";

/**
 * Education is free text on `Job` (not a reference table like Category),
 * so its options come from the live, distinct values currently in use —
 * see `getDistinctEducationValues()` in `services/jobs.service.ts`.
 */
export function EducationFilter({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  if (options.length === 0) return null;

  return (
    <CheckboxFilterGroup
      title="Education"
      options={options.map((value) => ({ label: value, value }))}
      selected={selected}
      onChange={onChange}
    />
  );
}

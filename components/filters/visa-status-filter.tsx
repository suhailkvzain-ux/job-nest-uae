import { CheckboxFilterGroup } from "@/components/filters/checkbox-filter-group";

/** Same rationale as `EducationFilter` — visaStatus is free text on Job. */
export function VisaStatusFilter({
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
      title="Visa Status"
      options={options.map((value) => ({ label: value, value }))}
      selected={selected}
      onChange={onChange}
    />
  );
}

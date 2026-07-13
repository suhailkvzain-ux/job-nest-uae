import type { EmploymentType } from "@prisma/client";

import { CheckboxFilterGroup } from "@/components/filters/checkbox-filter-group";

const EMPLOYMENT_TYPE_OPTIONS: { label: string; value: EmploymentType }[] = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Temporary", value: "TEMPORARY" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Remote", value: "REMOTE" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Freelance", value: "FREELANCE" },
];

export function EmploymentTypeFilter({
  selected,
  onChange,
}: {
  selected: EmploymentType[];
  onChange: (selected: EmploymentType[]) => void;
}) {
  return (
    <CheckboxFilterGroup
      title="Employment Type"
      options={EMPLOYMENT_TYPE_OPTIONS}
      selected={selected}
      onChange={(values) => onChange(values as EmploymentType[])}
    />
  );
}

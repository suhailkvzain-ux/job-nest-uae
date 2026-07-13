import { CheckboxFilterGroup, type FilterOption } from "@/components/filters/checkbox-filter-group";

export function CompanyFilter({
  options,
  selected,
  onChange,
}: {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return <CheckboxFilterGroup title="Company" options={options} selected={selected} onChange={onChange} />;
}

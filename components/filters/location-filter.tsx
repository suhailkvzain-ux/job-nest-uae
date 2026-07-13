import { CheckboxFilterGroup, type FilterOption } from "@/components/filters/checkbox-filter-group";

export function LocationFilter({
  options,
  selected,
  onChange,
}: {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return <CheckboxFilterGroup title="Location" options={options} selected={selected} onChange={onChange} />;
}

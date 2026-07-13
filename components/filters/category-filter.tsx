import { CheckboxFilterGroup, type FilterOption } from "@/components/filters/checkbox-filter-group";

export function CategoryFilter({
  options,
  selected,
  onChange,
}: {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return <CheckboxFilterGroup title="Category" options={options} selected={selected} onChange={onChange} />;
}

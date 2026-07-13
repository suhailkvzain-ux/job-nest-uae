import { EntitySearch, type EntityOption } from "@/components/search/entity-search";

export function CategorySearch({
  categories,
  onSelect,
  className,
}: {
  categories: EntityOption[];
  onSelect: (category: EntityOption) => void;
  className?: string;
}) {
  return (
    <EntitySearch options={categories} onSelect={onSelect} placeholder="Search by category…" className={className} />
  );
}

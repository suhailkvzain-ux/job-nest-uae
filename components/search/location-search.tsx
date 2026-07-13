import { EntitySearch, type EntityOption } from "@/components/search/entity-search";

export function LocationSearch({
  locations,
  onSelect,
  className,
}: {
  locations: EntityOption[];
  onSelect: (location: EntityOption) => void;
  className?: string;
}) {
  return <EntitySearch options={locations} onSelect={onSelect} placeholder="Search by location…" className={className} />;
}

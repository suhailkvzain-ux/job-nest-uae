import { EntitySearch, type EntityOption } from "@/components/search/entity-search";

export function CompanySearch({
  companies,
  onSelect,
  className,
}: {
  companies: EntityOption[];
  onSelect: (company: EntityOption) => void;
  className?: string;
}) {
  return (
    <EntitySearch options={companies} onSelect={onSelect} placeholder="Search by company…" className={className} />
  );
}

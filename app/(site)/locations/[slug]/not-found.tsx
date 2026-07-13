import { MapPinned } from "lucide-react";

import { EntityNotFound } from "@/components/shared/entity-not-found";

export default function LocationNotFound() {
  return <EntityNotFound icon={MapPinned} label="location" browseHref="/locations" browseLabel="Browse all locations" />;
}

import { Layers } from "lucide-react";

import { EntityNotFound } from "@/components/shared/entity-not-found";

export default function CategoryNotFound() {
  return <EntityNotFound icon={Layers} label="category" browseHref="/categories" browseLabel="Browse all categories" />;
}

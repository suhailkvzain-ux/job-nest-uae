import { Building2 } from "lucide-react";

import { EntityNotFound } from "@/components/shared/entity-not-found";

export default function CompanyNotFound() {
  return <EntityNotFound icon={Building2} label="company" browseHref="/companies" browseLabel="Browse all companies" />;
}

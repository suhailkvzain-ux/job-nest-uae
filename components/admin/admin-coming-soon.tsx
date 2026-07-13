import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

/**
 * Placeholder body for every admin section this phase intentionally
 * doesn't build out yet (Jobs/Companies/Categories/Locations/
 * Advertisements/Analytics/Settings management — Phase 8's brief is the
 * dashboard and its shell only: "Do NOT build CRUD pages yet"). Kept as
 * one shared component so swapping each section for its real management
 * UI in a future phase is a one-file change per route.
 */
export function AdminComingSoon({ label, icon: Icon = Construction }: { label: string; icon?: LucideIcon }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={Icon}
        title={`${label} management is coming soon`}
        description="This section will let you create, edit, and manage records directly from the dashboard in a future phase."
      />
    </div>
  );
}

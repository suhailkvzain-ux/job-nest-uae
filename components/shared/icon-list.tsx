import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface IconListItem {
  icon: LucideIcon;
  label: string;
}

/**
 * List of label + leading icon rows — used for job requirements/benefits
 * and quick-fact rows (e.g. CompanyInfoCard).
 */
export function IconList({ items, className }: { items: IconListItem[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map(({ icon: Icon, label }, i) => (
        <li key={i} className="flex items-start gap-3 text-body text-text-secondary">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="pt-0.5">{label}</span>
        </li>
      ))}
    </ul>
  );
}

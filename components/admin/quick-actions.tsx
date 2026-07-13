import { BarChart3, Briefcase, Building2, Layers, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  { label: "Create New Job", href: "/admin/jobs", icon: Plus },
  { label: "Manage Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Manage Companies", href: "/admin/companies", icon: Building2 },
  { label: "Manage Categories", href: "/admin/categories", icon: Layers },
  { label: "View Analytics", href: "/admin/analytics", icon: BarChart3 },
];

/**
 * Shortcut tiles to each management section. All five currently land on
 * their section's "coming soon" placeholder (see `AdminComingSoon`) —
 * that's expected this phase, not a broken link, since the CRUD screens
 * themselves are out of scope until a later phase.
 */
export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {quickActions.map(({ label, href, icon: Icon }) => (
        <Link key={label} href={href} className="block h-full">
          <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-soft-lg">
            <CardContent className="flex h-full flex-col items-center justify-center gap-2.5 p-5 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary transition-colors group-hover:bg-brand-gradient group-hover:text-primary-foreground">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

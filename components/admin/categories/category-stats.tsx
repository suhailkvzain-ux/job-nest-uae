import { Briefcase, CircleOff, Grid3x3, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { AdminCategoryStats } from "@/services/categories.service";
import { formatNumber } from "@/utils/format";

/** The four stat cards atop `/admin/categories`, matching the reference spec. */
export function CategoryStats({ stats }: { stats: AdminCategoryStats }) {
  const cards = [
    { label: "Total Categories", value: stats.total, icon: Grid3x3, tone: "text-primary" },
    { label: "Active Categories", value: stats.active, icon: ShieldCheck, tone: "text-badge-green-foreground" },
    { label: "Hidden Categories", value: stats.hidden, icon: CircleOff, tone: "text-muted-foreground" },
    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, tone: "text-badge-blue-foreground" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="transition-transform hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="flex items-center justify-between gap-3 pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{card.label}</span>
              <span className="text-3xl font-semibold text-foreground">{formatNumber(card.value)}</span>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-muted ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

/** Compact metric card — e.g. "12,400 Jobs Posted", "340 Companies". */
export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="flex items-center gap-4 p-6">
        {Icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-semibold tracking-tight text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
          {trend && (
            <span className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
              {trend.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

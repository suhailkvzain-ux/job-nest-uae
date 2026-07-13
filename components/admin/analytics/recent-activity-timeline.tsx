import type { ActivityAction } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Archive, BadgeCheck, FileEdit, LogIn, LogOut, Megaphone, PlusCircle, Settings, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

interface ActivityRow {
  id: string;
  action: ActivityAction;
  entityLabel: string;
  adminEmail?: string | null;
  createdAt: Date;
}

const ACTION_META: Record<ActivityAction, { label: string; icon: LucideIcon; tone: string }> = {
  JOB_CREATED: { label: "Job Created", icon: PlusCircle, tone: "text-success" },
  JOB_PUBLISHED: { label: "Job Published", icon: BadgeCheck, tone: "text-success" },
  JOB_UPDATED: { label: "Job Updated", icon: FileEdit, tone: "text-primary" },
  JOB_ARCHIVED: { label: "Job Archived", icon: Archive, tone: "text-muted-foreground" },
  JOB_DELETED: { label: "Job Deleted", icon: Trash2, tone: "text-destructive" },
  ADVERTISEMENT_UPDATED: { label: "Advertisement Updated", icon: Megaphone, tone: "text-primary" },
  SETTINGS_UPDATED: { label: "Settings Updated", icon: Settings, tone: "text-primary" },
  ADMIN_LOGIN: { label: "Admin Login", icon: LogIn, tone: "text-success" },
  ADMIN_LOGOUT: { label: "Admin Logout", icon: LogOut, tone: "text-muted-foreground" },
};

/**
 * Recent Activity feed — every audited admin action (job lifecycle,
 * advertisement/settings changes, login/logout — the full Phase 16
 * audit-logging list), relative timestamps via `date-fns`. Shows the
 * acting administrator's email alongside each entry when present
 * (Phase 16 addition — older rows written before that column existed
 * simply omit it).
 */
export function RecentActivityTimeline({ items }: { items: ActivityRow[] }) {
  if (items.length === 0) {
    return <EmptyState title="No recent activity" description="Actions across jobs and advertisements will appear here." />;
  }

  return (
    <ol className="flex flex-col gap-1">
      {items.map((item) => {
        const meta = ACTION_META[item.action];
        const Icon = meta.icon;
        return (
          <li key={item.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60">
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient-soft ${meta.tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm text-foreground">
                <span className="font-medium">{meta.label}</span>{" "}
                <span className="truncate text-muted-foreground">— {item.entityLabel}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                {item.adminEmail ? ` · ${item.adminEmail}` : ""}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

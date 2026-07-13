import {
  BarChart3,
  Briefcase,
  Building2,
  LayoutDashboard,
  Layers,
  MapPinned,
  Megaphone,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Sidebar menu, in display order — mirrors the Phase 8 spec's route list exactly. */
export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Locations", href: "/admin/locations", icon: MapPinned },
  { label: "Advertisements", href: "/admin/advertisements", icon: Megaphone },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

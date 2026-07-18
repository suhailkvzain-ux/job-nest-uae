import {
  Briefcase,
  Building2,
  Laptop,
  HeartPulse,
  Hammer,
  GraduationCap,
  ShoppingBag,
  Truck,
  Plane,
  Hotel,
  Utensils,
  Shield,
  HardHat,
  Wrench,
  Factory,
  BarChart3,
  DollarSign,
  Headphones,
  Paintbrush,
  Camera,
  Scissors,
  Stethoscope,
  Globe,
  Boxes,
  ClipboardList,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

/**
 * The fixed set of category icons an admin can pick from — outline
 * lucide icons only, never emoji, per the admin design spec ("No
 * emojis. Only premium outline icons."). Keyed by a stable string
 * (`icon` column value) rather than storing the component itself, so
 * the DB stays serializable and the icon set can grow without a
 * migration.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  building: Building2,
  laptop: Laptop,
  "heart-pulse": HeartPulse,
  hammer: Hammer,
  "graduation-cap": GraduationCap,
  "shopping-bag": ShoppingBag,
  truck: Truck,
  plane: Plane,
  hotel: Hotel,
  utensils: Utensils,
  shield: Shield,
  "hard-hat": HardHat,
  wrench: Wrench,
  factory: Factory,
  chart: BarChart3,
  dollar: DollarSign,
  headphones: Headphones,
  "paint-brush": Paintbrush,
  camera: Camera,
  scissors: Scissors,
  stethoscope: Stethoscope,
  globe: Globe,
  boxes: Boxes,
  clipboard: ClipboardList,
  "light-bulb": Lightbulb,
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export const DEFAULT_CATEGORY_ICON = "briefcase";

export function getCategoryIcon(icon?: string | null): LucideIcon {
  return CATEGORY_ICONS[icon ?? ""] ?? CATEGORY_ICONS[DEFAULT_CATEGORY_ICON];
}

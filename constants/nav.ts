/**
 * Header / footer navigation. Centralized so layout components stay
 * declarative and new links don't require touching component code.
 */
export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Categories", href: "/categories" },
  { label: "Companies", href: "/companies" },
  { label: "Locations", href: "/locations" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Quick Links",
    items: [
      { label: "Categories", href: "/categories" },
      { label: "Companies", href: "/companies" },
      { label: "Locations", href: "/locations" },
      { label: "About", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

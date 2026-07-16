/**
 * Header / footer navigation. Centralized so layout components stay
 * declarative and new links don't require touching component code.
 */
export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Categories", href: "/categories" },
  { label: "Locations", href: "/locations" },
  { label: "Career Advice", href: "/career-advice" },
  { label: "Salary Guide", href: "/salary-guide" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "For Job Seekers",
    items: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Categories", href: "/categories" },
      { label: "Locations", href: "/locations" },
      { label: "Saved Jobs", href: "/saved" },
      { label: "Career Advice", href: "/career-advice" },
      { label: "Salary Guide", href: "/salary-guide" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Companies", href: "/companies" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

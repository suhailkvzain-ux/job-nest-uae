/**
 * Single source of truth for site-wide metadata and identity.
 * Import this anywhere instead of hardcoding the name/URL/description.
 */
export const siteConfig = {
  name: "Job Nest UAE",
  shortName: "Job Nest",
  description:
    "Discover verified job vacancies across the UAE. Job Nest UAE is a job discovery platform — browse listings and apply directly on the employer's official website.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  keywords: [
    "jobs in UAE",
    "Dubai jobs",
    "Abu Dhabi jobs",
    "UAE careers",
    "job vacancies UAE",
    "job discovery platform",
  ],
  locale: "en_AE",
  country: "United Arab Emirates",
  social: {
    linkedin: "https://linkedin.com/company/job-nest-uae",
    instagram: "https://instagram.com/jobnestuae",
    twitter: "https://twitter.com/jobnestuae",
  },
} as const;

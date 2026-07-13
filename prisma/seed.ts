import { PrismaClient } from "@prisma/client";

import { slugify } from "../utils/format";

/**
 * Seed script — run via `npm run prisma:seed` (wired through
 * `prisma.seed` in package.json, so `prisma migrate reset` also runs it
 * automatically). Populates enough reference data + sample jobs to
 * develop and demo the public site end-to-end.
 *
 * Idempotent: every `create` is guarded by a slug/email lookup (or uses
 * `upsert`), so re-running the seed doesn't create duplicates.
 */
const prisma = new PrismaClient();

const LOCATIONS = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
  "Al Ain",
];

// Per Phase 10's Master Data Management spec — the 15 default
// categories every fresh deployment should seed. Renamed from this
// seed's original 10-category list (e.g. "Information Technology" →
// "IT & Software", "Finance & Accounting" → "Accounting & Finance") to
// match the spec exactly; the sample jobs below were updated to
// reference the new names so `findCategory()` still resolves.
const CATEGORIES = [
  "Accounting & Finance",
  "Administration",
  "Architecture & Interior Design",
  "Construction",
  "Customer Service",
  "Engineering",
  "Healthcare",
  "Hospitality",
  "IT & Software",
  "Marketing",
  "Sales",
  "Retail",
  "Human Resources",
  "Education",
  "Logistics",
];

const COMPANIES = [
  {
    name: "Falcon Gulf Technologies",
    website: "https://falcongulftech.example.com",
    description: "A Dubai-based enterprise software company serving clients across the GCC.",
  },
  {
    name: "Emirates Horizon Hospitality",
    website: "https://emirateshorizon.example.com",
    description: "A hospitality group operating hotels and resorts across the UAE.",
  },
  {
    name: "Al Reem Construction Group",
    website: "https://alreemconstruction.example.com",
    description: "A leading construction and engineering contractor based in Abu Dhabi.",
  },
  {
    name: "Marina Capital Partners",
    website: "https://marinacapital.example.com",
    description: "A Dubai-based financial services and investment advisory firm.",
  },
  {
    name: "Desert Rose Logistics",
    website: "https://desertroselogistics.example.com",
    description: "A regional logistics and supply chain operator headquartered in Sharjah.",
  },
];

async function seedLocations() {
  const locations = await Promise.all(
    LOCATIONS.map((name) =>
      prisma.location.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );
  console.log(`Seeded ${locations.length} locations`);
  return locations;
}

async function seedCategories() {
  const categories = await Promise.all(
    CATEGORIES.map((name) =>
      prisma.category.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );
  console.log(`Seeded ${categories.length} categories`);
  return categories;
}

async function seedCompanies() {
  const companies = await Promise.all(
    COMPANIES.map((company) =>
      prisma.company.upsert({
        where: { slug: slugify(company.name) },
        update: {},
        create: { ...company, slug: slugify(company.name) },
      }),
    ),
  );
  console.log(`Seeded ${companies.length} companies`);
  return companies;
}

// Deliberately no `seedAdmin()`. This project authenticates entirely
// through Supabase Auth (see `actions/auth.actions.ts` / `middleware.ts`)
// — the `Admin` table + `passwordHash` column in the Prisma schema
// predate that and are not read by any real auth code path today. A
// seed step that upserted a row here with a hardcoded default password
// (as an earlier version of this script did) is a textbook
// default-credentials liability: a known password sitting in version
// control for a table that *looks* like it gates access, even though
// nothing currently checks it. The one real administrator account is
// created once, manually, directly in the Supabase dashboard — see
// `.env.example`'s `ADMIN_EMAIL` comment.

async function seedAdvertisements() {
  // One starter Custom HTML ad per original (Phase 2) position — the 12
  // page-specific positions Phase 11 added are intentionally left
  // unseeded, so a fresh install also demonstrates `AdSlot`'s "gracefully
  // handle empty ad spaces" behavior out of the box.
  const ads: {
    name: string;
    position: "TOP_BANNER" | "MIDDLE_BANNER" | "BOTTOM_BANNER" | "DESKTOP_SIDEBAR" | "MOBILE_BANNER";
    htmlCode: string;
  }[] = [
    { name: "Top Banner — Starter", position: "TOP_BANNER", htmlCode: "<!-- top banner ad slot placeholder -->" },
    { name: "Middle Banner — Starter", position: "MIDDLE_BANNER", htmlCode: "<!-- middle banner ad slot placeholder -->" },
    { name: "Bottom Banner — Starter", position: "BOTTOM_BANNER", htmlCode: "<!-- bottom banner ad slot placeholder -->" },
    { name: "Desktop Sidebar — Starter", position: "DESKTOP_SIDEBAR", htmlCode: "<!-- sidebar ad slot placeholder -->" },
    { name: "Mobile Banner — Starter", position: "MOBILE_BANNER", htmlCode: "<!-- mobile banner ad slot placeholder -->" },
  ];

  let count = 0;
  for (const ad of ads) {
    const existing = await prisma.advertisement.findFirst({ where: { position: ad.position } });
    if (!existing) {
      await prisma.advertisement.create({ data: { ...ad, adType: "CUSTOM_HTML", status: "ACTIVE" } });
      count += 1;
    }
  }
  console.log(`Seeded ${count} advertisements (skipped ${ads.length - count} already present)`);
}

async function seedJobs(
  locations: Awaited<ReturnType<typeof seedLocations>>,
  categories: Awaited<ReturnType<typeof seedCategories>>,
  companies: Awaited<ReturnType<typeof seedCompanies>>,
) {
  const findLocation = (name: string) => locations.find((l) => l.name === name)!;
  const findCategory = (name: string) => categories.find((c) => c.name === name)!;
  const findCompany = (name: string) => companies.find((c) => c.name === name)!;

  const sampleJobs = [
    {
      title: "Senior Full-Stack Engineer",
      company: "Falcon Gulf Technologies",
      category: "IT & Software",
      location: "Dubai",
      description:
        "Falcon Gulf Technologies is hiring a Senior Full-Stack Engineer to build and scale our client-facing SaaS products.",
      responsibilities: "Design APIs and services; ship features across the stack; mentor junior engineers.",
      requirements: "5+ years of experience with TypeScript, React, and Node.js; strong SQL fundamentals.",
      benefits: "Health insurance, annual flight allowance, performance bonus.",
      employmentType: "FULL_TIME" as const,
      experience: "5-8 years",
      salaryMin: 18000,
      salaryMax: 25000,
      education: "Bachelor's in Computer Science or related field",
      visaStatus: "Company-sponsored visa provided",
      nationality: "Any",
      languages: ["English"],
      vacancies: 2,
      officialWebsite: "https://falcongulftech.example.com/careers",
      officialEmail: "careers@falcongulftech.example.com",
      status: "PUBLISHED" as const,
      featured: true,
      verified: true,
    },
    {
      title: "Hotel Front Desk Manager",
      company: "Emirates Horizon Hospitality",
      category: "Hospitality",
      location: "Abu Dhabi",
      description:
        "Lead the front-of-house team at a 5-star property in Abu Dhabi, ensuring exceptional guest experiences.",
      responsibilities: "Supervise front desk staff; manage guest escalations; oversee daily check-in/check-out operations.",
      requirements: "3+ years in hotel front office management; fluent English; Arabic is a plus.",
      benefits: "Accommodation allowance, medical insurance, annual leave flight ticket.",
      employmentType: "FULL_TIME" as const,
      experience: "3-5 years",
      salaryMin: 8000,
      salaryMax: 11000,
      education: "Diploma in Hospitality Management preferred",
      visaStatus: "Company-sponsored visa provided",
      nationality: "Any",
      languages: ["English", "Arabic"],
      vacancies: 1,
      officialWebsite: "https://emirateshorizon.example.com/careers",
      officialEmail: null,
      status: "PUBLISHED" as const,
      featured: true,
      verified: true,
    },
    {
      title: "Site Engineer — Civil",
      company: "Al Reem Construction Group",
      category: "Construction",
      location: "Abu Dhabi",
      description: "Oversee on-site civil works for a major infrastructure project in Abu Dhabi.",
      responsibilities: "Supervise site crews; ensure compliance with safety standards; report progress to project managers.",
      requirements: "Bachelor's in Civil Engineering; 4+ years UAE site experience; valid UAE driving license.",
      benefits: "Transportation provided, medical insurance, overtime pay.",
      employmentType: "FULL_TIME" as const,
      experience: "4-6 years",
      salaryMin: 9000,
      salaryMax: 13000,
      education: "Bachelor's in Civil Engineering",
      visaStatus: "Company-sponsored visa provided",
      nationality: "Any",
      languages: ["English"],
      vacancies: 3,
      officialWebsite: null,
      officialEmail: "hr@alreemconstruction.example.com",
      status: "PUBLISHED" as const,
      featured: false,
      verified: true,
    },
    {
      title: "Investment Analyst",
      company: "Marina Capital Partners",
      category: "Accounting & Finance",
      location: "Dubai",
      description: "Support the investment team with market research, financial modeling, and due diligence.",
      responsibilities: "Build financial models; prepare investment memos; track portfolio performance.",
      requirements: "2+ years in investment banking, private equity, or equity research; CFA Level 1+ preferred.",
      benefits: "Performance bonus, health insurance, professional development budget.",
      employmentType: "FULL_TIME" as const,
      experience: "2-4 years",
      salaryMin: 15000,
      salaryMax: 20000,
      education: "Bachelor's in Finance, Economics, or related field",
      visaStatus: "Company-sponsored visa provided",
      nationality: "Any",
      languages: ["English"],
      vacancies: 1,
      officialWebsite: "https://marinacapital.example.com/careers",
      officialEmail: "talent@marinacapital.example.com",
      status: "PUBLISHED" as const,
      featured: false,
      verified: false,
    },
    {
      title: "Warehouse Operations Supervisor",
      company: "Desert Rose Logistics",
      category: "Logistics",
      location: "Sharjah",
      description: "Manage day-to-day warehouse operations for a growing regional logistics operator.",
      responsibilities: "Coordinate inbound/outbound shipments; manage warehouse staff; maintain inventory accuracy.",
      requirements: "3+ years warehouse/logistics supervisory experience; WMS software experience preferred.",
      benefits: "Housing allowance, medical insurance, annual bonus.",
      employmentType: "FULL_TIME" as const,
      experience: "3-5 years",
      salaryMin: 7000,
      salaryMax: 9500,
      education: "High school diploma; relevant certifications a plus",
      visaStatus: "Company-sponsored visa provided",
      nationality: "Any",
      languages: ["English", "Hindi"],
      vacancies: 1,
      officialWebsite: "https://desertroselogistics.example.com/careers",
      officialEmail: null,
      status: "PUBLISHED" as const,
      featured: false,
      verified: false,
    },
    {
      title: "Marketing Intern",
      company: "Falcon Gulf Technologies",
      category: "Marketing",
      location: "Dubai",
      description: "A 6-month internship supporting the marketing team with content, campaigns, and social media.",
      responsibilities: "Assist with content calendars; support campaign execution; compile performance reports.",
      requirements: "Currently pursuing or recently completed a degree in Marketing or Communications.",
      benefits: "Monthly stipend, mentorship, potential for full-time conversion.",
      employmentType: "INTERNSHIP" as const,
      experience: "0-1 years",
      salaryMin: 2500,
      salaryMax: 3500,
      education: "Bachelor's degree in progress or completed",
      visaStatus: "Visit visa acceptable",
      nationality: "Any",
      languages: ["English"],
      vacancies: 1,
      officialWebsite: "https://falcongulftech.example.com/careers",
      officialEmail: null,
      status: "DRAFT" as const,
      featured: false,
      verified: false,
    },
  ];

  let count = 0;
  for (const job of sampleJobs) {
    const slug = slugify(`${job.title}-${job.company}`);
    const existing = await prisma.job.findUnique({ where: { slug } });
    if (existing) continue;

    const { company, category, location, ...rest } = job;

    await prisma.job.create({
      data: {
        ...rest,
        slug,
        companyId: findCompany(company).id,
        categoryId: findCategory(category).id,
        locationId: findLocation(location).id,
        salaryCurrency: "AED",
        publishedAt: rest.status === "PUBLISHED" ? new Date() : null,
      },
    });
    count += 1;
  }
  console.log(`Seeded ${count} jobs (skipped ${sampleJobs.length - count} already present)`);
}

async function main() {
  const locations = await seedLocations();
  const categories = await seedCategories();
  const companies = await seedCompanies();
  await seedAdvertisements();
  await seedJobs(locations, categories, companies);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

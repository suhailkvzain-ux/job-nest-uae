# Job Nest UAE — Project Foundation

A job **discovery** platform for the UAE. Users browse verified vacancies and
apply directly on the employer's official website or email — there are no
accounts, applications, resumes, or messaging on this site. Only a single
admin manages listings (built in a later phase).

This repository currently contains the **foundation only**: architecture,
tooling, design system, and reusable components. No homepage content, admin
panel, database schema, job pages, or auth are built yet — by design.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui-style
primitives · Supabase (Postgres + Storage) · Prisma ORM · React Hook Form +
Zod · TanStack Query · Framer Motion · Lucide React · date-fns · deploys to
Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + database values
npm run prisma:generate
npm run dev
```

## Folder structure

```
job-nest-uae/
├─ app/                    Next.js App Router: routes, layouts, SEO files
├─ components/
│  ├─ ui/                  Base primitives (Button, Select, Checkbox, Slider, Calendar, ...)
│  ├─ layout/               Header, Footer, Container, Section, Grid, Stack, Divider, Breadcrumb
│  ├─ typography/           Heading, Text/Paragraph/Caption/FieldLabel
│  ├─ shared/               Cross-page utilities (SearchBar, Pagination, IconButton, ScrollToTop, ...)
│  ├─ cards/                Non-job card variants (Company, Category, Location, Stat, Glass)
│  ├─ badges/               Status badges (Verified, Featured, New, Remote, EmploymentType)
│  ├─ jobs/                 Job-domain components (JobCard, JobDetails, ApplyCard, ...)
│  ├─ search/                Search bar, dropdown, suggestions, per-entity search
│  ├─ filters/               /jobs filter sidebar components
│  ├─ forms/                React Hook Form + Zod input components
│  ├─ motion/                Framer Motion wrapper components
│  ├─ home/                  Home page section compositions (Phase 4)
│  └─ providers/            App-wide client providers (TanStack Query)
├─ lib/                    Framework glue: Prisma client, Supabase clients, SEO, fonts, cn()
├─ utils/                  Pure display/formatting helpers (dates, slugs, truncation)
├─ types/                  Shared, framework-level TypeScript types
├─ constants/              Site config and navigation — single source of truth
├─ hooks/                  Reusable client hooks (debounce, media query, scroll)
├─ actions/                Server Actions: jobs.actions.ts (loadMoreLatestJobsAction); rest documented, added with admin panel
├─ services/               Data access layer (wraps Prisma): jobs, companies, categories, locations, advertisements
├─ prisma/                 schema.prisma, migrations/, seed.ts — full data model (Phase 2)
├─ public/                 Static assets
└─ styles/                 Reserved for non-Tailwind CSS (currently empty)
```

### Why each folder exists

`app/` holds only routing, layouts, and Next.js file conventions
(`loading.tsx`, `error.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts`,
`manifest.ts`) — no business logic.

`components/ui/` is the base design-system layer: unopinionated primitives
that everything else composes. `components/layout/` is structural and present
on every page. `components/shared/` is reusable across page types but isn't a
primitive (e.g. `Pagination` is domain-agnostic but more specific than
`Button`). `components/jobs/` and `components/forms/` are placeholders so
future work has an obvious, pre-agreed home.

`lib/` vs `utils/`: `lib/` is framework/infra glue (database clients, SEO
metadata builder, the `cn()` styling helper) — things tightly coupled to
Next.js/Prisma/Supabase. `utils/` is plain, portable formatting logic with no
framework dependency (dates, slugs, number formatting).

`actions/` and `services/` are separated so mutations (actions: auth checks,
validation, revalidation) don't get tangled with data access (services: raw
Prisma queries). Both are currently just READMEs documenting the convention,
since the Prisma schema — and therefore anything to query or mutate — is
scoped to the next phase.

`constants/` centralizes site identity and navigation so they're edited in
one place rather than hardcoded across components.

## Design system

Defined in `tailwind.config.ts` (scales, radius, shadows, animation) and
`app/globals.css` (CSS variable tokens consumed by Tailwind's `hsl(var(--x))`
pattern):

- **Color** — white background, `--primary`/`--brand-start`/`--brand-end`
  drive a blue gradient accent (`bg-brand-gradient`). All tokens are HSL
  triples so opacity modifiers (`bg-primary/10`) work.
- **Radius** — base `--radius: 20px`; Tailwind's `rounded-2xl` maps to it.
- **Shadows** — `shadow-soft` / `shadow-soft-lg` / `shadow-glass` are soft,
  diffused shadows rather than hard drop shadows.
- **Glassmorphism** — `.glass` utility class (blurred, translucent surface),
  used by the sticky header.
- **Spacing** — generous defaults; `Section` component provides
  `default` (py-16/24), `compact`, and `none` vertical rhythm.
- **Typography** — Inter (via `next/font/google`), loaded once in
  `lib/fonts.ts` and applied through the `font-sans` Tailwind token.
- **Motion** — Framer Motion for interactive transitions (e.g. mobile nav
  slide-down); CSS keyframes (`fade-in`, `fade-in-up`, `shimmer`) for
  lighter-weight, non-interactive animation.

## Explicitly out of scope (next phase)

Homepage content, admin panel/auth, Prisma data model (Job, Company,
Category, ...), job listing pages, and any real data fetching. This
foundation is meant to make that phase drop in without restructuring.

## Phase 2 — Database & backend foundation

Adds the full Prisma data model, a hand-validated initial migration, Zod
validation, and a service (data-access) layer. Still no admin panel/auth
and no UI wiring to real data — this phase is backend-only, per scope.

### Tables

**admins** — the single operator account. One row, managed manually /
via the seed script; there's no admin signup flow since the product has
exactly one admin by design.

**companies** — employers referenced by jobs. Admin-managed reference
data; `slug` is unique (URL identity), `name` has its own index for
listing/search.

**categories** — job function/industry taxonomy (e.g. "Information
Technology"). Same shape as companies: unique `slug`, indexed `name`.

**locations** — the emirate a job is based in. Seeded with all 7
emirates plus Al Ain: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah,
Fujairah, Umm Al Quwain, Al Ain.

**jobs** — the core listing: every field from the spec (identity,
description/responsibilities/requirements/benefits, employment details,
compensation, eligibility, external application links, lifecycle
status, SEO meta, timestamps). Soft-deleted via `deletedAt` — see
"Soft delete" below.

**advertisements** — one row per ad slot the Admin has configured
(Top Banner, Middle Banner, Bottom Banner, Sidebar, Mobile Banner).
Holds raw `adCode` and an `enabled` toggle; rendered by the existing
`AdPlaceholder` component in a later phase.

**analytics** — one row per job (`jobId` is unique), with counters for
views and each click type. Created lazily on first event via `upsert`,
not pre-created for every job.

### Relationships

`Job belongsTo Company`, `Job belongsTo Category`, `Job belongsTo
Location` — all three are required (`NOT NULL`), `onDelete: Restrict`,
so a Company/Category/Location in use by any job can't be deleted out
from under it (delete or reassign its jobs first). `Job hasOne
Analytics`, `onDelete: Cascade` — deleting a job (a hard delete, which
the service layer never actually does) cleans up its analytics row
automatically.

### Enums

`EmploymentType` (8 values), `JobStatus` (Draft/Published/Scheduled/
Archived), `AdvertisementPosition` (5 placements) — all defined as
native Postgres enums for data integrity, mirrored as Zod enums in
`lib/validations/` so the same value set is enforced at the API
boundary before it ever reaches the database.

### Soft delete

`Job.deletedAt` is nullable; `deleteJob()` in `services/jobs.service.ts`
only ever sets it to `now()`, never issues a real `DELETE`.
`ACTIVE_JOB_WHERE = { deletedAt: null }` is exported from that file and
merged into every read helper (`getJobBySlug`, `getLatestJobs`,
`getFeaturedJobs`, `searchJobs`, `filterJobs`, `getRelatedJobs`) — this
is deliberately an explicit, greppable filter rather than a global
Prisma middleware/extension, so it's obvious in each function body that
deleted jobs are excluded, and an Admin "trash" view can bypass it on
purpose via `restoreJob()`.

### Migration

`prisma/migrations/20260710120000_init/migration.sql` was hand-authored
to exactly match `schema.prisma`, because this build environment has no
network access to Prisma's engine-binary CDN (`prisma migrate dev`
couldn't run here). It follows Prisma Migrate's standard generated
format (CreateTable → CreateIndex → AddForeignKey) and was validated by
executing it against a real Postgres-compatible engine, including
insert/join queries and confirming `RESTRICT`/`CASCADE` behavior work as
designed. Once `DATABASE_URL`/`DIRECT_URL` point at a real Supabase
project, run:

```bash
npx prisma migrate deploy   # applies this migration as-is
npx prisma generate         # generates the real, complete Prisma Client
npm run prisma:seed         # populates locations/categories/companies/admin/ads/sample jobs
```

### Validation (`lib/validations/`)

One file per resource — `job.ts`, `company.ts`, `category.ts`,
`location.ts`, `advertisement.ts` — each exporting a `createXSchema` and
`updateXSchema` (update schemas are the create shape made `.partial()`).
`job.ts` additionally exports `jobSearchSchema` for validating
search/filter query params, and cross-field rules (salaryMin ≤
salaryMax; at least one of officialWebsite/officialEmail present).

### Database helpers (`services/`)

`jobs.service.ts` holds every helper from the spec — `createJob`,
`updateJob`, `deleteJob` (soft), `publishJob`, `scheduleJob`,
`archiveJob`, `duplicateJob`, `getJobBySlug`, `getLatestJobs`,
`getFeaturedJobs`, `searchJobs`, `filterJobs`, `getRelatedJobs`, and the
four `increment*` analytics counters — plus `restoreJob()` (undo a soft
delete) and `publishDueScheduledJobs()` (flips due `SCHEDULED` jobs to
`PUBLISHED`; intended to run on a cron via the `schedule` skill once the
admin panel exists). `searchJobs`/`filterJobs` share a `buildJobWhere()`
query builder covering every requested facet: title, company, free-text
keyword, location, category, employment type, experience, salary range,
and status.

`companies.service.ts`, `categories.service.ts`, `locations.service.ts`,
`advertisements.service.ts` provide the supporting CRUD these jobs
depend on (a Job can't reference a Company/Category/Location that
doesn't exist). `lib/slug.ts` provides `ensureUniqueSlug()`, shared by
every service that derives a slug from a name.

### Seed data (`prisma/seed.ts`)

Idempotent (safe to re-run): 8 locations, 10 categories, 5 companies,
1 admin (`ADMIN_EMAIL` env var or `admin@jobnestuae.com`, password
`ChangeMe123!` — change immediately), 5 advertisements (one per
position), and 6 sample jobs (5 published + 1 draft) covering a mix of
employment types, salary ranges, and featured/verified states. Run with
`npm run prisma:seed`.

### A note on verification in this environment

This sandbox has no network route to `binaries.prisma.sh`, so the
Prisma CLI's `generate`/`migrate dev` commands cannot fetch their engine
binaries here — the same limitation noted in Phase 1. To verify this
phase's code regardless, the migration SQL was executed against a real
Postgres-compatible engine (including constraint/cascade checks), and a
hand-written type-accurate stand-in for the generated Prisma Client was
used to run a genuine `tsc --noEmit` pass across every new file, plus a
clean `eslint` run. On a machine with normal network access, `npm
install` (which runs `prisma generate` via `postinstall`) replaces that
stand-in with the real, complete generated client automatically.

## Phase 3 — Design system & reusable UI component library

Adds the full design-token system and a complete library of presentational
components (97 files under `components/`) in the Apple / Linear / Stripe
Dashboard / Vercel / Notion style requested: minimal, premium, glassmorphism,
20px radius, soft shadows, blue gradient accent, dark text only (no dark
mode toggle yet — the token is there, the switch isn't wired up).

No pages were built this phase — every component here is a building block
for the Home page and the rest of the site in the next phase. Components
are presentational: they accept data as props (jobs, companies, filter
options, etc.) rather than fetching it themselves, so the page layer stays
in control of data fetching via the `services/` layer from Phase 2.

### Design tokens (`tailwind.config.ts` + `app/globals.css`)

Typography scale (`text-display`, `text-h1`..`text-h4`, `text-body`,
`text-caption`, `text-small`) with weight/line-height/letter-spacing baked
into each size. Color system as CSS variables: `background`, `surface`,
`card`, `muted`, `border`, `text-primary`/`text-secondary`, `primary` (+
`primary-hover`), the `brand-start`/`brand-end` gradient, `success`,
`warning`, `destructive`, and a fixed `badge-*` palette (blue/green/orange/
purple/gray) that stays constant even if the brand color is retuned.
Spacing, radius (base 20px), shadow (`shadow-soft` → `shadow-soft-xl`,
`shadow-glass`), blur, transition duration, container widths, the
`Grid`/`Stack` layout system, an icon-size scale, and a centralized
`zIndex` scale (dropdown → sticky → header → overlay → modal → popover →
toast) all live here — no ad-hoc `z-[9999]` or one-off spacing values.

### UI primitives (`components/ui/`)

Extended from Phase 1's Button/Card/Badge/Input/Skeleton with: `Select`,
`Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Textarea`, `Label`,
`Avatar`, `Separator`, `Spinner`, `Popover`, and `Calendar` (react-day-picker
v9, restyled). Built on Radix UI primitives for accessibility (keyboard
nav, focus management, ARIA) out of the box. `Button` now supports
`asChild` (Radix `Slot`) and gained a `cta`/`destructive` variant.

### Layout & typography (`components/layout/`, `components/typography/`)

`Grid` and `Stack` are the two general-purpose layout primitives (replace
ad-hoc flex/grid classes); `Divider` (optionally labeled, e.g. "OR") and
`Breadcrumb` round out layout. `Heading` (Display/H1–H4, with an optional
gradient) and `Text`/`Paragraph`/`Caption`/`FieldLabel` cover the type
scale as components rather than raw className strings.

### Cards & badges (`components/cards/`, `components/badges/`)

`GlassCard`, `StatCard`, `CompanyCard`, `CategoryCard`, `LocationCard` —
the non-job card variants (job-specific cards live in `components/jobs/`).
`status-badges.tsx` covers `VerifiedBadge`, `FeaturedBadge`, `NewBadge`
(auto-hides after `withinHours`), `RemoteBadge`, and `EmploymentTypeBadge`
(colored per the 8 enum values, with `FullTimeBadge`/`PartTimeBadge`/
`ContractBadge` as named convenience wrappers).

### Shared utilities (`components/shared/`)

`IconButton` (enforces an `aria-label`), `CtaButton`, `CopyButton`,
`ShareButton` (Web Share API with clipboard fallback), `BackButton`
(history-aware), `ScrollToTop`, `StickySidebar`, `ImagePlaceholder`,
`BulletList`, `IconList`, `SuccessState` — plus Phase 1's `Pagination`,
`AdPlaceholder`, `LoadingSkeleton`, `EmptyState`, `ErrorState`,
`SearchBar`.

### Job components (`components/jobs/`)

`JobCard` / `CompactJobCard` / `FeaturedJobCard` / `SimilarJobCard` — four
density/emphasis variants sharing one `JobMeta` facts row. `JobHeader`,
`JobDescription`, `RequirementsList`/`BenefitsList`/`ResponsibilitiesList`
(split a free-text field into a bulleted list), `SalaryBadge`/
`ExperienceBadge`/`LocationBadge`/`PostedTimeBadge`, `CompanyInfoCard`,
`ApplyCard` (always links out to the employer's site/email — never a form),
`ShareJobCard`, `RelatedJobs`. `JobDetails` composes all of the above into
the two-column layout (`content` + sticky sidebar) the `/jobs/[slug]` page
will use next phase — the page component itself just fetches data and
renders `<JobDetails job={...} />`.

### Search components (`components/search/`)

`SearchInput` (bare field + clear button), `SearchButton`,
`SearchSuggestions`, `SearchDropdown` (input + floating suggestions panel),
`NoResultsState`. `EntitySearch` is the shared implementation behind
`LocationSearch`/`CategorySearch`/`CompanySearch` (client-side filtering
of a known option list — appropriate at this platform's scale). `KeywordSearch`
wraps `SearchInput` with the right placeholder. `AdvancedSearch` combines
keyword + location + category into the homepage hero search bar.

### Filter components (`components/filters/`)

`CheckboxFilterGroup` is the shared implementation behind `LocationFilter`,
`CategoryFilter`, `CompanyFilter`, and `EmploymentTypeFilter`.
`ExperienceFilter` (radio group), `SalaryFilter` (dual-thumb `Slider`),
`SortFilter`, and `ResetFilters` (only renders once a filter is active)
round out the `/jobs` filter sidebar.

### Form components (`components/forms/`)

React Hook Form + Zod wrappers, all generic over the consuming form's
field values (`Control<TFieldValues>` / `FieldPath<TFieldValues>`), sharing
one `FormFieldWrapper` for label/description/error chrome: `FormTextInput`
(+ `FormEmailInput`/`FormUrlInput`/`FormNumberInput` as typed wrappers),
`FormTextarea`, `FormSelect`, `FormDatePicker` (Popover + Calendar),
`FormRichTextEditor` (a lightweight `contentEditable` editor with a bold/
italic/list toolbar — the stack has no WYSIWYG library, so this is a
functional foundation for job-description editing; swap for TipTap/Lexical
later if richer formatting is needed), `FormSwitch`, `FormCheckbox`,
`FormRadioGroup`.

### Animation (`lib/motion/variants.ts`, `components/motion/`)

Reusable Framer Motion variants: `fadeIn`, `fadeUp`, `scaleIn`, `slideInLeft/
Right/Up/Down`, `staggerContainer`/`staggerItem`, `hoverLift`/`cardHover`/
`buttonHover` (spreadable `whileHover`/`whileTap` props), `pageTransition`,
`modalTransition`. `components/motion/motion-wrappers.tsx` wraps the
scroll-triggered ones as ready-to-use components (`FadeUp`, `FadeIn`,
`ScaleIn`, `SlideInLeft/Right/Up/Down`, `StaggerContainer`/`StaggerItem`).
`PageTransition` and `ModalTransition` are full wrapper components for
route and dialog transitions respectively.

### Accessibility & responsiveness

Every interactive primitive is Radix-based (keyboard nav, focus trap where
appropriate, ARIA roles built in). A global `:focus-visible` ring is set in
`globals.css`. Icon-only buttons require an `aria-label` at the type level
(`IconButton`). Badge/text color pairs were chosen for WCAG AA contrast
against their backgrounds. All grids/stacks/cards use the shared responsive
scale (mobile-first; `sm`/`md`/`lg` breakpoints), and touch targets (buttons,
checkboxes, radio items) are sized ≥ 36px.

### A note on verification in this environment

As in Phases 1–2, this sandbox has no network route to Prisma's engine
binaries, so `prisma generate` can't produce the real client here. Every
file in this phase was still checked with a genuine `tsc --noEmit` and a
clean `eslint` pass, using the same hand-written type-accurate Prisma
Client stand-in described in the Phase 2 section above (regenerated for
this phase's fresh `npm install`). A full `next build`/`next dev` could not
be executed in this particular sandbox (its native SWC binary crashes
here) — do a `npm run dev` smoke test locally as a final check before
building the Home page on top of this library.

## Phase 4 — Home page

The real `/` route: fully server-rendered from live Prisma data (via the
Phase 2 `services/` layer), built entirely from Phase 3's component
library. No dummy content — every section reflects whatever is actually
in the database, including showing zero.

### Data flow

`app/page.tsx` is an async Server Component. It fetches everything the
page needs in one `Promise.all` — `getFeaturedJobs(6)`, `getLatestJobs({page:1, pageSize:12})`,
`getCategoriesWithJobCounts()`, `getLocationsWithJobCounts()`,
`getCompaniesWithJobCounts(8)`, `getHomeStats()` — then passes plain data
down into presentational section components. `export const revalidate = 60`
puts the whole page under ISR: it's cached and served statically, and
regenerated in the background at most once a minute, so traffic doesn't
hit the database on every request.

Three new/extended service functions power the "with counts" sections
(`getCategoriesWithJobCounts`, `getLocationsWithJobCounts` in their
respective service files, `getCompaniesWithJobCounts` in
`companies.service.ts`) — each uses a single `prisma.job.groupBy()` rather
than one `count()` query per row, avoiding an N+1 query pattern. Categories
and locations show every reference row (including a real `0` if nothing's
posted yet); companies only show ones with at least one live published
job. `getHomeStats()` (`services/stats.service.ts`) returns the four hero
counters. `getLatestJobs()` was extended to accept `{ page, pageSize }`
so the "Load More" button can walk further pages — via
`actions/jobs.actions.ts`'s `loadMoreLatestJobsAction`, a Server Action
called directly from the client, no API route needed.

### Sections (`components/home/`)

`HeroSection` — headline, `AdvancedSearch` (wired to push to `/jobs` with
query params), `QuickFilterChips` (Dubai/Abu Dhabi/Sharjah/Remote/
Full-Time/Internship), a "Browse All Jobs" `CtaButton`, and four
`AnimatedCounter`s (count up once scrolled into view, via a small new
`components/shared/animated-counter.tsx`). Client Component — needs
`useRouter` for the search and `useInView` for the counters.

`FeaturedJobsSection` — up to 6 `FeaturedJobCard`s in a staggered
entrance animation, "View All Jobs" button, empty state if none are
featured yet.

`LatestJobsSection` — 12 newest published jobs via `JobCard`, "Load
More" backed by the server action above; each additional click appends
another page and hides the button once a page returns fewer than 12.

`CategoryGridSection` / `LocationGridSection` / `PopularCompaniesSection`
— `CategoryCard`/`LocationCard`/`CompanyCard` grids, each with its own
empty state. Companies never render a logo image — `CompanyCard`'s
`Avatar`/`AvatarFallback` always generates initials.

`WhyJobNestSection` — three static trust cards (Verified Vacancies,
Direct Employer Applications, Updated Daily) — no DB query, it's fixed
copy.

`AdPlaceholderSection` — a responsive slot rendering only the reusable
`AdPlaceholder` component (leaderboard size on desktop, banner on mobile)
— no real ad network wired up, per scope.

`CtaSection` — closing "Start Your Career Journey Today" banner.

### Header / footer updates

`constants/nav.ts` now matches the spec exactly — main nav is Home / Jobs
/ Categories / Locations / About / Contact; footer is a single "Quick
Links" group (Categories, Locations, About, Privacy Policy, Terms,
Contact). `Header` gained a large `cta`-variant "Browse Jobs" button and
hide-on-scroll-down / reveal-on-scroll-up behavior (new
`hooks/use-scroll-direction.ts`), on top of its existing scroll-triggered
glass surface.

### SEO (`lib/seo/json-ld.ts`, `components/shared/json-ld.tsx`)

Page metadata (title/description/OG/Twitter/canonical) comes from the
Phase 1 `constructMetadata()` helper, called with homepage-specific copy.
Three JSON-LD blocks are injected via the small `<JsonLd>` server
component: `organizationJsonLd()` (Organization schema), `websiteJsonLd()`
(WebSite + SearchAction — enables a Google sitelinks search box, beyond
what was explicitly asked but standard practice for a job board's
homepage), and `breadcrumbJsonLd()` (BreadcrumbList — just "Home" at the
root, but the same builder is reused by every future page's breadcrumb).

### Accessibility

Every section is a landmark (`<section id aria-labelledby="...">`)
pointing at its own heading's `id`, giving screen reader users a real
"jump to section" outline instead of an unlabeled wall of `<section>`
tags. Heading hierarchy is h1 (hero) → h2 (each section) throughout —
no skipped levels.

### A note on verification in this environment

Same caveat as Phases 1–3: this sandbox can't reach Prisma's engine CDN,
so the Home page was verified with `tsc --noEmit` (clean) and `eslint`
(clean) against the hand-written Prisma Client type stand-in, plus a
manual review of every query for N+1 patterns and correct `deletedAt`
filtering. It could not be smoke-tested with `next dev` against a live
database here — do that, and a Lighthouse pass, once you have a real
`DATABASE_URL` and have run `npm run prisma:seed`.

## Phase 5 — All Jobs page (`/jobs`)

The browse-everything route: search, filter, sort, and paginate across
every published job, fully server-rendered and driven end-to-end by the
URL — every control (search bar, filter sidebar, sort dropdown,
pagination links) reads and writes the same query string, so the page is
shareable/bookmarkable at any state and works with JS disabled for the
initial render.

### URL scheme

```
/jobs?search=interior+designer
/jobs?location=dubai&category=engineering&type=full-time,contract
/jobs?experience=3-5+years&salaryMin=5000&salaryMax=15000
/jobs?education=bachelor&visa=employer&featured=true&verified=true
/jobs?posted=week&sort=salary_desc&page=2
```

`lib/jobs-url.ts` is the single source of truth for this mapping:

- `parseJobsSearchParams(searchParams)` — converts raw Next.js
  `searchParams` into a validated `JobSearchInput` (the array-based Zod
  schema in `lib/validations/job.ts`), splitting comma-separated values
  and mapping friendly slugs like `type=full-time` back to the
  `EmploymentType` enum via `constants/employment-type-slugs.ts`. Falls
  back to sane defaults on any parse failure rather than erroring.
- `buildJobsQueryString(filters)` — the inverse; omits defaults and empty
  arrays so URLs stay clean (`/jobs` not `/jobs?sort=newest&page=1`).
- `countActiveFilters(filters)` — used for the mobile filter drawer's
  badge count.

Every filter/search/sort/pagination component imports from this one
module, so they can never drift out of sync with each other.

### Search

`JobsSearchBar` is a sticky (`sticky top-18 z-sticky`) Client Component.
Input is debounced 400ms (`hooks/use-debounce.ts`) before it calls
`router.replace(..., { scroll: false })` with the new `?search=` value,
and resets `page` back to `1` on every change.

### Filters

`JobsFilterSidebar` composes one component per facet — Location,
Category, Company, Employment Type, Experience, Salary Range, Education,
Visa Status, Featured/Verified toggles, Posted Within — each already
built in Phase 3 or newly added this phase
(`education-filter.tsx`, `visa-status-filter.tsx`,
`featured-verified-filter.tsx`, `posted-within-filter.tsx`). Selections
are held in local `draft` state, not applied to the URL immediately:
"Apply Filters" merges the draft into the current filters and navigates
once; "Clear Filters" resets the draft and navigates immediately,
preserving `search`/`sort`. Desktop shows it as a sticky sidebar
(`StickySidebar` from Phase 3); mobile shows a trigger button with an
active-filter-count badge that opens `MobileFilterDrawer`, a slide-over
panel (Framer Motion, backdrop click-to-close, body scroll lock) holding
the identical `JobsFilterSidebar`.

Education and Visa Status options are populated live from the database
(`getDistinctEducationValues()` / `getDistinctVisaStatusValues()` in
`services/jobs.service.ts`) rather than hardcoded, so the filter list
never offers a value nothing is actually tagged with.

### Sort

`JobsSortControl` wraps Phase 3's `SortFilter` and pushes the choice to
`?sort=`. Six options: Newest, Oldest, Highest Salary, Lowest Salary,
A–Z, Featured First — each maps to an explicit Prisma `orderBy` in
`buildJobOrderBy()` (`services/jobs.service.ts`), e.g. `salary_desc` →
`[{ salaryMax: "desc" }, { publishedAt: "desc" }]` so ties break by
recency.

### Job list, ads, and pagination

`JobsResults` renders `filterJobs(filters)`'s page of jobs as
`JobListCard`s (a new card distinct from Phase 4's whole-card-link
`JobCard`, since this card needs three independently-clickable regions:
title, "View Details", and the Apply button(s)) in chunks of 8, with an
`AdPlaceholder` banner inserted between chunks (never after the last, and
never adjacent to an Apply button — ad slots only sit between card
groups or at the very top/bottom of the page). `ApplyButtons` — shared
between `JobCard` and `JobListCard` — implements the exact conditional
spec: website button only if `officialWebsite` is set, email button only
if `officialEmail` is set, both if both, and the component renders
nothing at all if neither is present, never an empty/disabled button.
`JobsPagination` is real `<Link>`-based (not the onClick `Pagination`
component from Phase 3) with `rel="prev"`/`rel="next"` and page numbers
built through `buildJobsQueryString`, at 20 jobs/page server-side via
`paginateJobs()`.

### Loading & empty states

`app/jobs/loading.tsx` mirrors the real layout exactly — header
skeleton, `FilterSidebarSkeleton` on desktop, a result-count-and-sort
skeleton row, and `JobListSkeleton count={8}` — so there's no layout
shift when data arrives. An empty result set renders `NoResultsState`
(inside `JobsResults`) instead of an empty grid.

### SEO

`generateMetadata` builds a dynamic title/description from whichever
filters are active (e.g. `"interior designer" Engineering Jobs in Dubai —
Page 2`), plus canonical/OG/Twitter via the Phase 1
`constructMetadata()` helper and a `BreadcrumbList` JSON-LD block (Home →
Jobs). `revalidate = 60` keeps the page under ISR like the homepage.

### A note on verification in this environment

Same caveat as Phases 1–4: this sandbox can't reach Prisma's engine CDN,
so this page was verified with `tsc --noEmit` (clean) and `eslint`
(clean) against the hand-written Prisma Client type stand-in — extended
this phase to cover `in`-array filters, the new `education`/`visaStatus`
scalar fields, the `select`-only query shape used by the two distinct-
value lookups, and the extended `orderBy` (`salaryMin`/`salaryMax`) — plus
a manual review of every query for correct `deletedAt`/`status` filtering.
It could not be smoke-tested with `next dev` against a live database
here — do that, and a Lighthouse pass, once you have a real
`DATABASE_URL` and have run `npm run prisma:seed`.

## Phase 6 — Single Job Details page (`/jobs/[slug]`)

The final stop in a candidate's journey on the site: full detail on one
verified vacancy, ending in a direct hand-off to the employer's own
website or inbox. Job Nest UAE never collects an application itself.

### Data flow & caching

`app/jobs/[slug]/page.tsx` wraps `getJobBySlug()` in React's `cache()`
(`getJob`) so `generateMetadata` and the page body — which both need the
same job — only hit the database once per request, not twice. A shared
`getVisibleJob(slug)` helper layers the page's visibility rule on top:
a job 404s (via `notFound()`) if it doesn't exist, isn't `PUBLISHED`
(covers draft/archived/scheduled), or has an `applicationDeadline` in
the past — the last one is the spec's optional "Expired" case,
implemented here rather than left out. `getRelatedJobs()` (already
built in Phase 2) was extended to add company as a third relatedness
signal — it now scores same-category matches highest, then
same-location, then same-company, matching the spec's exact priority
order, and the page asks for up to 6. `incrementViewCount()` fires
alongside the related-jobs fetch in the same `Promise.all` and is
wrapped in `.catch(() => undefined)` — a dropped analytics write should
never break the page render.

### Header, quick facts, and Job Information card

`JobHeader` renders title/company/badges plus two fact rows: the
existing shared `JobMeta` (Employment Type, Salary, Experience,
Location, Posted Time — the same row job cards use) and a new
detail-page-only row of six badges (`EducationBadge`, `VisaStatusBadge`,
`NationalityBadge`, `LanguagesBadge`, `VacanciesBadge`, `DeadlineBadge`,
all new in `components/jobs/job-meta-badges.tsx`), each silently
rendering nothing when its field is empty. A new `JobInformationCard`
(`components/jobs/job-info-card.tsx`) repeats every one of those facts
plus Category and Posted Date as a clean icon + label/value definition
list in the sidebar — the spec explicitly asks for both the header
summary and a dedicated information card, so the two intentionally
overlap.

### Apply, company, and share

`ApplyCard` (already built in Phase 3) now takes a `jobTitle` prop and
pre-fills the mailto link's subject (`Application for {title}`).
Website/email click analytics are wired the way Next.js's docs describe
for Server Actions called from Client Components: the page (a Server
Component) does `trackWebsiteClickAction.bind(null, job.id)` and passes
the bound function down as a prop; `ApplyCard`/`ShareJobCard` (Client
Components) just call it from their `onClick`/`onShare` handlers with no
API route in between. `CompanyInfoCard`'s "View all jobs" link now
points at `/jobs?company={slug}` (the existing filter-by-company URL
from Phase 5) instead of a `/companies/[slug]` route that doesn't exist
yet.

### Advertisements

Top and bottom leaderboard/banner placeholders bookend the page.
`JobDetails` gained a `middleAd` slot rendered between the job content
and the related-jobs rail (the spec's "Middle Banner"), and a "Desktop
Sidebar" square ad sits at the very bottom of the sticky sidebar rail —
below the Apply card, Job Information card, Company card, and Share
card — so it's never adjacent to an Apply button.

### SEO & structured data

`generateMetadata` prefers the job's own `metaTitle`/`metaDescription`
when the admin has set them, falling back to a generated title/
description otherwise — both routed through the shared
`constructMetadata()` helper for canonical/OG/Twitter. Three JSON-LD
blocks are injected: `organizationJsonLd()`, a `breadcrumbJsonLd()` trail
(Home → All Jobs → job title), and a new `jobPostingJsonLd()`
(`lib/seo/json-ld.ts`) implementing Schema.org `JobPosting` — title,
description, `identifier`, `hiringOrganization`, `jobLocation`,
`employmentType` (mapped from this project's enum to schema.org's
vocabulary, with `REMOTE` additionally setting `jobLocationType:
"TELECOMMUTE"` and `applicantLocationRequirements`), `baseSalary` when
either salary bound is set, `datePosted`/`validThrough`, and
`directApply: false` — deliberately false, since Google's `directApply`
property specifically means "the candidate can apply without leaving
this page," which is the one thing this platform never does.
`app/sitemap.ts` was also extended (per the note already left in it
back in Phase 1) to include every published job's own URL, via a new
slim `getAllPublishedJobSlugsForSitemap()` service function that only
selects `slug`/`updatedAt` rather than full rows.

### Error handling & loading

`app/jobs/[slug]/not-found.tsx` gives a job-specific 404 ("This job
listing is no longer available") rather than the generic root one, with
a "Browse all jobs" way out. `app/jobs/[slug]/loading.tsx` mirrors the
real two-column layout — header, content, and all three sidebar
cards — so there's no shift when the real data streams in.

### A note on verification in this environment

Same caveat as Phases 1–5: this sandbox can't reach Prisma's engine CDN,
so this page was verified with `tsc --noEmit` (clean) and `eslint`
(clean) against the hand-written Prisma Client type stand-in — extended
this phase with a third `findMany({ select })` overload for the
sitemap's `{ slug, updatedAt }` shape — plus a manual review of the
Server-Action-to-Client-Component analytics wiring and the
`notFound()`-narrows-to-non-null control flow. It could not be smoke-
tested with `next dev` against a live database here — do that, and a
Lighthouse pass plus Google's Rich Results Test on the JobPosting
markup, once you have a real `DATABASE_URL` and have run
`npm run prisma:seed`.

## Phase 7 — Categories, Locations & Companies pages

Six new routes — three directories (`/categories`, `/locations`,
`/companies`) and three matching detail pages
(`/categories/[slug]`, `/locations/[slug]`, `/companies/[slug]`) — that
turn what was previously only reachable via `/jobs`'s filter sidebar
into their own dedicated, SEO-crawlable landing pages.

### The detail pages are `/jobs`, pre-scoped

The biggest architectural decision this phase: a category/location/
company detail page is functionally a `/jobs` view permanently locked to
one facet, so it reuses the exact same data layer and UI as the Phase 5
`/jobs` page rather than reimplementing search/filter/sort/pagination a
second (or fourth) time. Concretely, each `[slug]/page.tsx`:

1. Parses the query string with the existing `parseJobsSearchParams()` —
   `urlFilters` never has a `categorySlugs`/`locationSlugs`/`companySlugs`
   value on these routes, because the entity is the route segment, not a
   query param.
2. Builds a second object, `queryFilters`, that spreads `urlFilters` and
   force-sets the one locked facet (e.g. `{ ...urlFilters, categorySlugs:
   [category.slug] }`), used only for the actual `filterJobs()` call.
3. Passes `urlFilters` (the clean one) to every URL-writing component —
   `JobsSearchBar`, `JobsResults`, `EntityJobsFilterSidebar` — so
   search/sort/filter/pagination links stay clean:
   `/categories/marketing?type=full-time&sort=salary_desc&page=2`, never
   `?category=marketing&type=full-time...`.

`JobsSearchBar` needed no changes at all — it already reads
`usePathname()` rather than hardcoding `/jobs`. `JobsResults` and
`JobsSortControl` gained optional `basePath`/`sortOptions` props
(defaulting to their original `/jobs` behavior, so nothing else on the
site changed), and `JobsPagination` already had a `basePath` prop from
Phase 5. The one genuinely new piece is `EntityJobsFilterSidebar`
(`components/filters/entity-jobs-filter-sidebar.tsx`) — a trimmed
sidebar with only the six facets this phase's spec asks for (Employment
Type, Experience, Salary Range, Featured, Verified, Posted Within),
deliberately omitting Location/Category/Company pickers since
re-exposing the very facet the page is already locked to would be
confusing (selecting a different category here would silently do
nothing, since the route always wins). Sort is similarly trimmed to a
3-option subset (Newest, Highest Salary, A–Z) via `SortFilter`'s new
optional `options` prop.

### Directory pages

`/categories` and `/locations` reuse the exact service functions the
homepage already had (`getCategoriesWithJobCounts`, `getLocationsWithJobCounts`
— both show every reference row, including zero-job ones, same as the
homepage grids). `/companies` uses a new `getAllCompaniesWithJobCounts()`
— unlike the homepage's `getCompaniesWithJobCounts(take)` (capped,
ranked by popularity), this returns every currently-hiring company,
alphabetically, unbounded, matching the spec's "all companies with
published jobs... Sort A–Z". All three pages share one new
`DirectorySearchBar` (`components/shared/directory-search-bar.tsx`) — a
debounced, URL-synced (`?search=`) name filter, applied server-side in
the page component against the small, already-fetched reference list
(these are bounded tables — dozens of rows at most — so filtering
post-fetch is simpler and just as fast as pushing a `where: { contains }`
into Prisma).

### Card updates

`CategoryCard` now links to `/categories/[slug]` (was `/jobs?category=`)
and gained a hover arrow icon plus an optional `description` prop.
`LocationCard` now links to `/locations/[slug]`. `CompanyCard` gained an
optional `website` prop and was restructured away from "the whole card
is one `<Link>`" — the official website needed to be its own real,
independently-clickable anchor, and a `<a>` can't nest inside another
`<a>`, so the name/avatar and a "View profile" line each carry their own
link to `/companies/[slug]` instead (the same problem `JobListCard`
solved in Phase 5 for its title/View Details/Apply buttons).

### Related entities & job counts

Each detail page shows a "Related [Categories/Locations/Companies]" rail
— other entities with live jobs, ranked by job count, excluding the
current one (`getRelatedCategories`/`getRelatedLocations`/
`getRelatedCompanies`, all new). The header's "Published Jobs" count
comes from a new, filter-independent `getCategoryJobCount`/
`getLocationJobCount`/`getCompanyJobCount` rather than the (possibly
filtered) `results.total` — the same stable-badge-vs-filtered-count
split `/jobs` already uses (`getPublishedJobsCount()` vs. `results.total`).

### Two scope-honest gaps

**Category/Location descriptions.** The spec asks both detail pages to
show a "Description (optional)". `Category` and `Location` have no
`description` column in the Phase 2 schema (only `Company` does) — and
this phase's brief is explicitly "Build ONLY the following public
pages," not a schema change. Rather than silently drop the requirement
or silently expand scope with an uninstructed migration, `EntityDetailHeader`
does support a `description` slot, and both pages pass it a short
generated blurb ("Verified Marketing job vacancies across the UAE,
updated daily.") rather than raw stored data. If per-category/location
admin-editable copy is wanted later, add a nullable `description` column
to both models — everything downstream already expects the prop.

**Category/Location/Company page-view analytics.** The spec's ANALYTICS
section asks for "Category Page Views" / "Location Page Views" /
"Company Page Views" alongside job view/click tracking. The `Analytics`
model is a strict 1:1 with `Job` (`jobId @unique`) — there's no table to
record a view against a Category/Location/Company row, and adding one is
a schema change outside this phase's stated scope. "Job Card Clicks" from
these listing pages is effectively already covered: clicking any
`JobListCard` navigates to `/jobs/[slug]`, which already increments that
job's `views` counter on load (Phase 6) regardless of which page the
click came from. Per-entity page-view counting would need a small
follow-up migration (e.g. a `PageView` table keyed by entity type + id)
— flagging it here rather than bolting on an ad hoc counter this phase
didn't have a real place to put.

### SEO

Every detail page gets `generateMetadata` (dynamic title/description,
canonical via `constructMetadata`) and a `breadcrumbJsonLd()` trail
(Home → directory → entity). `app/sitemap.ts` now also includes every
category/location/company detail URL, alongside the job URLs added in
Phase 6.

### A note on verification in this environment

Same caveat as Phases 1–6: this sandbox can't reach Prisma's engine CDN,
so all six pages were verified with `tsc --noEmit` (clean) and `eslint`
(clean) against the hand-written Prisma Client type stand-in — no new
shim query shapes were needed this phase (category/location/company
reads all fit the delegate patterns already modeled). Also manually
reviewed: the clean-URL `urlFilters`/`queryFilters` split on all three
detail page types, and the `CompanyCard` restructuring for nested-anchor
safety. Could not be smoke-tested with `next dev` against a live
database here — do that, and re-run Lighthouse, once you have a real
`DATABASE_URL` and have run `npm run prisma:seed`.

## Phase 8 — Admin Panel Foundation & Dashboard

The private, single-administrator side of the site: `/admin/login` plus
eight protected routes, a real-time dashboard, and the security
plumbing (Supabase Auth, middleware, rate limiting) everything else in
this phase depends on. Per the spec, this phase stops at the
dashboard — the Jobs/Companies/Categories/Locations/Advertisements/
Analytics/Settings sections are real routes with real navigation, but
each renders a "coming soon" placeholder rather than a CRUD screen.

### A structural prerequisite: splitting the root layout

Every public page up to this point rendered inside one root
`app/layout.tsx` that always included the site `Header`/`Footer`. An
admin dashboard obviously shouldn't inherit the public marketing nav, and
Next.js only allows a single root `<html>/<body>`, so the standard fix
is route groups: the public pages (`/`, `/jobs`, `/categories`,
`/locations`, `/companies` and all their sub-routes) moved into
`app/(site)/`, which has its own `layout.tsx` rendering `Header` +
`Footer`. The true root `app/layout.tsx` is now bare — just fonts and
the `QueryProvider`. Route groups don't affect URLs (`app/(site)/page.tsx`
is still served at `/`), and every import continued to resolve unchanged
since the project uses the `@/*` absolute alias, not relative paths — so
this was a safe, mechanical move, not a rewrite. `/admin/*` gets its own
shell entirely (below), sharing only that bare root layout with the
public site.

### Authentication

Supabase Auth (email + password), exactly as specified — no OAuth, no
magic links, no OTP, no registration or forgot-password flow anywhere in
the codebase. The admin account is never created by this app; it's
created once, manually, in the Supabase dashboard or SQL editor (see the
updated `.env.example`). Three layers enforce "exactly one
administrator":

1. **Operationally** — nothing in this codebase can create a second
   Supabase Auth user (no signup route exists to call).
2. **`middleware.ts`** — runs on every `/admin/*` request, calls
   `supabase.auth.getUser()` (never the unvalidated `getSession()`) via
   the new `lib/supabase/middleware.ts` `updateSession()` helper, and
   only treats the request as authenticated if the session's email
   matches `process.env.ADMIN_EMAIL` exactly (case-insensitive). No
   `ADMIN_EMAIL` configured means no access at all — it fails closed,
   not open.
3. **`lib/admin-auth.ts`'s `requireAdmin()`** — the same check again,
   called server-side from `app/admin/(protected)/layout.tsx`. This is
   deliberate defense in depth: middleware protects the route at the
   edge, `requireAdmin()` protects the render itself.

`actions/auth.actions.ts` has the two Server Actions: `signInAction`
(rate-limited 5 attempts/minute per caller IP via a new lightweight
in-memory `lib/rate-limit.ts` — documented there as single-instance-only;
swap for a distributed limiter like Upstash if this ever runs across
multiple server instances) re-checks the `ADMIN_EMAIL` match after
Supabase confirms the password and immediately signs back out if it
doesn't match, and `signOutAction`. Both are plain Next.js Server
Actions, which is what supplies CSRF protection here (framework-enforced
POST + origin check) — no separate hand-rolled token was needed on top
of that. `LoginForm` uses React 19's `useActionState` so the form is a
real POST (works without client JS) and shows validation/rate-limit/
credential errors inline. A `redirectTo` query param round-trips through
login (so a deep-linked admin URL returns you there after signing in)
but is validated server-side to only ever be a same-site `/admin/...`
path — never an absolute URL — to close off an open-redirect vector.

### Layout, sidebar, and top bar

`app/admin/(protected)/layout.tsx` is the shell every protected route
shares: a fixed desktop sidebar (`AdminSidebar`, `hidden lg:block`) and a
sticky top bar (`AdminTopbar`), wrapping a content `<main>`. `/admin/login`
intentionally lives outside the `(protected)` route group so it never
gets this chrome. `AdminSidebar`'s nav list and active-link highlighting
are shared verbatim between the desktop `<aside>` and `AdminMobileSidebar`'s
slide-over drawer (same content-once, two-surfaces pattern the public
site's `MobileFilterDrawer` already established). `AdminTopbar` derives
the page title from the current path against `constants/admin-nav.ts`,
shows the authenticated admin's email, and offers logout two ways: a
`DropdownMenu` (new — `components/ui/dropdown-menu.tsx`, wrapping the
newly-added `@radix-ui/react-dropdown-menu`, following this project's
established shadcn-style Radix-wrapping convention) with the email and a
logout item, plus a standalone icon-only logout button for one-click
access.

### Dashboard

`services/dashboard.service.ts` (`getDashboardStats()`,
`getAdminNotifications()`) composes new reads added to
`services/jobs.service.ts` — `getJobStatusCounts()`,
`getAnalyticsSummary()`, `getRecentJobsForAdmin()`,
`getDraftJobsForAdmin()`, `getScheduledJobsForAdmin()`,
`getJobsNearDeadlineForAdmin()` — with the existing company/category/
location counts, all fetched in parallel. The dashboard itself sets
`export const dynamic = "force-dynamic"` (unlike the public site's ISR
pages) since an admin checking live counts shouldn't see a
cached-for-up-to-a-minute snapshot. `StatsGrid` renders all ten numeric
cards plus the two job-reference cards (Most Viewed/Most Clicked,
computed by reducing every `Analytics` row once rather than one query
per metric). `RecentJobsTable` shows the ten newest jobs of *any*
status — unlike the public site's `getLatestJobs()`, which only ever
shows published ones — with a working "View" action (opens the real
public job page) and disabled Edit/Duplicate/Delete actions, each
carrying a `title` tooltip explaining they arrive with the CRUD phase
rather than silently doing nothing. `QuickActions` and
`NotificationsPanel` (Scheduled/Near-Deadline/Draft jobs) round out the
page.

### Two more scope-honest gaps

**"Today's Visitors."** The `Analytics` model (Phase 2) is one row per
job with running totals (`views`, `websiteClicks`, ...) and no per-day
timestamped events — there's no data anywhere to compute "today's"
anything from. Rather than show a fabricated number, the stat card
displays "—" with a caption explaining a day-bucketed analytics table
(or a real analytics/edge-log integration) would be needed first.

**"Total Visitors."** Same root cause: there's no site-wide visitor/
session tracking table at all, only per-job view counters. The card
shows the sum of every job's `views` instead, explicitly captioned
"Aggregated job views" rather than presented as a true visitor count —
an honest, real, derivable number standing in for one the schema can't
currently produce. "Most Viewed Job" and "Most Clicked Job," by
contrast, needed no such caveat — both are fully and accurately
derivable from the existing `Analytics` rows.

### Security checklist

Server-side session validation (`getUser()`, never `getSession()`) in
both middleware and the protected layout; Supabase-managed secure,
httpOnly session cookies (via `@supabase/ssr`, not hand-rolled); CSRF
via Next.js Server Actions' built-in origin checks; Zod input validation
on the login form (`lib/validations/auth.ts`); a rate limiter on sign-in
attempts; no secrets in client code (`SUPABASE_SERVICE_ROLE_KEY` is only
ever read from `lib/supabase/admin.ts`, a server-only module never
imported by a Client Component); Prisma's parameterized queries
throughout (unchanged from every prior phase) for SQL-injection safety;
React's default output escaping for XSS safety (no new
`dangerouslySetInnerHTML` introduced this phase); `robots: {index:
false}` on every admin page (set once on the protected layout, plus
directly on the login page since it sits outside that layout) and
`/admin` already disallowed in `robots.ts` since Phase 1.

### A note on verification in this environment

Same caveat as Phases 1–7: this sandbox can't reach Prisma's engine CDN,
so all of this was verified with `tsc --noEmit` (clean) and `eslint`
(clean) against the hand-written Prisma Client type stand-in — extended
this phase with `applicationDeadline` on `JobWhereInput`/
`JobOrderByWithRelationInput` for the near-deadline query. It also
couldn't be smoke-tested end-to-end here, which matters more than usual
this phase since real auth is involved: once you have real Supabase
credentials, create the one admin user, set `NEXT_PUBLIC_SUPABASE_URL`/
`NEXT_PUBLIC_SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY`/`ADMIN_EMAIL`
in `.env.local`, run `npm run prisma:generate`, and manually verify:
signing in redirects to `/admin/dashboard`; signing out and visiting any
`/admin/*` URL redirects to `/admin/login`; and a second Supabase user
(if you create one to test with) is correctly rejected even with a
correct password.

## Phase 9 — Admin Job Management System

The complete CRUD module the Phase 8 sidebar/dashboard was built to
lead into: `/admin/jobs` (list), `/admin/jobs/new` (create),
`/admin/jobs/[id]/edit` (edit), and `/admin/jobs/[id]/preview` — the
single administrator's full toolkit for managing every job vacancy from
draft through published, scheduled, archived, or soft-deleted.

### Schema change: Open Graph overrides

`prisma/schema.prisma`'s `Job` model gained two nullable columns —
`ogTitle`/`og_title` and `ogDescription`/`og_description` — via
`prisma/migrations/20260710150000_job_og_fields/migration.sql`. A job's
meta title/description (used in `<title>`/search snippets) and its
Open Graph title/description (used when a link is shared on social/
messaging apps) sometimes need to diverge — a punchier OG title, for
instance — so they're independent fields rather than one being derived
from the other. Deliberately **not** added: a `canonicalUrl` column. A
job's canonical URL is always `/jobs/{slug}`, deterministically, so
storing it separately would just be a second source of truth that could
drift from the slug; the SEO section instead computes and displays it
read-only from whatever slug is currently in the form.

### Job list (`/admin/jobs`)

Server-rendered against `getAdminJobsList()` (new in
`services/jobs.service.ts`), which — unlike every public listing
query — has no `status: "PUBLISHED"` restriction, since the admin needs
to see drafts, scheduled, and archived jobs too (soft-deleted rows are
still excluded via the existing `ACTIVE_JOB_WHERE`). Every column from
the spec is rendered by `AdminJobsTable`: title, company, category,
location, employment type, `JobStatusBadge`, featured/verified
indicators, published date, deadline, and last-updated — the last three
all rendered as relative time (`formatPostedTime`, existing `date-fns`
helper) with the absolute date in a `title` tooltip. Row actions
(`JobRowActions`, a `DropdownMenu`) cover View/Preview/Edit/Duplicate/
Publish/Unpublish/Archive/Soft Delete, each wired to its matching
Server Action; delete goes through a confirmation `AlertDialog` first,
never fires directly from the menu item.

Search (`AdminJobsSearchBar`) is debounced client-side before it touches
the URL's `?query=` param, matching the pattern the public `/jobs`
search box already used. Filters (`AdminJobsFilters`) cover status,
company, category, location, employment type, featured, verified,
published-date range, and deadline range, plus a "Clear Filters" action
that resets to a bare `/admin/jobs`. Sorting (`AdminJobsSortControl`)
supports all seven spec'd orders, including Featured First (a
`CASE`-equivalent `orderBy` combining `featured: "desc"` with the
selected secondary sort). Pagination is 20 rows/page. Row selection
feeds a bulk-action toolbar (Publish/Unpublish/Archive/Delete), and
`ExportJobsCsvButton` builds a CSV client-side from the current page's
rows via `Blob`/`URL.createObjectURL` — no server route needed. The
whole filter/search/sort/page state round-trips through the URL
(`lib/admin-jobs-url.ts`), so a filtered, sorted, paginated view is
always link-shareable and survives a refresh.

### Create / Edit (`/admin/jobs/new`, `/admin/jobs/[id]/edit`)

One shared component, `components/admin/jobs/job-form.tsx`, powers both
routes via a `mode: "create" | "edit"` prop — the two route pages
themselves are thin Server Components that fetch the company/category/
location dropdown lists (and, for edit, the existing job) and hand off
to the form. The form is organized into the spec'd sections: Basic
Information, Application, Content (four rich-text fields — description,
responsibilities, requirements, benefits — via the existing
`FormRichTextEditor`, extended this phase with H2/H3/paragraph block
buttons alongside its existing bold/italic/list support), and SEO
(meta title/description, Open Graph title/description, a live-computed
read-only canonical URL, and a Google-result mockup via the new
`JobSeoPreview`). A sticky sidebar holds the publish actions.

**Slug**: auto-derived client-side from title + company + location via
the existing `slugify()` util, shown as an editable field the admin can
freely override (with a reset-to-auto button); whatever value is
actually submitted is re-validated, re-normalized, and uniqueness-
checked server-side by `createJob()`/`updateJob()` regardless, so a
manual override can never collide with an existing slug or bypass
normalization.

**Publish workflow**: submitting is a two-step process by design.
Step one always saves the form's own fields via `createJobAction`/
`updateJobAction` — and on a plain edit, deliberately never includes
`status` in that payload, so saving content never silently changes an
already-published job's lifecycle state. Step two, only if the chosen
intent isn't "Save Draft," calls the dedicated `publishJobAction`/
`scheduleJobAction`/`archiveJobAction` against the now-saved job id.
Keeping `publishedAt`-setting logic inside those three dedicated
service functions (rather than duplicating "what happens when a job
goes live" inside the form's submit handler) means the same rules apply
whether a job is published from the form, from the list page's row
actions, or via a bulk action.

**Unsaved-changes warning**: `useUnsavedChangesWarning(form.formState.isDirty)`
attaches a `beforeunload` handler that warns on a tab close/refresh/
external-link navigation while the form is dirty. It does not intercept
an in-app link click — the App Router's client-side navigation isn't
interruptable by a `beforeunload`-style hook without a router-level
guard that this version of Next.js doesn't expose — so the in-app
"Cancel" button instead runs its own explicit dirty check and shows a
confirmation `AlertDialog` before navigating away.

**Autosave draft**: called out in the spec as optional; not implemented
this phase, to keep the two-step save/publish model above (and its
unsaved-changes guarantees) unambiguous rather than layering a timed
background save on top of it. Manual "Save Draft" covers the same need
today.

### Preview (`/admin/jobs/[id]/preview`)

Reuses the exact `JobDetails` composition the public `/jobs/[slug]`
page renders — same header, content, apply card, company info, related
jobs — wrapped in a small admin-chrome banner showing the job's current
status and a link back to Edit. Unlike the public route, this page
never 404s on a draft/scheduled/archived/expired job (that's the whole
point of a preview); only a genuinely missing or soft-deleted job id
falls back to an inline "not found" state. Click-tracking Server
Actions and the view-count increment are intentionally left unwired
here — an admin looking at their own draft isn't a real candidate
visit and shouldn't be counted as one.

### Duplicate & soft delete

`duplicateJobAction` → `duplicateJob()` copies every field, generates a
fresh slug from the same title/company/location (running through the
same uniqueness check as any other create), and always resets `status`
to `DRAFT` and `publishedAt` to `null` regardless of the source job's
own status — a duplicated job is a new document, not a shortcut to
republishing the old one instantly. Delete is soft-only everywhere:
`deleteJob()` sets `deletedAt`, never removes a row, and the confirm
`AlertDialog` (both the row action and the bulk toolbar) is the only
path to it — no direct-click deletion exists anywhere in the UI.

### Validation

`lib/validations/job.ts`'s `createJobSchema`/`updateJobSchema` (Zod)
cover every field: required-field checks, `salaryMin <= salaryMax`,
valid-URL/valid-email formats on the application fields, and a
cross-field refinement requiring at least one of official website/email.
Slug uniqueness isn't a Zod rule (it depends on the database) — it's
enforced by `ensureUniqueSlug()` in the service layer for both create
and manual-override edits. `lib/validations/admin-job.ts`'s
`adminJobSearchSchema` separately validates the list page's query/
filter/sort/pagination params, kept apart from the public `jobSearchSchema`
since the two have diverged facets (admin adds status/verified filters
the public search never exposes).

### Success/error states

`hooks/use-toast.ts` + `components/ui/toast.tsx` (new — a Radix Toast
wrapper following this project's established shadcn-style primitive
pattern) back every mutation: created, updated, draft saved, published,
scheduled, archived, deleted, and bulk-action outcomes all surface as a
success toast; Zod validation failures surface inline against the
specific field (via RHF's `setError`) plus a summary toast; unexpected
server errors surface as a destructive toast rather than a blank
failure.

### Security

Every mutation goes through a Server Action in `actions/admin-jobs.actions.ts`,
each starting with `assertAdminAndRateLimit()` — re-validating the admin
session server-side (defense in depth on top of `middleware.ts` and the
protected layout, since Server Actions can be invoked directly) and
rate-limiting by caller IP (30 mutations/minute, a more generous budget
than login since bulk-archiving 50 jobs is a normal admin action). CSRF
protection is the same as Phase 8: Next.js Server Actions' built-in
origin/POST enforcement, no separate hand-rolled token. Every input is
Zod-validated server-side regardless of what client-side validation
already ran. XSS: the rich-text fields store HTML from a controlled
`contentEditable` editor (no arbitrary `dangerouslySetInnerHTML` sink
introduced — the public job page already rendered this same HTML safely
since Phase 6). SQL injection: Prisma's parameterized queries
throughout, unchanged from every prior phase.

### Performance

List, edit, and preview pages are Server Components fetching data
directly; the rich-text editor is a `"use client"` leaf rather than
pulling client-side state up into its parent pages. `getAdminJobsList()`
builds one combined `where`/`orderBy`/pagination query rather than
separate count-then-fetch round trips beyond the one unavoidable
`count()` needed for total pages. Every admin mutation calls
`revalidatePath()` against both the admin list and the specific public
pages it could affect (home, `/jobs`, `/jobs/{slug}`) so changes are
visible immediately rather than waiting out the public site's 60s ISR
window.

### Accessibility

Every form field carries a associated `<Label>`, error messages are
announced via `role="alert"`, the rich-text editor's toolbar buttons are
real `<button>` elements with `aria-label`s (not `div`s with click
handlers), the table's row-selection checkboxes and sort headers are
keyboard-operable, and the delete/bulk-delete confirmation dialogs trap
focus and support closing via <kbd>Esc</kbd> (standard Radix
`AlertDialog` behavior, unchanged from the primitive itself).

### A note on verification in this environment

Same caveat as every prior phase: this sandbox can't reach Prisma's
engine CDN, so `prisma generate` can't run here. All of Phase 9 was
verified with `tsc --noEmit` (clean) and `eslint` (clean) against the
hand-written Prisma Client type stand-in, extended this phase with
`ogTitle`/`ogDescription` on the `Job` type and `JobCreateInput`, plus
`JobUpdateInput`/`JobCreateInput` re-exports on the `Prisma` namespace
and `company` on `JobOrderByWithRelationInput` (for the Company A–Z
sort). Once you have real credentials, run
`npm run prisma:generate && npm run prisma:migrate deploy` to pick up
the `og_title`/`og_description` columns, then manually verify: creating
a job appears in the list in Draft status; Publish Now sets a visible
`publishedAt` and the job appears on the public `/jobs` page within
moments (not up to a minute later); editing a published job's content
doesn't change its status; Duplicate produces a second Draft row with a
different slug; and Delete only ever soft-deletes (confirm the row
disappears from `/admin/jobs` but the database row still exists with
`deleted_at` set).

## Phase 10 — Admin Master Data Management

The reference-data CRUD the Jobs module (Phase 9) depends on: full
Create/Edit/Delete management for Companies, Categories, and Locations
at `/admin/companies`, `/admin/categories`, and `/admin/locations`. No
recruiter accounts, no company logo upload — exactly the spec's scope,
just name/slug/description (+ website for companies) reference records
the admin curates so job postings always point at a consistent,
deduplicated company/category/location.

### One generic module, three thin adapters

Companies, Categories, and Locations are structurally identical for
list/CRUD purposes — name, slug, optional description, job count,
created/updated timestamps — with Company being the only one of the
three carrying an extra `website` field. Rather than build three
near-duplicate table/form/dialog stacks, this phase built one generic
`MasterDataManager` (search + sort + pagination + table + create/edit
dialog + delete confirmation, in `components/admin/master-data/`) driven
by a shared shape (`types/master-data.ts`), plus three small per-entity
adapter components (`CompaniesManager`/`CategoriesManager`/
`LocationsManager`) that map the generic form values onto each entity's
actual `CreateXInput`/`UpdateXInput` Zod types explicitly — an
intentional design choice over relying on structural-typing edge cases,
so each adapter is a plain, obviously-correct 15-line mapping rather
than something that only works because of TypeScript variance rules.
Adding a fourth master-data entity later means one more ~40-line
adapter + a route page, not another full CRUD UI.

### Schema change: `description` on Category and Location

`Company` already had `description`/`website` since Phase 2. `Category`
and `Location` didn't — this phase added a nullable `description Text`
column to both
(`prisma/migrations/20260710170000_category_location_description/migration.sql`)
purely for the admin-facing optional description field the spec asks
for on both Create forms. It's never surfaced on the public site (which
only ever showed name/slug/job-count for these two), so this is an
admin-only addition with no public-facing behavior change.

### List: search, sort, pagination

`lib/validations/admin-master-data.ts`'s `masterDataSearchSchema`
(query/sort/page/pageSize) and `lib/admin-master-data-url.ts` back all
three list pages — one shared schema and URL mapping, the master-data
equivalent of Phase 9's `admin-job.ts`/`admin-jobs-url.ts`. Each
service's new `getAdminXList()` (in `companies.service.ts`,
`categories.service.ts`, `locations.service.ts`) searches by name
(case-insensitive `contains`), then computes every matching row's job
count via one `groupBy` (avoiding an N+1), then sorts and paginates in
application code rather than at the database level. That's a
deliberate trade-off: "Most Jobs" is a computed aggregate, not a native
column, and Prisma's relation-count `orderBy` can't filter the counted
relation by `deletedAt` — but reference-data tables like these stay
small (tens of rows, not millions), so an unpaginated fetch + in-memory
sort + slice is simpler and just as correct as fighting that
limitation, the same trade-off `getRelatedCompanies()` already made
back in Phase 2.

### Create / Edit

One dialog (`MasterDataFormDialog`) handles both, keyed off whether
`editingRow` is set. Slug is auto-derived from the name via the
existing `slugify()` util on create, editable with a reset-to-auto
button — but **disabled entirely once a row is being edited**. That's
new behavior this phase deliberately introduced: `updateCompanySchema`/
`updateCategorySchema`/`updateLocationSchema` never accepted a `slug`
field to begin with (unlike Job's update schema, which explicitly
supports a slug override per Phase 9), so allowing an edit to *look*
like it changes the slug while silently not persisting it would be
actively misleading — every Company/Category/Location slug is
immutable after creation, keeping every `/companies/{slug}`,
`/categories/{slug}`, `/locations/{slug}` URL stable once it's been
linked from a job listing or shared externally.

### Delete: job-count guard

Companies, Categories, and Locations have no `deletedAt` column —
they're true reference data, not soft-deleted like Job — so "delete"
here is a real `prisma.x.delete()`. Before that ever runs,
`deleteCompanyAction`/`deleteCategoryAction`/`deleteLocationAction` each
call a new `getXTotalJobCount()` (counting every non-deleted job
regardless of status — draft/scheduled/published/archived all count,
not just published) and refuse with the spec's exact message — *"This
company has active jobs. Remove company from jobs before deleting."*
(and the Category/Location equivalents) — whenever that count is
greater than zero. The confirmation dialog surfaces this same
server-checked count rather than re-deriving it client-side, so the
guard can't drift out of sync with the database, and its Delete button
is disabled outright once a job count is showing.

### Default data seed

`prisma/seed.ts`'s `LOCATIONS` array already matched the spec's 8 UAE
locations (7 emirates + Al Ain) from Phase 2 — untouched. `CATEGORIES`
was renamed from its original 10-entry list to the spec's exact 15
(Accounting & Finance, Administration, Architecture & Interior Design,
Construction, Customer Service, Engineering, Healthcare, Hospitality,
IT & Software, Marketing, Sales, Retail, Human Resources, Education,
Logistics); the six sample jobs' category references were updated to
the closest renamed equivalent (e.g. `"Information Technology"` →
`"IT & Software"`) so `seedJobs()`'s `findCategory()` lookups still
resolve. The seed remains idempotent (`upsert` keyed by slug), so
re-running it against an existing database only adds the categories
that changed name, rather than duplicating anything.

### Validation

`lib/validations/company.ts` was already correct from Phase 2 (name
required, valid URL for `website`, unique slug enforced by the service
layer's `ensureUniqueSlug()`). `category.ts`/`location.ts` gained the
new `description` field this phase. Every Server Action
(`actions/admin-companies.actions.ts`,
`admin-categories.actions.ts`, `admin-locations.actions.ts`)
re-validates server-side via `safeParse` regardless of the client-side
`zodResolver` check already run in the dialog, surfacing field-level
errors back through the same `setError` pattern Phase 9 established.

### Security

`lib/admin-action-helpers.ts` is new this phase — `assertAdminAndRateLimit()`
and `flattenZodErrors()` were previously private to
`actions/admin-jobs.actions.ts`; both are now shared, and
`admin-jobs.actions.ts` itself was refactored to import them rather
than keep its own copies. Every master-data mutation goes through
`assertAdminAndRateLimit()` (re-validates the admin session, rate-limits
30 mutations/minute per caller IP, keyed per action name) before
touching the database. CSRF protection is the same as every prior admin
phase: Next.js Server Actions' built-in origin/POST enforcement. XSS:
no `dangerouslySetInnerHTML` introduced — descriptions render as plain
text wherever they're ever shown. SQL injection: Prisma's parameterized
queries throughout.

### Performance

List pages are Server Components (`dynamic = "force-dynamic"`, same as
the Jobs and Dashboard admin pages, since an admin managing reference
data needs the current state). The one `groupBy` per list load avoids
an N+1 count query per row. `revalidatePath()` fires against both the
admin list and the affected public pages (`/companies`,
`/companies/{slug}`, and the equivalents) on every mutation.

### A note on verification in this environment

Same caveat as every prior phase: `prisma generate` can't run here
(no network access to Prisma's engine-binary CDN), so this was verified
with `tsc --noEmit` (clean) and `eslint` (clean) against the
hand-written Prisma Client type stand-in — extended this phase with
`description` on `Category`/`Location` (interface + `CreateInput`) and
`CompanyWhereInput`/`CategoryWhereInput`/`LocationWhereInput` added to
the `Prisma` namespace re-export block (the same `TS2694` fix pattern
Phase 9 needed for `JobUpdateInput`). Once you have real credentials,
run `npm run prisma:generate && npm run prisma:migrate deploy && npm run prisma:seed`,
then manually verify: creating a company/category/location appears
immediately in its admin list; attempting to delete one that has jobs
attached shows the exact warning message and a disabled Delete button;
deleting one with zero jobs actually removes the row; and the public
`/companies`, `/categories`, `/locations` directory pages reflect
changes without waiting for ISR.

## Phase 11 — Advertisement Manager

Full control over every ad placement on the site — `/admin/advertisements` — without ever touching code: Google AdSense, Custom HTML (which also covers Google Ad Manager and any future network), and Image Banner ads, targeted by position and device, scheduled by date, tracked for impressions/clicks/CTR, and rendered through one reusable public component.

### Schema: from a static placeholder table to a real ad engine

The pre-Phase-11 `Advertisement` model was minimal — `position`, a single `adCode` text blob, and an `enabled` boolean — built in Phase 2 to back a purely static `AdPlaceholder` component. This phase rebuilt it into the full spec'd shape via two migrations
(`prisma/migrations/20260710180000_advertisement_manager_expand/` and `.../20260710180100_advertisement_manager_backfill/`):
`name`, an expanded 17-value `position` enum, a new `device` enum (`DESKTOP`/`MOBILE`/`ALL`), a new `adType` enum (`ADSENSE`/`CUSTOM_HTML`/`IMAGE_BANNER`), a new `status` enum (`ACTIVE`/`DISABLED`), AdSense's `adsenseClient`/`adsenseSlot`, the renamed-and-loosened `htmlCode` (was `adCode`), `imageUrl`/`targetUrl`/`width`/`height` for banners, `displayOrder`, `startDate`/`endDate`, and `impressions`/`clicks` counters.

Split into two migration files deliberately: Postgres refuses to let a newly-added enum value be *used* (e.g. in an `UPDATE`) within the same transaction it was added in, and Prisma applies each `migration.sql` in its own transaction. The first migration only adds enum values/columns; the second (backfilling `name` for pre-existing rows and migrating `enabled` → `status`) runs in its own transaction, safe to reference those same new values.

**Why `status`, not a 4th `adType` value of "Disabled".** The spec's Ad Types list includes "Disabled" alongside AdSense/Custom HTML/Image Banner, but also separately lists a `status` database field and Enable/Disable row actions. Representing "off" as both a type *and* a status would be two overlapping on/off switches for the same concept — this build treats `status: DISABLED` as the single authoritative switch (used by `AdSlot`'s eligibility query and the list's Enable/Disable actions), and keeps `adType` to exactly the three real creative kinds.

**Why "Google Ad Manager" and "future ad networks" don't have their own `adType`.** Unlike AdSense, Ad Manager (and virtually every other network) doesn't have a simple client-ID/slot-ID pair — publishers embed whatever HTML/script snippet the network's dashboard gives them. That's exactly what `CUSTOM_HTML` is for: pasting any network's embed tag, present or future, without a schema change. This is stated as a deliberate architecture decision, not an oversight.

### Rendering: `AdSlot`, the one component every placement uses

`components/ads/ad-slot.tsx` is a Server Component — `<AdSlot position="JOBS_LISTING_TOP" />` is the entire call site, used identically across the homepage (Hero/Middle/Footer), `/jobs` (Top/Middle/Bottom, including the interstitial ad `JobsResults` places after every 8 cards), a single job page (Top/Middle/Bottom plus a Desktop Sidebar slot in `JobDetails`), and the Company/Category/Location detail pages. It:

- **Detects position** from its one required prop.
- **Detects device** the same way the pre-Phase-11 `AdPlaceholder` already did — not user-agent sniffing (unreliable under ISR/caching) but CSS: it fetches both a desktop-eligible and a mobile-eligible ad for the position and wraps them in `hidden sm:flex` / `flex sm:hidden` respectively, so exactly one is ever visible per viewport, and "tablet" simply falls into the desktop bucket via the same `sm:` breakpoint the rest of the site already uses.
- **Hides expired ads** (`startDate`/`endDate` filtered in `getEligibleAdsForPosition()`) and **hides disabled ads** (`status: ACTIVE` only) at the database query level.
- **Gracefully handles empty ad spaces** — renders `null` (no wrapper div, no reserved blank box) whenever nothing is eligible. The seed intentionally leaves the 12 new page-specific positions unconfigured, so a fresh install demonstrates exactly this on every page.

`components/ads/ad-creative.tsx` is the actual per-type markup, shared between `AdSlot` (public) and the admin's live preview, so what the admin previews and what a visitor gets can never silently drift apart: AdSense renders Google's real `<ins data-ad-client data-ad-slot>` unit (the loader script itself, `components/ads/adsense-script.tsx`, loads once site-wide via `next/script` in `app/(site)/layout.tsx`, `strategy="afterInteractive"` so it never blocks first paint); Image Banner renders a plain `<a><img></a>`; Custom HTML renders inside a sandboxed `<iframe>` (see Security below). In the admin preview specifically, AdSense swaps to a static mock, since it can only ever render real inventory on a live, Google-approved site — showing the real tag there would just be a permanently blank box.

### Security: sanitization + sandboxing, not either alone

Custom HTML ad code is uniquely dangerous among this project's admin-authored fields — third-party ad tags are almost always `<script>`/`<iframe>` snippets, so a naive "strip all scripts" sanitizer would break the exact feature this module exists for. `lib/sanitize-html.ts` (new dependency: `isomorphic-dompurify`) runs every Custom HTML save through DOMPurify with `script`/`iframe`/`ins` explicitly allow-listed, while DOMPurify's default attribute rules stay active underneath — inline event handlers (`onerror`, `onload`, ...) and `javascript:` URLs are still stripped regardless of tag. That's one layer.

The second, more important layer is architectural: `AdCreative` renders Custom HTML inside `<iframe sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" srcDoc={...}>` — deliberately **without** `allow-same-origin`, so the embedded snippet executes in an opaque cross-origin context that cannot read this site's cookies, localStorage, or DOM, no matter what slipped past sanitization. Combined with the fact that only the single authenticated admin (`assertAdminAndRateLimit()`, every mutation) can ever write an `Advertisement` row in the first place — no visitor input reaches this code path — this is a defense-in-depth design, documented in full in `lib/sanitize-html.ts`'s own comment.

Every other Phase 11 security requirement follows the established pattern: Zod validation server-side regardless of client checks (`lib/validations/advertisement.ts`'s conditional-by-`adType` rules — AdSense needs client+slot, Custom HTML needs `htmlCode`, Image Banner needs `imageUrl`+`targetUrl`, plus a valid date range); `requireAdmin()` + 30/minute rate limiting on every action in `actions/admin-advertisements.actions.ts`; Prisma's parameterized queries; Next.js Server Actions' built-in CSRF protection.

### Analytics: impressions, clicks, CTR

`components/ads/ad-impression-tracker.tsx` counts an impression the way the ad industry actually defines one — the slot scrolling into view (`IntersectionObserver`, 50% threshold), not merely existing in the DOM — firing `trackAdImpressionAction` (new, unauthenticated-by-design in `actions/ad-analytics.actions.ts`, since every site visitor is a legitimate caller) once per mount. Click tracking is only wired for Image Banner: AdSense and Custom HTML render inside the sandboxed cross-origin iframe described above, which by design never surfaces its internal clicks to this page's JavaScript — that isolation is what makes the sandbox safe, and it's also exactly why Google's own AdSense dashboard, not this site's own analytics, remains the authoritative source for AdSense click data. This scope boundary is stated explicitly rather than faked. `services/advertisements.service.ts`'s `computeCtr()` derives CTR from the stored counters (returns `0`, never `NaN`, when there have been no impressions yet); the admin list table surfaces Impressions/Clicks/CTR as columns on every row.

### Admin UI

`components/admin/advertisements/advertisements-manager.tsx` orchestrates the list page: `AdminAdsSearchBar` (debounced name search), `AdminAdsFilters` (Position/Status/Type — three plain selects, not a collapsible panel like Jobs' filters, since there are no date-range facets here), `AdminAdsSortControl` (Display Order/Newest/Oldest/Name A–Z), `AdvertisementsTable`, and three shared dialogs: `AdvertisementFormDialog` (create/edit — `adType` conditionally reveals the AdSense fields / HTML textarea / Image Banner fields exactly per the spec's logic table, with a live `AdPreviewPanel` reusing the real `AdCreative` renderer), `AdPreviewDialog` (the row-level read-only "Preview" action), and `AdDeleteDialog`. Row actions (`AdRowActions`) cover Preview/Edit/Duplicate/Enable-or-Disable/Delete; `duplicateAdvertisement()` always resets the copy's `status` to `DISABLED` so a duplicated ad never goes live automatically before the admin reviews it.

**Image upload.** The spec calls for "Image Upload," but this project has no file-storage/CDN wiring anywhere (no Phase before this one needed to store an uploaded binary) — consistent with Phase 8's dashboard being upfront about similar out-of-scope gaps, Image Banner ads here take a hosted **Image URL** (any publicly reachable image link) rather than a true upload widget. Wiring actual uploads would mean adding Supabase Storage (or S3-compatible) integration, a deliberately separate concern from this phase's ad-management logic.

### Performance

`AdSlot` is a Server Component with no client-side ad-selection JavaScript; `AdsenseScript` loads `strategy="afterInteractive"` so it never blocks first paint; `next/image`'s `unoptimized` flag is used for banner images specifically because their URLs are arbitrary admin input, not a fixed known domain that could be added to `next.config`'s remote-patterns allowlist. Every admin mutation revalidates the public index routes immediately (`revalidatePath("/")`, `/jobs`, `/companies`, `/categories`, `/locations`); dynamic detail pages pick up ad changes within their existing 60s ISR window, the same as any other content change on those pages.

### A note on verification in this environment

Same caveat as every prior phase: `prisma generate` can't run here, so this was verified with `tsc --noEmit` (clean) and `eslint` (clean) against the hand-written Prisma Client type stand-in — extended this phase with the full new `Advertisement` shape, the `AdDevice`/`AdType`/`AdStatus` enums, and `AdvertisementWhereInput`/`CreateInput`/`UpdateInput` added to the `Prisma` namespace re-export block (the same `TS2694` fix pattern every prior phase's schema change has needed). It also couldn't be smoke-tested against real AdSense inventory — no sandbox can be "AdSense-approved" — so once deployed with real credentials, run `npm run prisma:generate && npm run prisma:migrate deploy`, create a real AdSense account/ad unit, and manually verify: an `ADSENSE`-type ad renders Google's real unit on a live position; a `CUSTOM_HTML` ad's script actually executes inside its sandboxed iframe; an `IMAGE_BANNER` ad's click is reflected in the admin's CTR column; and disabling an ad or letting its `endDate` pass makes it disappear from the public page within the revalidation window.

## Phase 12 — Analytics Dashboard

`/admin/analytics` — a single-page view into visitor activity and job engagement: which jobs, companies, categories, and locations perform best, over Today/Last 7 Days/Last 30 Days/Last 90 Days/a custom date range, exportable to CSV or Excel.

### Schema: a time-series event log alongside the existing lifetime counters

Every prior phase's job/ad analytics (`Analytics.views`/`websiteClicks`/`emailClicks`/`shareClicks`, `Advertisement.impressions`/`clicks`) are running lifetime totals — perfect for "how many times has this job been viewed, ever," useless for "how many job views happened yesterday." This phase adds two new tables (`prisma/migrations/20260711060000_analytics_dashboard/`) rather than replacing that design: `AnalyticsEvent`, one row per tracked action (`PAGE_VIEW`/`JOB_VIEW`/`WEBSITE_CLICK`/`EMAIL_CLICK`/`SHARE_CLICK`/`SEARCH_QUERY`) with a timestamp, optional `jobId`, `deviceType`, `referrer`, and an anonymous `visitorId`; and `ActivityLog`, a denormalized audit trail (`JOB_PUBLISHED`/`JOB_UPDATED`/`JOB_ARCHIVED`/`JOB_DELETED`/`ADVERTISEMENT_UPDATED`) that snapshots an entity's label at write time so a "Job Deleted" entry still reads correctly after the job it refers to no longer exists.

`incrementViewCount`/`incrementWebsiteClicks`/`incrementEmailClicks`/`incrementShareClicks` in `services/jobs.service.ts` now dual-write: the existing `Analytics` upsert (unchanged, still backs every prior phase's UI) plus one `AnalyticsEvent` row via `recordAnalyticsEvent()`. `AnalyticsEvent.jobId` deliberately has **no foreign key** to `Job.id` — unlike every other relation on `Job`, which uses `onDelete: Restrict` specifically so a job can't be deleted while referenced — because event history for deleted jobs is exactly what a "did this job perform well before it was removed" question needs; the FK-less design lets it survive.

### Tracking: an anonymous visitor cookie, not a user account

"Unique visitors" needs some way to tell two requests from the same browser apart, and this project deliberately has no user accounts (see the README's opening section) to borrow one from. `lib/visitor-id.ts` sets a random UUID in a first-party `jn_visitor_id` cookie (1-year expiry, `httpOnly`, `sameSite: lax`) on a visitor's first tracked request — no email, name, or IP attached, nothing that identifies a person, just a "same browser came back" signal, the same trust model as a "remember this device" cookie. `components/analytics/page-view-tracker.tsx`, mounted once in `app/(site)/layout.tsx`, fires a `PAGE_VIEW` event on every route change (client-side navigations included, which a server-only approach would miss); device type is classified from the `User-Agent` header (`lib/device-type.ts`, the same "mobile vs. everything else" split `AdSlot` already uses) rather than any client-side fingerprinting.

### Aggregation: `services/analytics.service.ts`

Everything the dashboard shows is computed from `AnalyticsEvent` within the currently selected date range — not the lifetime counters — so KPIs, charts, and tables all stay scoped to one consistent snapshot rather than mixing "this number is all-time, that one is last 30 days" on the same screen:

- **KPI cards** — "Total Visitors," "Total Page Views," "Total Job Views," and the three apply-click counts respect the active filter. "Visitors Today/This Week/This Month" are deliberately **fixed rolling windows** regardless of the filter, since they're already time-scoped by their own name. "Total Published Jobs" is a current snapshot (a job's status isn't a point-in-time event to range over).
- **Daily Visitors (Last 30 Days)** is a fixed 30-day window per its literal label, independent of the page filter; Weekly (12 weeks) and Monthly (12 months) visitor charts follow the same fixed-window logic. Job Views Trend, Apply Click Trend, and New Jobs Published **do** respect the active filter.
- **Top Jobs/Companies/Categories/Locations** are built by grouping `AnalyticsEvent` rows within the selected range into a `jobId → {views, websiteClicks, emailClicks}` map, then joining against `Job` (and its `company`/`category`/`location` relations) — the same "fetch matching rows, aggregate/sort/paginate in application code" pattern Phase 10's master-data lists and Phase 11's ad list already use, appropriate at this project's data scale. CTR is `(websiteClicks + emailClicks) / views × 100`.
- **Recent Activity** delegates straight to `getRecentActivity()` (`services/activity-log.service.ts`), unchanged from how it's written.

The whole result set is fetched by one function, `getAnalyticsDashboardData(filter, topJobsSearch)`, wrapped in `unstable_cache` with a 60-second revalidate window — short enough that the dashboard still feels live and a status change shows up within a minute, long enough to absorb repeat loads (several admins on the page, a filter click landing back on an already-viewed range) without re-running eleven aggregation queries per request. Recent Activity is fetched outside this cache, uncached, so an admin who just published or edited a job sees it in the timeline immediately rather than up to 60 seconds later.

### UI

`KpiGrid` (ten `StatCard` tiles, reusing the Phase 8 dashboard's component), `AnalyticsFilterBar` (Today/7d/30d/90d quick-picks plus a two-month range-calendar popover for Custom, all state kept in the URL like every other admin list page), six chart cards (`ChartCard` + Recharts line/bar charts), the Top Jobs table (search + sort + pagination, URL-driven), three Top-Entity tables, and the Recent Activity timeline (relative timestamps via `date-fns`'s `formatDistanceToNow`). Same Apple-inspired/rounded-card/soft-shadow/blue-accent language as every prior admin screen — no new visual language introduced.

### Performance

Recharts (a sizeable client-only dependency) is code-split via `next/dynamic(..., { ssr: false })` in `components/admin/analytics/lazy-charts.tsx`, so the charting bundle is fetched only once a chart actually mounts, not on every `/admin/analytics` page load; a `Skeleton` fills the gap. KPI cards and tables render directly from the server response with no client JS dependency. The aggregation layer is cached as described above. All eleven aggregation queries for a given filter run in parallel via `Promise.all`.

### Security

`/admin/analytics` sits inside `app/admin/(protected)/`, covered by the same `middleware.ts` Supabase-session redirect as every other admin route — no separate gate was needed. The page itself performs no mutations (pure read), so there's no new Server Action surface to authenticate; the date-range filter and Top Jobs search/sort/page are Zod-validated (`lib/validations/analytics.ts`) before touching the database, same as every other admin list page's URL-derived input.

### A note on verification in this environment

Same caveat as every prior phase: `prisma generate` can't run in this sandbox (Prisma's binary CDN returns 403 here), so this was verified with `tsc --noEmit` (clean) and `eslint` (clean) against the hand-written `.prisma/client` type stand-in, extended this phase with the `AnalyticsEventType`/`DeviceType`/`ActivityAction` enums, the `AnalyticsEvent`/`ActivityLog` models and delegates (including a two-field `groupBy(["jobId", "type"])` overload and a combined `{createdAt, visitorId}` `select` overload the visitor-series bucketing needed), and the corresponding `Prisma` namespace re-exports. Once deployed with a real Postgres connection, run `npm run prisma:generate && npm run prisma:migrate deploy`, then let the site collect a few days of real traffic before judging the charts — a fresh install's dashboard will correctly show zeros/empty states everywhere, which is the honest result of no events having been recorded yet, not a bug.

## Phase 13 — Website Settings & System Configuration

`/admin/settings` — centralized configuration for the whole website across eight sections (General, Contact Information, Social Media, SEO, Google Integrations, Email, Website Behavior, Branding), so the administrator can change how the site presents itself without a code change or redeploy.

### Schema: one flexible key/value table, not thirty-five columns

`Setting` (`prisma/migrations/20260711120000_website_settings/`) is deliberately a key/value store — `id`, `setting_key` (unique), `setting_value` (always text), `setting_type` (`STRING`/`NUMBER`/`BOOLEAN`/`JSON`, how to parse `setting_value` back), `updated_at` — rather than one wide `Settings` table with a fixed nullable column per field. Roughly 30 fields across eight sections would make a single-row table an ever-growing wall of nullable columns, and every future settings addition (this phase explicitly leaves room for future SMTP fields under Email, for instance) would need its own migration. With key/value, adding a setting is a data change, not a schema change.

`lib/settings-registry.ts` is the single source of truth mapping every field (`general.websiteName`, `behavior.jobsPerPage`, ...) to its dotted database key and `SettingType`, using an `as const satisfies` pattern so each section's real TypeScript shape (`GeneralSettings`, `BehaviorSettings`, ...) is derived from the registry via a mapped type rather than hand-written a second time and risking drift.

### Helpers: `getSetting()` / `updateSetting()` / `getAllSettings()`, cached

`services/settings.service.ts` provides exactly the three helpers the spec asks for, plus `updateSettingsSection()` (bulk-saves one section's whole form in one call — what the admin UI's per-section "Save" button actually invokes). `getAllSettings()` fetches every row, applies the registry's defaults for any key never written to yet (a fresh install renders correctly with zero seed data), and is wrapped in `unstable_cache` (5-minute revalidate, tagged `"settings"`) — every read in the app, now and in future phases that consume these values, goes through this one cached call rather than hitting Postgres per request. Every write (`updateSetting`/`updateSettingsSection`/the branding upload action) calls `revalidateTag("settings")` immediately after, so a saved change is reflected right away rather than waiting out the cache window.

### Validation

`lib/validations/settings.ts` has one Zod schema per section, matching `WebsiteSettings`'s shape field-for-field. URL and email fields use a shared `optionalUrl()`/`optionalEmail()` helper — a union of `z.literal("")` and the real validator — since these are always-present form fields an admin may simply leave blank (not every site needs a Twitter account), not absent object keys. Google integration IDs (`gaMeasurementId`, `gtmId`, `adsensePublisherId`) are pattern-checked loosely against their known formats rather than strictly, since Google occasionally adjusts ID formats and a too-strict regex would reject a legitimate ID sooner than Google itself would. `jobsPerPage` is `z.coerce.number().int().min(1).max(100)`. Branding uploads are validated server-side by MIME type (`ALLOWED_IMAGE_MIME_TYPES`: PNG/JPEG/WebP/SVG) and size cap (5MB logo/OG image, 1MB favicon) before any processing happens — never trusting the browser file input's `accept` attribute alone.

### Image uploads: real storage, automatic optimization

Phase 11's Advertisement Manager deliberately used a plain "Image URL" field for banner ads, noting at the time that the project had "no file-storage infrastructure anywhere" — this phase closes that gap for real. `lib/branding-storage.ts` uploads to a Supabase Storage bucket (`branding`, public, lazily created on first upload via the service-role client already scaffolded in `lib/supabase/admin.ts` since Phase 2, whose own doc comment names "managing storage assets" as its intended future use) rather than adding a third-party storage provider. `lib/image-optimize.ts` runs every non-SVG upload through `sharp` before it's stored: Logo resizes to fit inside 512×512 and re-encodes to WebP; Favicon resizes to a hard 64×64 PNG; Default OG Image crops to the standard 1200×630 social-preview ratio and re-encodes to JPEG. SVG uploads are passed through untouched — rasterizing a vector logo to hit a pixel target would defeat the point of uploading an SVG one in the first place. `next.config.ts`'s `images.remotePatterns` already allowed `*.supabase.co/storage/v1/object/public/**` since Phase 2 (in anticipation of exactly this), so the uploaded branding images render through `next/image` with real optimization, not `unoptimized` — unlike Phase 11's arbitrary admin-pasted ad-banner URLs, these are all on a known, trusted domain.

Uploading and saving are one step: `uploadBrandingAssetAction` validates, optimizes, uploads, and writes the resulting public URL straight into `general.logoUrl` / `general.faviconUrl` / `seo.ogImageUrl` in the same call — there's no separate "you uploaded a file but forgot to click Save" state a text field could be left in.

### Why Branding has no settings keys of its own

The spec lists Logo/Favicon uploads under General Settings, a Default Open Graph Image under SEO Settings, and then Logo/Favicon/Default OG Image again under a separate Branding section. Storing the same logical asset under two different keys would let a logo uploaded via "Branding" and a hypothetical upload field on the "General" tab silently disagree. This build treats Branding as the one place those three uploads physically happen (`BrandingSettingsPanel`), writing into the exact same `general.logoUrl`/`general.faviconUrl`/`seo.ogImageUrl` keys General and SEO's own read-only-in-that-tab fields reference — one asset, one key, one upload surface.

### UI

`SettingsTabs` (`@radix-ui/react-tabs`, wrapped as `components/ui/tabs.tsx` following the same shadcn-style wrapping every other Radix primitive in this project already uses) gives each of the eight sections its own tab rather than one long scrolling page. Seven sections (General, Contact, Social Media, SEO, Google, Email, Behavior) share one generic `SettingsSectionForm` component: Zod-validated via `zodResolver`, a Save button disabled until the form is actually dirty, field-level errors surfaced via `setError`, and a success/error toast on submit, exactly like every other admin form in this project. SEO Settings additionally renders `SeoSerpPreview`, a live "how this looks in Google" card driven by `useWatch` — it updates as the admin types, before they've even saved.

### Security

Every Server Action in `actions/admin-settings.actions.ts` (one per section, plus the upload action) starts with `assertAdminAndRateLimit()` — the same admin-session re-check and per-IP rate limit every other admin mutation in this project uses (the upload action's limit is tighter, 10/minute, given it does real image processing and network I/O rather than a simple database write). All input is Zod-validated server-side regardless of client-side checks. `/admin/settings` itself sits inside `app/admin/(protected)/`, covered by the existing `middleware.ts` Supabase-session redirect — no new gate was needed. Uploaded files are validated by MIME type and size before ever reaching `sharp` or Supabase Storage, closing the obvious XSS/oversized-upload vectors an unrestricted file input would otherwise open.

### What this phase deliberately does not build

Per the spec's own scope line ("Do not build SEO generation or deployment yet"): saving a Google Analytics Measurement ID or a Search Console verification code here stores the value securely, but does **not** inject a GA/GTM `<script>` tag or a verification `<meta>` tag into the public site's `<head>` — that's the "SEO/analytics generation" step explicitly scoped out. Likewise, toggling Maintenance Mode on writes `behavior.maintenanceMode = true` to the database, but does **not** yet gate public pages behind a maintenance page in `middleware.ts` — wiring that up is a deployment-behavior change this phase's spec explicitly defers. Both are one small follow-up phase away: the values are already validated, stored, cached, and ready to be read by whatever future phase wires them in.

### A note on verification in this environment

Same caveat as every prior phase: `prisma generate` can't run in this sandbox, so this was verified with `tsc --noEmit` (clean) and `eslint` (clean) against the hand-written `.prisma/client` type stand-in, extended this phase with the `SettingType` enum and the `Setting` model/delegate. `sharp` and `@radix-ui/react-tabs` are real installed dependencies (not hand-shimmed) and imported/type-checked normally. Once deployed with real Supabase credentials, run `npm run prisma:generate && npm run prisma:migrate deploy`, then verify: each section's Save button round-trips correctly, an uploaded logo/favicon/OG image appears immediately in its preview and is reachable at its public Supabase Storage URL, and the SEO tab's search-result preview updates live while typing.

## Phase 14 — Enterprise SEO System

A complete, production-grade SEO layer across dynamic metadata, structured data, XML sitemaps, and `robots.txt` — built largely by consolidating and extending SEO groundwork already laid in Phases 4–7 (a working `constructMetadata()` helper and a solid `organizationJsonLd`/`websiteJsonLd`/`breadcrumbJsonLd`/`jobPostingJsonLd` JSON-LD library already existed) rather than starting from zero, and wiring all of it into Phase 13's Settings module so an admin's configuration in `/admin/settings` is what search engines and social platforms actually see.

### The helper library: `lib/seo/`

Rebuilt as a proper module with the exact reusable helpers the spec names, each a small, composable, independently testable function:

- `buildCanonicalUrl(baseUrl, path)` (`lib/seo/canonical.ts`) — pure URL assembly. The base domain it's given already comes from either Settings' Canonical Domain override or the `NEXT_PUBLIC_SITE_URL` fallback, resolved once per request by the orchestrator below, so this function itself needs no knowledge of Settings at all.
- `buildOpenGraph(params)` (`lib/seo/open-graph.ts`) and `buildTwitterCard(params)` (`lib/seo/twitter-card.ts`) — build the `openGraph`/`twitter` slices of a Next.js `Metadata` object. Twitter cards always use `summary_large_image` (the type that actually renders an image in-feed) and include `site`/`creator` when a handle can be extracted from the configured X/Twitter URL.
- `generateMetadata(params)` (`lib/seo/metadata.ts`) — the one function every page calls to get title, description, keywords, canonical URL, Open Graph, Twitter Card, and robots directives in one `Metadata` object. Since Next.js requires each page's own exported function to be literally named `generateMetadata`, every call site imports this aliased (`import { generateMetadata as buildMetadata } from "@/lib/seo"`) and its own `export async function generateMetadata()` calls into it — the same pattern `zodResolver`-style helper wrapping has used throughout this project.
- `buildOrganizationSchema()`, `buildWebsiteSchema()`, `buildBreadcrumbSchema()`, `buildJobPostingSchema()` (`lib/seo/json-ld.ts`, renamed from the pre-existing `organizationJsonLd`/etc. for naming consistency) — the four schema.org types the spec requires. `JobPosting` already covered every required field from Phase 6 (`title`, `description`, `hiringOrganization`, `jobLocation`, `employmentType`, `baseSalary`, `datePosted`, `validThrough`, `applicantLocationRequirements` for remote roles, `directApply: false`, `identifier`) — this phase's job here was renaming for consistency, not adding missing fields.

### Settings integration: `getSiteMetadataDefaults()`

`lib/seo/site-metadata.ts` is the bridge into Phase 13. It reads `getAllSettings()` (already cached via `unstable_cache`) and resolves the site-wide name, description, keywords, canonical domain, OG image, logo, and social links — falling back to `constants/site.ts` field-by-field for anything an admin hasn't configured yet. Every metadata/schema call in the app goes through this one function, so changing the Website Name or uploading a new OG image in `/admin/settings` updates every page's metadata immediately, with no redeploy — exactly the "reuse the Settings module" instruction this phase's spec called for.

### Fallback images: real files where none existed

This project's `public/` directory has always been empty — no static OG image, favicon, or app icon file has existed since Phase 1. Rather than only fixing this by asking every admin to upload one before their first share, this phase adds two dynamically-rendered image routes using `next/og`'s `ImageResponse`:

- `app/opengraph-image.tsx` → `/opengraph-image` — a branded 1200×630 card (site name + tagline over the brand gradient), used whenever Settings' "Default Open Graph Image" hasn't been uploaded yet.
- `app/icon.tsx` → `/icon` — a branded 64×64 monogram, auto-wired into every page's `<head>` by Next's file convention, used whenever Settings' "Favicon" hasn't been uploaded yet.

`generateMetadata()` only sets an explicit `icons.icon` override when `general.faviconUrl` is actually configured — otherwise it's omitted entirely so the `/icon` route convention applies on its own. A fresh install with zero Settings configured still renders a real, working, branded preview image and favicon on every shared link, not a broken image icon.

### Structured data on every page

Home renders `Organization` + `WebSite` (with a `SearchAction`, enabling Google's sitelinks search box) + `BreadcrumbList`. Single Job pages render `Organization` + `BreadcrumbList` + the full `JobPosting` schema. Category/Location/Company detail pages, and the four new static pages below, render `BreadcrumbList` matching their visible `<Breadcrumb>` trail exactly (e.g. Home → Jobs → *Interior Designer* on a job page, or Home → Categories → *Engineering* on a category page) — the same trail a user sees is the same trail search engines get as structured data, never two different hierarchies.

### The four missing pages

`/about`, `/contact`, `/privacy`, and `/terms` have been linked from the header/footer navigation (`constants/nav.ts`) since Phase 4, but no route ever existed behind any of them — every one of those links has 404'd for the entire project's life until this phase. Building them was squarely in scope (they're explicitly in the spec's page list), so:

- **About** leads with `general.description`/`general.tagline` from Settings, then live platform stats and the "how it works" explanation (discovery platform, not a recruiter, no hosted applications).
- **Contact** renders Settings' Contact Information and Social Media sections directly — email, support email, phone, office address (linking to the configured Google Maps link), and social icons. Deliberately not a working contact *form*: Phase 13's Email Settings section explicitly has no SMTP send path yet, so a form here would either silently fail or fake a success message. Direct `mailto:`/`tel:` links are the honest alternative until that's built.
- **Privacy Policy** and **Terms & Conditions** are written to describe *this specific platform's actual behavior* — the anonymous analytics cookie and event log from Phase 12, no candidate accounts, links out to employers, optional Google Analytics/AdSense once configured — rather than generic legal boilerplate that would misdescribe the product. Both carry an explicit, prominent disclaimer that they're a starting template, not legal advice, and should be reviewed by qualified counsel (particularly for UAE PDPL compliance) before an operator relies on them in production.

All four are wired into `generateMetadata()`, `BreadcrumbList` schema, and the sitemap exactly like every other page.

### XML sitemaps: an index plus five named children

The pre-existing single `app/sitemap.ts` (Next's built-in file-convention, one flat `<urlset>`) is replaced with hand-written Route Handlers, giving each content type its own literally-named, independently-monitorable sitemap — useful in Google Search Console, where a drop in job-page indexing coverage shows up in `sitemap-jobs.xml`'s own report without being mixed into everything else:

- `/sitemap.xml` — the sitemap index, referencing the five children below.
- `/sitemap-pages.xml` — the nine core static routes (home, four directory indexes, About/Contact/Privacy/Terms).
- `/sitemap-jobs.xml`, `/sitemap-categories.xml`, `/sitemap-locations.xml`, `/sitemap-companies.xml` — one per content type, each pulling straight from the existing service layer.

**Only real, visible pages are listed.** `getAllPublishedJobSlugsForSitemap()` (`services/jobs.service.ts`) previously only filtered by `status: "PUBLISHED"` and non-deleted — it did *not* exclude jobs whose `applicationDeadline` had already passed, even though `/jobs/[slug]` itself treats an expired job as a 404 (`isExpired()`). That mismatch meant the sitemap could hand Google a URL that 404s when crawled — this phase fixed the query to exclude expired jobs, matching the page's own visibility rule exactly. Categories/Locations sitemaps list every reference row (same "show every row, even with zero live jobs" rule the `/categories` and `/locations` directory pages themselves follow); Companies lists only companies with at least one current published job, since `getAllCompaniesWithJobCounts()` already excludes empty ones.

Every sitemap route is `revalidate = 3600` — regenerated at most hourly, reflecting new/edited/expired jobs and Settings changes automatically without a redeploy, while a CDN can still cache the response for real traffic.

### `robots.txt`

`app/robots.ts` allows indexing of `/` broadly and explicitly disallows `/admin` (and everything under it, including the job preview route), any `/api/` route, and generic preview/draft query patterns, then references `/sitemap.xml` and the resolved canonical domain as `host`. Rebuilt to read `getSiteMetadataDefaults()` so the referenced sitemap URL always matches whatever canonical domain is configured, rather than a hardcoded value that could drift from the rest of the SEO system.

### Canonical URLs and duplicate-content prevention

Every canonical URL in the app is built from the *same* resolved `baseUrl` (Settings' Canonical Domain, falling back to `NEXT_PUBLIC_SITE_URL`) — including every `BreadcrumbList`'s URLs, which previously used the static `siteConfig.url` directly in ten different page files. That inconsistency meant an admin setting a custom canonical domain in `/admin/settings` would have changed a page's `<link rel="canonical">` without changing what its own breadcrumb schema claimed as its URL — two different domains describing the same page. Every page now resolves `baseUrl` once via `getSiteMetadataDefaults()` and reuses it for both. For the faceted `/jobs` listing (filterable by location/category/company/type/salary/etc.), duplicate content from query-parameter *ordering* was already structurally prevented before this phase: `buildJobsQueryString()` (`lib/jobs-url.ts`) always re-serializes the parsed, typed filter object in one fixed key order, regardless of what order the incoming query string had them in — so two requests for the same filter combination always produce byte-identical canonical URLs.

### Performance and caching

`getAllSettings()` was already `unstable_cache`-wrapped in Phase 13 (5-minute revalidate); every SEO helper that depends on it — `generateMetadata()`, every schema builder, both dynamic image routes, all five sitemaps, and `robots.txt` — inherits that same cache rather than issuing its own database round trip per request. Metadata generation therefore adds one cheap cache read per page, not a query. Server Components are used throughout (no client-side metadata generation exists anywhere in this project); the fallback OG image and favicon are generated once per revalidation window, not per request.

### A note on verification in this environment

Same caveat as every prior phase: `prisma generate` can't run in this sandbox, so this was verified with `tsc --noEmit` (clean) and `eslint` (clean). The sitemap/robots XML output was checked by construction against the sitemaps.org schema (a valid `<urlset>`/`<sitemapindex>` with escaped `<loc>` values) rather than run through an external validator, since this sandbox has no network access to one. Once deployed, it's worth running the live site through Google's Rich Results Test (for the `JobPosting`/`Organization`/`BreadcrumbList` schema), the sitemap through Google Search Console's sitemap report, and confirming `robots.txt` at the live domain resolves the way `app/robots.ts` intends.

## Phase 15 — Performance Optimization & Core Web Vitals

A full performance pass over the existing application — Next.js rendering strategy, Prisma query shape, caching/ISR coverage, bundle size, streaming, search/pagination, the admin panel, and monitoring — with the explicit constraint of the spec followed throughout: no functionality changed, only how efficiently the existing behavior is delivered.

### The caching bug this phase found and fixed: `/jobs/[slug]` had no ISR

Every other detail page (`/categories/[slug]`, `/locations/[slug]`, `/companies/[slug]`) already had `export const revalidate = 60`. The job detail page didn't, and the reason was subtle: its Server Component called `incrementViewCount(job.id)` directly in its render body, which internally calls `getOrCreateVisitorId()`, which reads/writes a cookie. In Next.js, using `cookies()` or `headers()` *anywhere* in a Server Component's render path — even several function calls deep — forces the **entire route** to opt out of static rendering and ISR, regardless of any `revalidate` export. The page was silently fully dynamic on every single request.

The fix follows the exact pattern already established by Phase 12's `PageViewTracker` and Phase 11's `AdImpressionTracker`: move the cookie-dependent side effect out of the Server Component entirely, into a small Client Component (`components/jobs/job-view-tracker.tsx`) that fires a Server Action (`trackJobViewAction`, in `actions/analytics.actions.ts`) from a `useEffect` after mount, guarded by a `useRef` so React Strict Mode's dev-only double-invocation can't double-count a view. With the increment no longer in the render path, `export const revalidate = 60` was added to `/jobs/[slug]` — it now caches exactly like its sibling detail pages, and view counts still increment correctly, just from the client after the page has already streamed down.

### Database: `distinct` pushed to Postgres, composite indexes matching real sort combinations

`getDistinctEducationValues()` and `getDistinctVisaStatusValues()` (`services/jobs.service.ts`) previously fetched every published job's `education`/`visaStatus` column and deduplicated with a JavaScript `Set` — one row transferred per job just to end up with a handful of unique filter-dropdown values. Both now use Prisma's `distinct: ["education"]` / `distinct: ["visaStatus"]`, which compiles to a `SELECT DISTINCT` — the query now scales with the number of distinct values, not the number of jobs.

`/jobs`' three additional sort options (Highest Salary, Lowest Salary, A–Z) each combine with the status filter every public query already applies, but only `(status, createdAt)`-shaped indexes existed. Added `@@index([status, salaryMax])`, `@@index([status, salaryMin])`, and `@@index([status, title])` to the `Job` model so a filtered *and* sorted query can be satisfied from a single index scan instead of a separate sort step. Also enabled the `pg_trgm` Postgres extension and added GIN trigram indexes on `Job.title` and `Job.description` (`gin_trgm_ops`) — a plain B-tree index cannot serve a leading-wildcard `ILIKE '%term%'` query, so without this, keyword search (`contains` + `mode: "insensitive"`) would force a full sequential scan as the jobs table grows. All four new indexes are in `prisma/migrations/20260711140000_performance_indexes/migration.sql`.

Every paginated list query audited this phase (`filterJobs`, `searchJobs`, `getAdminJobsList`) already used `skip`/`take` with the row count run in parallel via `Promise.all` rather than fetching everything and slicing in JavaScript — confirmed correct, no changes needed there. The smaller reference-data admin lists (Categories/Locations/Companies/Advertisements — dozens to low hundreds of rows) intentionally keep their existing fetch-all-then-sort-in-JS approach: at this scale it's simpler and just as fast as a database-side sort, and rewriting it would add risk for no real gain.

### Images and fonts

`next.config.ts` now declares `images.formats: ["image/avif", "image/webp"]` (modern-format negotiation on top of the existing `remotePatterns`) and `images.minimumCacheTTL: 31536000` (one year) so the Next.js Image Optimization API serves the smallest format a visitor's browser supports and caches it aggressively. Every image already went through `next/image` from prior phases; `next/font/google` (already in use for the site's sans font, `lib/fonts.ts`) already self-hosts at build time, preloads, and uses `display: "swap"` by default — the common misconception that `next/font/local` is required for "self-hosting" doesn't apply here, so no font changes were needed.

### JavaScript bundle size: audited, no dead weight found

The spec calls out lazy-loading "charts, editors, and admin-only modules." Auditing each:

- **Charts** (`recharts`, used only in `/admin/analytics`) were already dynamically imported via `next/dynamic(..., { ssr: false })` in `components/admin/analytics/lazy-charts.tsx` since Phase 12 — confirmed still correctly wired.
- **Excel export** (`xlsx`) was already loaded via `await import("xlsx")` inside the export button's click handler since Phase 12, not at module scope — confirmed still correct.
- **The rich text editor** turned out not to be a heavy third-party dependency at all: it's a deliberately lightweight, custom `contentEditable` + `document.execCommand` implementation built in Phase 3 specifically to avoid pulling in a library like TipTap or Lexical. There is no editor bundle to lazy-load.
- **Advertisement Custom HTML** sanitization (`isomorphic-dompurify`) runs only in `services/advertisements.service.ts` — a server-only module called from a Server Action when an admin saves an ad. The public-facing `AdCreative` component renders the *already-sanitized* HTML directly into a sandboxed `<iframe>`'s `srcDoc`; it never imports the sanitizer, so `isomorphic-dompurify` never reaches the browser bundle, public or admin.
- **Admin vs. public code splitting** is already automatic and complete: Next.js's App Router code-splits by route segment, and admin routes (`app/admin/(protected)/*`) and public routes (`app/(site)/*`) are entirely separate segment trees — no admin-only component (Radix Tabs, RHF forms, the settings module, analytics charts) can leak into the public bundle, and no public-only code loads on an admin visit.

No lazy-loading changes were needed; everything the spec was worried about was either already handled in Phase 12 or was never actually a bundle liability to begin with.

### Streaming and Suspense boundaries

Previously, both the homepage and the two busiest admin pages (`/admin/dashboard`, `/admin/jobs`) ran every data fetch in one `Promise.all` and rendered nothing until all of them resolved. This phase splits out the sections whose data the page's first meaningful paint doesn't actually depend on, wrapping each in its own `<Suspense>` boundary with a layout-matched skeleton fallback:

- **Homepage** (`app/(site)/page.tsx`): Hero's own data (locations, categories, stats — needed immediately since Hero is the page's LCP element) is still fetched up front. Featured Jobs, Latest Jobs, and Popular Companies — sections Hero has no dependency on — are each now a small async Server Component (`FeaturedJobsAsync`, `LatestJobsAsync`, `PopularCompaniesAsync`) streamed in behind `<Suspense>`, so none of their queries can block Hero's paint.
- **Admin dashboard** (`force-dynamic`, so every visit re-runs every query with no ISR safety net): Stats, Notifications, and Recent Jobs now each stream independently, so a slower Recent Jobs query can't hold up the KPI cards.
- **Admin jobs list** (`force-dynamic`): the count/export header, table, and pagination all depend on `getAdminJobsList()` — the one query whose cost genuinely varies with the current search/filter/sort combination — so they're grouped into a single streamed component, keyed on the filter state so a new search re-suspends cleanly. The search bar, filter dropdowns, and sort control (backed by small, fast reference-data queries) render immediately without waiting on it.
- **Admin analytics** (`force-dynamic`): `getRecentActivity()` was already fetched uncached and separately from the cached KPI/chart snapshot (by design, so it's always current) but was still awaited in the same `Promise.all` as everything else. It now streams independently, so the cached snapshot's KPIs/charts/tables don't wait on the always-fresh activity feed.

Route-level `loading.tsx` coverage was also filled in where missing: `/categories`, `/locations`, and `/companies` (list pages previously fell back to the generic root `loading.tsx`) now get a dedicated grid-shaped skeleton (`components/shared/directory-grid-skeleton.tsx`), and a shared `app/admin/(protected)/loading.tsx` now covers every admin route that doesn't define a more specific one (Advertisements, Categories, Companies, Locations, Settings, job create/edit/preview) — the sidebar/topbar shell from the admin layout stays mounted throughout, so navigating between admin sections never flashes a blank page.

### Search, filtering, and pagination

Confirmed every live "search as you type" input already debounces its URL/query update via the existing `useDebounce` hook (300–400ms, one shared pattern across `/jobs`, the admin jobs/ads/master-data/top-jobs search bars, and the categories/locations/companies directory search): `hooks/use-debounce.ts` is used consistently, and the few search inputs that don't debounce (`KeywordSearch`/`SearchInput`/`AdvancedSearch`, used by the homepage Hero's search form) are correctly submit-triggered rather than live-as-you-type, so debouncing wouldn't apply to them anyway. Pagination throughout (`filterJobs`, `searchJobs`, `getAdminJobsList`) already uses database-level `skip`/`take` with the total count run in parallel — confirmed efficient, no changes required beyond the indexing work described above.

### Monitoring: Vercel Analytics + Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are now installed and mounted in the true root layout (`app/layout.tsx`), alongside every other provider, so both cover the entire app (public site and admin panel). Both packages no-op safely when the app isn't running on Vercel, so this is zero-risk locally and in this sandbox — once deployed to Vercel, traffic and Core Web Vitals (LCP/INP/CLS) become visible in the Vercel dashboard immediately, with no further wiring needed. This satisfies the spec's "prepare hooks for future monitoring" requirement directly.

### Accessibility

All new UI this phase — every new Suspense fallback/skeleton and the two new `loading.tsx` files — carries `role="status"`, `aria-live="polite"`, and a screen-reader-only "Loading…" label, so assistive tech is told a loading state is in progress rather than encountering silent, unlabeled placeholder content. This is additive: it doesn't touch any pre-existing skeleton component from earlier phases, and no interactive element, focus order, or keyboard path changed anywhere in this phase's edits — every restructured page (dashboard, jobs list, analytics, homepage) renders the exact same components with the exact same props, just split across `<Suspense>` boundaries.

### A note on verification in this environment

Same caveat as every prior phase: `prisma generate` can't run in this sandbox, so the two new migrations (performance indexes, and the trigram/GIN indexes) were hand-authored and verified by inspection against the schema rather than by running them against a live database. Both `tsc --noEmit` and `eslint` are clean across the entire project after every change in this phase, checked incrementally after each edit and again as a final full-project pass. `@vercel/analytics` and `@vercel/speed-insights` are real installed dependencies, type-checked normally; their actual data collection can only be confirmed once the app is deployed to Vercel. Once deployed, it's worth running a real Lighthouse pass against the production URL to confirm the Performance ≥95 / Accessibility ≥100 / Best Practices ≥100 / SEO ≥100 targets, and checking the Vercel Speed Insights dashboard against real visitor Core Web Vitals after a few days of traffic.

## Phase 16 — Enterprise Security Hardening

A full security pass across authentication, authorization, input validation, CSRF, XSS, rate limiting, security headers, file uploads, environment validation, error handling, and audit logging — following OWASP's general guidance throughout. This phase found that a lot of the groundwork was already solid (Supabase session revalidation via `getUser()` rather than the spoofable `getSession()`, a shared `assertAdminAndRateLimit()` guard already covering every admin mutation, DOMPurify already sanitizing advertisement HTML, Zod validating every form), and concentrated the real work on the concrete gaps that audit actually surfaced.

### Session cookies: closing the `httpOnly: false` gap

`@supabase/ssr`'s own `DEFAULT_COOKIE_OPTIONS` ships `httpOnly: false` — reasonable for its general-purpose case, but wrong here: the admin session is never touched by the browser client (sign-in and sign-out are both Server Actions, per `actions/auth.actions.ts`), so there was never a legitimate reason for the session cookie to be readable from JavaScript at all. `lib/supabase/cookie-options.ts` (new) defines `SESSION_COOKIE_OPTIONS` — `httpOnly: true`, `secure` in production, `sameSite: "lax"` — passed to both server-side Supabase clients (`lib/supabase/server.ts`, `lib/supabase/middleware.ts`). This closes a real XSS-to-session-theft path: even if a future dependency vulnerability ever let an attacker run script on `/admin`, the session cookie itself is now unreadable to `document.cookie`. The browser client (`lib/supabase/client.ts`) deliberately keeps the defaults — it writes cookies via `document.cookie` directly and never handles auth, so an `httpOnly` cookie there would just silently fail to set.

`signOutAction()` now explicitly passes `{ scope: "global" }` to `supabase.auth.signOut()` — invalidates every refresh token for the account, signing out on every device/browser at once (this happens to already be `supabase-js`'s default; it's spelled out explicitly so that fact isn't silently relied upon, and to satisfy the spec's "logout from all devices" item in one obvious place).

### Removed a real default-credentials liability

`prisma/seed.ts` had a `seedAdmin()` step that upserted a row into the (Prisma-schema-only, Supabase-Auth-superseded) `Admin` table with a hardcoded password — `hash("ChangeMe123!", 12)` — every time the seed ran. That table and column are never read by any real authentication code path today (this project authenticates entirely through Supabase Auth), which makes seeding it with a known, guessable password a textbook default-credentials finding: a real bcrypt hash of a well-known string, sitting in version control, for a table that *looks* like it gates access. `seedAdmin()` and the now-unused `bcryptjs` dependency have been removed entirely; the one real administrator account continues to be created once, manually, directly in the Supabase dashboard, exactly as `.env.example` already documented.

### CSRF: made explicit, not just implied

Next.js Server Actions already reject a cross-origin POST automatically (comparing the request's `Origin` against `Host`/`x-forwarded-host`) — genuine, working CSRF protection this project already had, just never spelled out in code. `lib/csrf.ts` (new) adds `assertSameOrigin()`, an explicit, independent re-check of the same rule, wired into `assertAdminAndRateLimit()` (so every admin mutation — Jobs, Categories, Companies, Locations, Advertisements, Settings — gets it automatically) and into `signInAction()`/`signOutAction()`. This is deliberate defense-in-depth: the protection is now visible in the code that needs it, not just relying on framework behavior a future refactor could silently lose. `next.config.ts` also now sets `experimental.serverActions.allowedOrigins` from `NEXT_PUBLIC_SITE_URL`, explicitly trusting the configured canonical domain in addition to the automatic Host-header match (useful behind a reverse proxy/CDN where the two can differ) — confirmed from Next's own source that this only *adds* a trusted origin on top of the default check, never replaces it.

### Security headers

`next.config.ts`'s `headers()` (new) applies to every route — public and admin — since `middleware.ts`'s matcher is scoped to `/admin/:path*` and never runs for the public site at all:

- **Content-Security-Policy**: `default-src 'self'`, with the only third-party hosts this app actually loads from allow-listed (Google's ad network for AdSense, `*.supabase.co` for Storage images), `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`. `'unsafe-inline'` on `script-src`/`style-src` is a documented trade-off, not an oversight — AdSense injects its own inline scripts in a way that's incompatible with a nonce/`strict-dynamic` CSP without a much larger rework this sandbox has no way to verify against a real browser (ads only render meaningfully on an approved, live site), and React's inline `style={{...}}` props (used for ad-slot sizing, chart dimensions) are subject to `style-src` the same way. A follow-up phase could move to a nonce-based CSP if AdSense is dropped or Google's guidance changes.
- **X-Frame-Options: DENY** and CSP's `frame-ancestors 'none'` together — this app is never meant to be embedded in another site's iframe, so both layers of clickjacking protection apply (the header for older browsers, the directive for CSP3-aware ones).
- **X-Content-Type-Options: nosniff**, **Referrer-Policy: strict-origin-when-cross-origin**, **Permissions-Policy** (camera/microphone/geolocation/FLoC/Topics all denied — none of which this app uses), and **Strict-Transport-Security** (production only — HSTS on a plain-HTTP local dev server is a no-op at best).

### Rate limiting: extended from admin-only to every public write

`assertAdminAndRateLimit()` already covered every admin Server Action; the seven **public**, unauthenticated Server Actions (job view/click/share tracking, page-view/search tracking, ad impression/click tracking, "Load More" pagination) had none. `lib/rate-limit.ts` gained `getClientIp()` (deduplicating an IP-extraction snippet that `actions/auth.actions.ts` and `lib/admin-action-helpers.ts` each used to repeat) and `isRateLimited(key, limit, windowMs)` — a boolean-returning convenience wrapper, since every one of these public callers wants to fail silently (never surface an error over a dropped analytics beacon) rather than throw. Ceilings are generous — well above any real visitor's browsing behavior (120–180/minute for view-style actions, 30–60/minute for click/pagination-style ones) — purely to blunt a scripted flood inflating analytics or scraping pagination, never to affect a real user. `loadMoreLatestJobsAction` returns an empty array rather than throwing when exceeded, since `LatestJobsSection` already treats a short response as "no more results."

Deliberately **not** rate-limited: the public `/jobs` search page itself (a normal SSR page render, not a discrete API endpoint) and the XML sitemaps/`robots.txt` — both need to stay freely crawlable by search engines, and rate-limiting a page Google's crawler hits repeatedly would directly undermine Phase 14's SEO work. This project also has no `app/api/*` Route Handlers at all (everything is Server Actions + Server Components), so "API routes" rate limiting has nothing else to apply to today.

### File upload hardening: real content verification, not just a declared MIME type

Branding uploads (logo/favicon/OG image — the only upload surface in this app) validated `file.type`, but that's just whatever the client's multipart request *claims*, trivially spoofed by renaming an arbitrary file or crafting the request directly. `lib/file-signature.ts` (new) checks the actual bytes: real PNG/JPEG/WebP magic-byte signatures, or (since SVG has no fixed binary signature) that the content actually parses as XML with an `<svg` root. `uploadBrandingAssetAction` now rejects any file whose content doesn't match its declared type before it ever reaches `sharp` or storage.

Separately, and more seriously: SVG uploads were passed straight through to storage completely unsanitized (rasterizing a vector logo would defeat the point of uploading one, so they'd always bypassed `sharp`). An SVG is XML, and XML can carry a `<script>` tag or an `onload`/`onerror` event handler — a real, if narrow (admin-only, single-trusted-user), stored-XSS vector. `lib/image-optimize.ts` now runs every SVG through `isomorphic-dompurify`'s `svg` profile before storing it — the same sanitizer already used for admin-authored ad HTML, keeping every legitimate vector element/attribute while stripping anything capable of executing script.

### Environment variables: validated once, at startup, not discovered later

`lib/env.ts` (new) defines every environment variable this app reads as a Zod schema and exposes `getServerEnv()`, which throws one aggregated, human-readable error listing every missing/invalid value. `instrumentation.ts` (new) — Next.js's `register()` startup hook, a file convention requiring no config flag as of Next 15 — calls it once when a server instance boots (Node.js runtime only; Edge/middleware never reads these secrets directly), so a misconfigured deploy fails immediately and loudly with a clear list of what's wrong, instead of failing a random admin action an hour later with a cryptic error. `import "server-only"` on the module guarantees it — and the real secret values it reads — can never be pulled into a client bundle; Next.js fails the build outright if a Client Component ever imports it, even transitively.

### Error handling: no raw errors reach the client

Two real leaks were found and fixed: `scheduleJobAction` (`actions/admin-jobs.actions.ts`) forwarded a caught error's raw `.message` straight into the toast shown to the admin, and `uploadBrandingAssetAction` did the same. Both now log the real error server-side via `console.error` and return a generic, user-facing message instead — the same pattern every *other* mutation action in this project already followed (confirmed by grepping every `.message` usage across `actions/`, `services/`, and `lib/`: the remaining ones are all the `assertAdminAndRateLimit()`/`assertSameOrigin()` guard-check pattern, which only ever throws its own hand-authored, safe strings, so forwarding *that* message is intentional and fine). The global `app/error.tsx` boundary already only ever rendered a generic `ErrorState` component, never `error.message` or a stack trace — confirmed unchanged and correct.

### Audit logging: a real trail, with who and when

`ActivityLog` (Phase 12) only recorded five job/advertisement actions and never *who* performed one. This phase:

- Added `ADMIN_LOGIN`, `ADMIN_LOGOUT`, `JOB_CREATED`, and `SETTINGS_UPDATED` to the `ActivityAction` enum (migration `20260712090000_security_hardening_audit_log`) — every action the spec's audit-logging section explicitly names, alongside the `JOB_UPDATED`/`JOB_ARCHIVED`/`JOB_DELETED`/`ADVERTISEMENT_UPDATED` values that already existed.
- Added a nullable `adminEmail` column to `ActivityLog` — nullable so pre-existing rows still read back cleanly, populated on every write going forward.
- `logActivity()` (`services/activity-log.service.ts`) now resolves the acting administrator's email itself by re-reading the current Supabase session, rather than threading an `adminEmail` parameter through every mutating service function's signature — cheap, and every call site is already inside an authenticated admin request by the time it's reached.
- Wired `logActivity("JOB_CREATED", ...)` into `createJob()`, `logActivity("SETTINGS_UPDATED", ...)` into `updateSettingsSection()` (the one function every settings-section save and the branding upload action both funnel through), and `logActivity("ADMIN_LOGIN"/"ADMIN_LOGOUT", ...)` into `signInAction()`/`signOutAction()`.
- The admin Analytics Dashboard's Recent Activity timeline (`components/admin/analytics/recent-activity-timeline.tsx`) gained icons/labels for all four new action types and now shows the acting admin's email inline next to each entry when present.

### Backup & restore

Supabase itself already takes automatic daily backups on every paid plan, with Point-in-Time Recovery (PITR) available on Pro and above — for most operators, restoring through the Supabase dashboard's own backup UI is the right first option and needs no extra tooling from this project. This phase adds the supplementary piece Supabase's own schedule doesn't cover: an on-demand, admin-triggered snapshot you hold yourself.

- `npm run db:backup` (`scripts/db-backup.sh`) — runs `pg_dump` against `DIRECT_URL` in custom format (compressed, selectively restorable), writing a timestamped `.dump` file to a local `backups/` directory (gitignored — a data dump should never be committed).
- `npm run db:restore -- <path-to-backup.dump>` (`scripts/db-restore.sh`) — restores a dump via `pg_restore --clean --if-exists`, with an explicit typed confirmation prompt before touching anything, since this is a destructive operation.

Recommended practice: run `npm run db:backup` before any risky migration or deploy, store the resulting file somewhere durable and encrypted (not just this machine), and periodically *test* a restore against a scratch database — a backup that's never been restored is unverified. Supabase Storage (the `branding` bucket — uploaded logo/favicon/OG image) isn't covered by either script since it isn't in Postgres; those files are also regenerable at any time by re-uploading through `/admin/settings`, and the dynamic `next/og`-based fallbacks (`app/opengraph-image.tsx`, `app/icon.tsx`) mean the site never breaks even if that bucket were lost entirely.

### Accessibility

This phase's changes are almost entirely backend/configuration hardening (cookies, headers, rate limits, validation, logging) with no new interactive UI. The one visible change — the Recent Activity timeline's new icons/labels and inline admin-email display — is presentational only; no focus order, keyboard path, or interactive element changed anywhere in this phase.

### A note on verification in this environment

Same caveat as every prior phase: `prisma generate` can't run in this sandbox, so the new migration (enum values + `admin_email` column) was hand-authored and verified by inspection, with the corresponding Prisma Client type shim updated to match. Both `tsc --noEmit` and `eslint` are clean across the entire project, checked after every change and again as a final full-project pass. The CSP, security headers, and rate limits are all correct by construction and by reading Next.js's own source for the Server Actions origin-check behavior, but — like every phase before this one — haven't been exercised against a real running instance in a browser (no live Supabase/Prisma connection or `next build` available here); once deployed, it's worth confirming the CSP doesn't block anything unexpected via the browser console, running the admin login rate limit against real repeated attempts, and checking Supabase's dashboard directly to confirm the session cookie now shows `HttpOnly` in a real response.

## Phase 17 — Testing, Quality Assurance & Bug Fixes

A comprehensive QA audit across the entire application — public site, admin panel, database queries, SEO, and code quality — reading and reasoning through the actual code paths rather than re-confirming what earlier phases already verified. This phase found and fixed several real, previously-undetected bugs, alongside a code-quality cleanup pass.

### Issues found and fixed

**Scheduled jobs never actually published themselves.** `publishDueScheduledJobs()` has existed since Phase 9 with a doc comment reading "intended to run on a cron" — but nothing in the entire codebase ever called it. A job scheduled for a future publish date would sit in `SCHEDULED` status forever once that date arrived, invisible on the public site (every listing query and `/jobs/[slug]`'s own visibility check only ever recognize the literal `PUBLISHED` status), until an admin happened to notice and manually clicked Publish. Fixed by wiring up the missing piece: `app/api/cron/publish-scheduled-jobs/route.ts` (a `CRON_SECRET`-gated Route Handler) plus `vercel.json`'s `crons` array (every 15 minutes). `publishDueScheduledJobs()` itself was also upgraded to actually log a `JOB_PUBLISHED` activity entry for each job it auto-publishes — previously it did a silent `updateMany` with no audit trail at all, inconsistent with every other publish path in the app.

**Expired jobs still appeared in listings, then 404'd when clicked.** `/jobs/[slug]` already correctly hides a job past its `applicationDeadline` (via its own `isExpired()` check), but none of the *listing* queries — the `/jobs` search/filter page, homepage Featured Jobs and Latest Jobs, Related Jobs, and the Education/Visa Status filter dropdown options — excluded expired-but-still-`PUBLISHED` jobs at all. A visitor could see an expired job's card on the homepage or in search results, click it, and land on a 404 — a real, visible broken-link experience. Only the Phase 14 sitemap query had this exclusion; every other public query was missing it. Fixed with a new shared `notExpiredWhere()` helper (mirroring `ACTIVE_JOB_WHERE`'s existing pattern) applied consistently across every public-facing job query, and the sitemap query was refactored to use the same shared helper instead of its own duplicate inline logic.

**Pagination could show duplicate or skipped jobs across pages.** None of the `ORDER BY` clauses backing `/jobs`' sort options (or the admin Jobs table's) included a unique tiebreaker column. Two jobs tied on the leading sort column — which happens in practice, not just in theory: `bulkPublishJobs()` can give several jobs an identical `publishedAt` second, and two jobs sharing an exact `title` is common for the "A–Z" sort — have no guaranteed stable order between two separate paginated queries. Across a `skip`/`take` page 1 and page 2, Postgres is free to break that tie differently each time, which can surface the same job on both pages or drop one from both. Fixed by appending `{ id: "asc" }` as a final tiebreaker to every branch of both `buildJobOrderBy()` (public) and `buildAdminJobOrderBy()` (admin).

**"Companies" had no navigation link anywhere.** `/companies` is a fully built, working directory page (Phase 7) with its own SEO metadata, sitemap entry, and detail pages — but `constants/nav.ts` never listed it in either the header's main navigation or the footer's Quick Links, even though the structurally-identical Categories and Locations directories both did. There was no way to discover the Companies section by browsing the site at all, only by clicking through a job's company link. Fixed by adding "Companies" to both `mainNav` and `footerNav`.

**A leftover, unused database table with a hardcoded default password.** (Carried over from Phase 16's security pass, confirmed still relevant to this QA phase's "database issues" scope.) `prisma/seed.ts`'s `seedAdmin()` seeded the pre-Supabase-Auth `Admin` table with a bcrypt hash of a known default password, even though nothing in the real authentication flow reads that table. Removed entirely.

### Code quality: removed 17 orphaned files

A systematic cross-reference of every file under `components/` and `hooks/` against the rest of the codebase (checking not just direct `from "..."` imports but `next/dynamic` imports and template-literal references too) found 17 components/hooks with **zero** references anywhere in the project — leftover scaffolding from early phases that was superseded by a different, later implementation of the same idea (e.g., `components/shared/share-button.tsx` was superseded by the richer per-channel `ShareJobCard`; `components/search/category-search.tsx`/`location-search.tsx`/`company-search.tsx` were superseded by `AdvancedSearch`'s own inline configuration of the shared `EntitySearch`; `components/admin/admin-coming-soon.tsx` was Phase 8's placeholder for admin sections that all got real CRUD UIs by Phase 13). Each was individually verified — not just grepped — to confirm it was truly dead rather than a missed wiring bug before removal:

`admin-coming-soon.tsx`, `glass-card.tsx`, `spinner.tsx`, `category-search.tsx`, `location-search.tsx`, `company-search.tsx`, `page-transition.tsx`, `modal-transition.tsx`, `back-button.tsx`, `image-placeholder.tsx`, `bullet-list.tsx`, `share-button.tsx`, `scroll-to-top.tsx`, `success-state.tsx`, `form-radio-group.tsx`, `form-checkbox.tsx`, `use-media-query.ts`.

The now-unused `bcryptjs`/`@types/bcryptjs` dependencies (only ever used by the removed `seedAdmin()`) were also dropped from `package.json`. A full dependency audit found no other unused packages, and a full exported-function audit of `services/` and `lib/` found no other dead exports. No `console.log`/`debugger` statements or commented-out dead code existed anywhere in the application source (the only `console.log` calls are `prisma/seed.ts`'s intentional CLI progress output).

### Areas audited with no defects found

Confirmed correct by direct code inspection: draft/archived jobs are correctly hidden everywhere (both via query-level `status: "PUBLISHED"` filters and the detail page's own redundant check); the four apply-button combinations (website only, email only, both, neither) are handled identically and correctly by both `ApplyButtons` (cards) and `ApplyCard` (detail sidebar), including rendering nothing at all rather than a broken/disabled button when neither is set; every live "search as you type" input is debounced while submit-triggered search forms correctly aren't; every admin mutation across Jobs/Categories/Companies/Locations/Advertisements/Settings consistently applies the shared `assertAdminAndRateLimit()` guard with no typo'd or colliding rate-limit keys; every soft-delete-aware query correctly filters via `ACTIVE_JOB_WHERE`; database foreign keys use `onDelete: Restrict` for Job's Company/Category/Location relations (matching the job-count-guarded hard-delete design) and `onDelete: Cascade` for Job's 1:1 Analytics row; 404 handling is correctly wired on every dynamic detail route and admin edit page; and the Categories/Companies/Locations admin Server Actions are near-perfect structural mirrors of each other with no copy-paste inconsistencies.

### Remaining recommendations

- **Nonce-based CSP.** Phase 16 documented `'unsafe-inline'` on `script-src`/`style-src` as a deliberate trade-off for AdSense compatibility. If AdSense is ever dropped, or Google changes its CSP guidance, revisiting a strict nonce-based policy would be worth it.
- **Dedicated admin `error.tsx`/`not-found.tsx`.** The admin panel currently falls back to the root-level, chrome-less error and 404 pages (Phase 16 noted this for `error.tsx`; the same applies to an unmatched `/admin/*` path). Not a defect — nothing breaks — but a dedicated version matching the sidebar/topbar shell would be a small polish item.
- **Real browser/Lighthouse verification.** As with every prior phase, this sandbox has no way to run `next build`, connect to a live Supabase/Postgres instance, or open a real browser — every fix in this phase was verified by `tsc --noEmit` + `eslint` (both clean) and direct code-path reasoning, not by clicking through a running instance. Before shipping, it's worth an actual click-through of the flows this phase touched (a scheduled job publishing on time via the cron endpoint, an expired job disappearing from listings, the new Companies nav link) plus a real Lighthouse/axe pass.
- **`CRON_SECRET` must be set in the deployment environment.** The new cron route fails closed (401) until `CRON_SECRET` is configured as both a Vercel project env var and in `vercel.json`'s implicit trust of Vercel's own cron invoker — without it, scheduled jobs will silently continue to not auto-publish, exactly as before this fix, just now with a clear path to resolve it.

### A note on verification in this environment

Same caveat as every prior phase: no live database connection or running server exists in this sandbox, so every fix here was verified through `tsc --noEmit` (clean) and `eslint` (clean) plus careful manual tracing of each affected code path — not through actually exercising the running application. The two Prisma Client type-shim additions this phase required (`Job.id` as a valid `orderBy` key, and a `select: { id, title }` `findMany` overload) were added the same way every prior phase's shim extensions were: hand-authored and checked against `tsc`, since `prisma generate` cannot run here.

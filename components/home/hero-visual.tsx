import { Briefcase, CheckCircle2, MapPin, Search as SearchIcon } from "lucide-react";

/**
 * Hand-composed hero illustration — a layered "badge cluster" (glow
 * rings + orbit ring + a central briefcase plate + three orbiting
 * icon chips) built entirely from CSS shapes and Lucide icons, no
 * external image asset. This exists to give the hero a genuine focal
 * visual on desktop instead of empty whitespace next to the headline
 * — the flat, symmetric, text-only hero was the single biggest thing
 * making the page read as a generic template rather than a designed
 * product. Deliberately abstract (briefcase + search + location,
 * not a literal photo/3D render) so it stays honest — nothing here
 * implies a real illustration commissioned for the brand, it's a
 * geometric composition in the brand's own gradient.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block" aria-hidden="true">
      {/* Outer soft glow */}
      <div className="absolute inset-0 rounded-full bg-brand-gradient opacity-20 blur-3xl" />

      {/* Dashed orbit ring */}
      <svg className="absolute inset-0 h-full w-full text-primary/25" viewBox="0 0 400 400" fill="none">
        <circle cx="200" cy="200" r="178" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" />
      </svg>

      {/* Central plate */}
      <div className="absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2.5rem] bg-brand-gradient shadow-soft-xl ring-8 ring-card/80">
        <div className="absolute inset-3 rounded-[2rem] border border-white/25" />
        <Briefcase className="h-20 w-20 text-white" strokeWidth={1.5} />
      </div>

      {/* Orbiting badge — verified */}
      <div className="absolute left-[6%] top-[14%] flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 shadow-soft-lg ring-1 ring-border/60">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-green text-badge-green-foreground">
          <CheckCircle2 className="h-4.5 w-4.5" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-foreground">Verified</p>
          <p className="text-[11px] text-muted-foreground">Official source</p>
        </div>
      </div>

      {/* Orbiting badge — search */}
      <div className="absolute right-[2%] top-[36%] flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft-lg ring-1 ring-border/60">
        <SearchIcon className="h-6 w-6 text-primary" strokeWidth={2} />
      </div>

      {/* Orbiting badge — location */}
      <div className="absolute bottom-[10%] left-[16%] flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 shadow-soft-lg ring-1 ring-border/60">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-orange text-badge-orange-foreground">
          <MapPin className="h-4.5 w-4.5" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-foreground">7 Emirates</p>
          <p className="text-[11px] text-muted-foreground">UAE-wide</p>
        </div>
      </div>

      {/* Small accent dot */}
      <div className="absolute bottom-[4%] right-[18%] h-4 w-4 rounded-full bg-badge-purple ring-4 ring-card" />
    </div>
  );
}

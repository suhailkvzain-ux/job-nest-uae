import { siteConfig } from "@/constants/site";

/** Mimics a Google organic search result so the admin can see how the job's SEO fields will actually render before publishing. */
export function JobSeoPreview({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description: string;
}) {
  const url = `${siteConfig.url}/jobs/${slug || "your-job-slug"}`;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-background p-4">
      <span className="truncate text-sm text-success">{url}</span>
      <span className="truncate text-lg text-[#1a0dab] hover:underline">{title || "Job title preview"}</span>
      <span className="line-clamp-2 text-sm text-muted-foreground">
        {description || "Your meta description will appear here — keep it under 160 characters."}
      </span>
    </div>
  );
}

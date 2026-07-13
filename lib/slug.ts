import { slugify } from "@/utils/format";

/**
 * Given a base slug and a lookup function, returns a slug guaranteed not
 * to collide with an existing row — appending `-2`, `-3`, etc. as needed.
 * Shared by every service that creates a slugged resource (jobs,
 * companies, categories, locations).
 */
export async function ensureUniqueSlug(
  base: string,
  slugExists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = slugify(base);
  let candidate = baseSlug;
  let suffix = 2;

  while (await slugExists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

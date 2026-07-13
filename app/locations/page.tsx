import { MapPinned } from "lucide-react";
import type { Metadata } from "next";

import { LocationCard } from "@/components/cards/location-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { DirectorySearchBar } from "@/components/shared/directory-search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { constructMetadata } from "@/lib/seo";
import { getLocationsWithJobCounts } from "@/services/locations.service";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Browse Jobs by Location",
  description:
    "Explore verified job vacancies across every emirate in the UAE — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain, and Al Ain.",
  path: "/locations",
});

interface LocationsPageProps {
  searchParams: Promise<{ search?: string }>;
}

/**
 * Locations directory — every UAE location (all 7 emirates + Al Ain),
 * regardless of current job count, with a server-rendered, URL-synced
 * name search.
 */
export default async function LocationsPage({ searchParams }: LocationsPageProps) {
  const { search } = await searchParams;
  const locations = await getLocationsWithJobCounts();

  const filtered = search
    ? locations.filter((location) => location.name.toLowerCase().includes(search.toLowerCase()))
    : locations;

  return (
    <Section spacing="default">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Heading level="h1" as="h1">
            Jobs by Location
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
            Browse verified vacancies across every emirate in the UAE.
          </Paragraph>
          <DirectorySearchBar placeholder="Search locations…" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPinned}
            title={search ? `No locations match "${search}"` : "No locations yet"}
            description={search ? "Try a different search term." : "Locations will appear here once added."}
          />
        ) : (
          <Grid cols={{ base: 2, sm: 3, lg: 4 }} gap="md">
            {filtered.map((location) => (
              <LocationCard key={location.id} name={location.name} slug={location.slug} jobCount={location.jobCount} />
            ))}
          </Grid>
        )}
      </Container>
    </Section>
  );
}

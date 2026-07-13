import { LocationCard } from "@/components/cards/location-card";
import { Grid } from "@/components/layout/grid";
import { Heading } from "@/components/typography/heading";
import type { LocationWithJobCount } from "@/services/locations.service";

/** "Related locations" rail on the location detail page — feed it `getRelatedLocations()`. */
export function RelatedLocationsSection({ locations }: { locations: LocationWithJobCount[] }) {
  if (locations.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <Heading level="h4">Related Locations</Heading>
      <Grid cols={{ base: 2, sm: 3, lg: 6 }} gap="md">
        {locations.map((location) => (
          <LocationCard key={location.id} name={location.name} slug={location.slug} jobCount={location.jobCount} />
        ))}
      </Grid>
    </section>
  );
}

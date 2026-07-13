import { MapPinned } from "lucide-react";

import { LocationCard } from "@/components/cards/location-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerItem } from "@/components/motion/motion-wrappers";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import type { LocationWithJobCount } from "@/services/locations.service";

/** Homepage "Browse by Location" grid — the 7 emirates + Al Ain. */
export function LocationGridSection({ locations }: { locations: LocationWithJobCount[] }) {
  return (
    <Section id="locations" aria-labelledby="locations-heading">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Heading level="h2" as="h2" id="locations-heading">
            Browse by Location
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
            Vacancies across every emirate in the UAE.
          </Paragraph>
        </div>

        {locations.length === 0 ? (
          <EmptyState icon={MapPinned} title="No locations yet" description="Locations will appear here once added." />
        ) : (
          <StaggerContainer>
            <Grid cols={{ base: 2, sm: 3, lg: 4 }} gap="md">
              {locations.map((location) => (
                <StaggerItem key={location.id}>
                  <LocationCard name={location.name} slug={location.slug} jobCount={location.jobCount} />
                </StaggerItem>
              ))}
            </Grid>
          </StaggerContainer>
        )}
      </Container>
    </Section>
  );
}

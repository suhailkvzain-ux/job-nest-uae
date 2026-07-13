import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";

/**
 * Reserved, responsive ad slot between the content sections. Renders
 * only the reusable `AdPlaceholder` — no real ad network is wired up
 * here, per scope; swap the inner content for a real ad unit later
 * without touching layout.
 */
export function AdPlaceholderSection() {
  return (
    <Section spacing="compact" aria-label="Advertisement">
      <Container className="flex justify-center">
        <AdPlaceholder size="leaderboard" className="hidden sm:flex" />
        <AdPlaceholder size="banner" className="flex sm:hidden" />
      </Container>
    </Section>
  );
}

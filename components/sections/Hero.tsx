import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { launchCtas, sectionIds, webAppHref } from "@/lib/content";

/**
 * Opening screen. Copy sits at the bottom of the viewport; the space above is
 * left for the 3D logo. Both blocks rise in on first paint (CSS only).
 */
export function Hero() {
  return (
    <Section
      id={sectionIds.top}
      labelledBy="hero-title"
      data-scene-stage
      className="flex min-h-svh flex-col justify-end pb-14"
    >
      <div data-scene-anchor className="flex flex-wrap items-end justify-between gap-8">
        <Text as="h1" id="hero-title" variant="display" className="animate-reveal">
          A second opinion,
          <br />
          always on call.
        </Text>

        <div className="flex max-w-90 animate-reveal-late flex-col gap-5.5 pb-2.5">
          <Text variant="lead" className="text-pretty text-copy">
            NeuraOS is a medical AI assistant for clinicians. Bring it a case — it reasons through
            the differential, cites the evidence, and keeps you current in your field.
          </Text>
          <div className="flex flex-wrap gap-3 pb-1">
            <ButtonLink href={webAppHref} look="accent-md">
              {launchCtas.hero.label}
            </ButtonLink>
            <ButtonLink href={`#${sectionIds.cores}`} look="light-md">
              See how it thinks
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="mt-11 flex flex-wrap justify-between gap-x-4 gap-y-2 text-muted">
        <Text as="span" variant="overline">
          For clinicians — iOS &amp; Android
        </Text>
        <Text as="span" variant="overline">
          Scroll <span aria-hidden="true">↓</span> · Hover the cores
        </Text>
      </div>
    </Section>
  );
}

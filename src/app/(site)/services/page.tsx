import type { Metadata } from 'next';
import { Hero } from '@/components/blocks/Hero';
import { Section } from '@/components/layout/Section';
import { ServiceGrid } from '@/components/blocks/ServiceCard';
import { CtaBand } from '@/components/blocks/CtaBand';
import { DisclaimerBlock } from '@/components/blocks/DisclaimerBlock';
import { Button } from '@/components/ui/Button';
import { getVisibleServices } from '@/lib/content';
import { SERVICES_PAGE } from '@/content/pages';
import { CTA_LABELS } from '@/content/site';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'UK immigration advice across partner, visitor, work, settlement, citizenship, EU Settlement Scheme and business immigration routes.',
};

/**
 * Services index.
 *
 * The list is generated from the content source, so adding a category is a
 * data change rather than a code change (Phase 2). Feature-gated services are
 * filtered out before they reach this page.
 */
export default async function ServicesIndexPage() {
  const services = await getVisibleServices();

  return (
    <>
      <Hero
        eyebrow={SERVICES_PAGE.hero.eyebrow}
        lead={SERVICES_PAGE.hero.lead}
        emphasis={SERVICES_PAGE.hero.emphasis}
        standfirst={SERVICES_PAGE.hero.standfirst}
        actions={
          <>
            <Button href="/book" variant="accent" size="lg">
              {CTA_LABELS.book}
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              {CTA_LABELS.enquire}
            </Button>
          </>
        }
      />

      <Section tone="surface">
        <ServiceGrid services={services} />
        <div className="mt-10">
          <DisclaimerBlock />
        </div>
      </Section>

      <CtaBand
        lead="Not sure which route"
        emphasis="applies to you?"
        body="That is a common position, and it is exactly what a first consultation is for. Tell us your circumstances and we will tell you which routes are worth considering."
      />
    </>
  );
}

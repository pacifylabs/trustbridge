import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { UsersRound } from 'lucide-react';
import { Hero } from '@/components/blocks/Hero';
import { Section } from '@/components/layout/Section';
import { AdviserCard } from '@/components/blocks/AdviserCard';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Button } from '@/components/ui/Button';
import { getAdvisers } from '@/lib/content';
import { TEAM_PAGE } from '@/content/pages';
import { CTA_LABELS } from '@/content/site';

export const metadata: Metadata = buildMetadata({
  title: 'Our team',
  description:
    'Adviser profiles for TrustBridge Immigration Services Ltd, including professional titles and regulatory details.',
  path: '/team',
});

export default async function TeamPage() {
  const advisers = await getAdvisers();

  return (
    <>
      <Hero
        eyebrow={TEAM_PAGE.hero.eyebrow}
        lead={TEAM_PAGE.hero.lead}
        emphasis={TEAM_PAGE.hero.emphasis}
        standfirst={TEAM_PAGE.hero.standfirst}
        actions={
          <Button href="/contact" variant="accent" size="lg">
            {CTA_LABELS.speak}
          </Button>
        }
      />

      <Section tone="surface">
        {advisers.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {advisers.map((adviser) => (
              <AdviserCard key={adviser.slug} adviser={adviser} />
            ))}
          </ul>
        ) : (
          <div
            className="mx-auto flex max-w-2xl flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface-sunken px-6 py-14 text-center"
            data-testid="team-empty-state"
          >
            <span
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink"
              aria-hidden="true"
            >
              <UsersRound className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <h2 className="text-h3 text-strong">{TEAM_PAGE.emptyState.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{TEAM_PAGE.emptyState.body}</p>
            <Button href="/contact" variant="secondary" className="mt-7">
              {CTA_LABELS.contact}
            </Button>
          </div>
        )}
      </Section>

      <CtaBand
        lead="Speak to"
        emphasis="an adviser"
        body="If you would rather talk to someone before reading further, get in touch and we will arrange a consultation."
      />
    </>
  );
}

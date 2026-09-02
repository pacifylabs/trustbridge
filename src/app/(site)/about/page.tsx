import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { Compass } from 'lucide-react';
import Link from 'next/link';
import { Hero } from '@/components/blocks/Hero';
import { ImageCluster } from '@/components/blocks/ImageCluster';
import { StampBadge } from '@/components/ui/StampBadge';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { StatBand } from '@/components/blocks/StatBand';
import { CtaBand } from '@/components/blocks/CtaBand';
import { DisclaimerBlock } from '@/components/blocks/DisclaimerBlock';
import { Card, CardHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ABOUT } from '@/content/pages';
import { CTA_LABELS, SITE } from '@/content/site';

export const metadata: Metadata = buildMetadata({
  title: 'About us',
  description:
    'TrustBridge Immigration Services Ltd advises individuals, families and employers on United Kingdom immigration applications. Registered in England and Wales.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow={ABOUT.hero.eyebrow}
        lead={ABOUT.hero.lead}
        emphasis={ABOUT.hero.emphasis}
        standfirst={ABOUT.hero.standfirst}
        actions={
          <>
            <Button href="/book" variant="accent" size="lg">
              {CTA_LABELS.book}
            </Button>
            <Button href="/services" variant="secondary" size="lg">
              Our services
            </Button>
          </>
        }
        aside={
          <ImageCluster
            images={ABOUT.media}
            badge={
              <StampBadge text="Immigration advice">
                <Compass className="h-6 w-6" aria-hidden="true" />
              </StampBadge>
            }
          />
        }
      />

      <Section tone="surface" labelledBy="about-story">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              id="about-story"
              eyebrow={ABOUT.story.eyebrow}
              lead={ABOUT.story.lead}
              emphasis={ABOUT.story.emphasis}
            />
            <div className="measure mt-6 space-y-4 text-body-lg leading-relaxed text-body">
              {ABOUT.story.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card tone="sunken" className="h-full justify-center">
              <p className="text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">
                Company details
              </p>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-strong">Registered name</dt>
                  <dd className="mt-1 text-muted">{SITE.name}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-strong">Company number</dt>
                  <dd className="mt-1 text-muted">{SITE.companyNumber}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-strong">Registered in</dt>
                  <dd className="mt-1 text-muted">{SITE.incorporatedIn}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-strong">Regulatory information</dt>
                  <dd className="mt-1 text-muted">
                    Published in full on our{' '}
                    <Link
                      href="/legal/regulatory-information"
                      className="font-medium text-link underline underline-offset-2"
                    >
                      regulatory information
                    </Link>{' '}
                    page.
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </Section>

      <Section tone="mist" labelledBy="about-values">
        <SectionHeading
          id="about-values"
          align="centre"
          eyebrow={ABOUT.values.eyebrow}
          lead={ABOUT.values.lead}
          emphasis={ABOUT.values.emphasis}
        />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {ABOUT.values.items.map((value) => (
            <Card as="li" key={value.title}>
              <CardHeading>{value.title}</CardHeading>
              <p className="mt-3 text-sm leading-relaxed text-muted">{value.body}</p>
            </Card>
          ))}
        </ul>
      </Section>

      <Section tone="canvas" size="sm">
        <StatBand />
      </Section>

      <Section tone="surface" labelledBy="about-team">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              id="about-team"
              eyebrow={ABOUT.team.eyebrow}
              lead={ABOUT.team.lead}
              emphasis={ABOUT.team.emphasis}
              standfirst={ABOUT.team.standfirst}
            />
            <Button href="/team" variant="secondary" className="mt-8">
              Meet the team
            </Button>
          </div>
          <div className="lg:col-span-5">
            <DisclaimerBlock />
          </div>
        </div>
      </Section>

      <CtaBand
        lead="Ready to talk through"
        emphasis="your circumstances?"
        body="A first consultation gives you an honest view of the routes open to you and what each would involve."
      />
    </>
  );
}

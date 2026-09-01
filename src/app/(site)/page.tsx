import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { Hero } from '@/components/blocks/Hero';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { Reveal } from '@/components/layout/Reveal';
import { StatBand } from '@/components/blocks/StatBand';
import { ServiceGrid } from '@/components/blocks/ServiceCard';
import { ArticleGrid } from '@/components/blocks/ArticleCard';
import { ProcessSteps } from '@/components/blocks/ProcessSteps';
import { ImageCluster } from '@/components/blocks/ImageCluster';
import { CredentialCard } from '@/components/blocks/CredentialCard';
import { RibbonBand } from '@/components/blocks/RibbonBand';
import { StampBadge } from '@/components/ui/StampBadge';
import { CtaBand } from '@/components/blocks/CtaBand';
import { DisclaimerBlock } from '@/components/blocks/DisclaimerBlock';
import { Card, CardHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getArticles, getStats, getVisibleServices } from '@/lib/content';
import { CTA_LABELS } from '@/content/site';
import { HOME } from '@/content/pages';

export default async function HomePage() {
  const [services, articles, stats] = await Promise.all([
    getVisibleServices(),
    getArticles(),
    getStats(),
  ]);
  const featuredArticles = articles.slice(0, 3);

  return (
    <>
      <Hero
        variant="landing"
        backdrop={HOME.heroBackdrop}
        eyebrow={HOME.hero.eyebrow}
        lead={HOME.hero.lead}
        emphasis={HOME.hero.emphasis}
        standfirst={HOME.hero.standfirst}
        actions={
          <>
            <Button href="/book" variant="accent" size="lg">
              {CTA_LABELS.book}
            </Button>
            <Button href="/services" variant="inverse" size="lg">
              See how we can help
            </Button>
          </>
        }
        footnote={
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            <span className="font-medium text-on-photo">Popular routes:</span>
            {services.slice(0, 4).map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group inline-flex items-center gap-1 rounded-md border border-white/25 bg-white/10 px-3 py-1.5 font-medium text-on-photo backdrop-blur-sm transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-accent hover:bg-white/20"
              >
                {service.shortTitle}
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        }
        aside={
          <ImageCluster
            images={HOME.heroMedia}
            className="lg:pl-4"
            overlay={<CredentialCard {...HOME.credential} className="w-full" />}
            badge={
              <StampBadge text="Immigration advice">
                <Compass className="h-6 w-6" aria-hidden="true" />
              </StampBadge>
            }
          />
        }
      />

      <Section tone="canvas" size="none" className="relative z-10 pt-10 pb-12 lg:pt-10 lg:pb-20">
        <StatBand items={stats} />
      </Section>

      <RibbonBand items={HOME.ribbon} className="my-2 sm:my-4" />

      <Section tone="surface" labelledBy="home-services">
        <SectionHeading
          id="home-services"
          eyebrow={HOME.services.eyebrow}
          lead={HOME.services.lead}
          emphasis={HOME.services.emphasis}
          standfirst={HOME.services.standfirst}
        />
        <Reveal className="mt-10">
          <ServiceGrid services={services} featureFirst />
        </Reveal>
        <div className="mt-10">
          <DisclaimerBlock />
        </div>
      </Section>

      <Section tone="mist" labelledBy="home-approach">
        <SectionHeading
          id="home-approach"
          align="centre"
          eyebrow={HOME.approach.eyebrow}
          lead={HOME.approach.lead}
          emphasis={HOME.approach.emphasis}
          standfirst={HOME.approach.standfirst}
        />
        <Reveal className="mt-10">
          <ProcessSteps steps={HOME.approach.steps} />
        </Reveal>
      </Section>

      <Section tone="canvas" labelledBy="home-reasons">
        <SectionHeading
          id="home-reasons"
          eyebrow={HOME.reasons.eyebrow}
          lead={HOME.reasons.lead}
          emphasis={HOME.reasons.emphasis}
          standfirst={HOME.reasons.standfirst}
        />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HOME.reasons.items.map((item) => (
            <Card as="li" key={item.title}>
              <CardHeading>{item.title}</CardHeading>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </ul>
      </Section>

      {featuredArticles.length > 0 ? (
        <Section tone="surface" labelledBy="home-resources">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              id="home-resources"
              eyebrow={HOME.resources.eyebrow}
              lead={HOME.resources.lead}
              emphasis={HOME.resources.emphasis}
              standfirst={HOME.resources.standfirst}
            />
            <Button href="/resources" variant="secondary" className="shrink-0">
              All resources
            </Button>
          </div>
          <Reveal className="mt-10">
            <ArticleGrid articles={featuredArticles} />
          </Reveal>
        </Section>
      ) : null}

      <CtaBand />
    </>
  );
}

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
import { TestimonialSlider } from '@/components/blocks/TestimonialSlider';
import { StampBadge } from '@/components/ui/StampBadge';
import { CtaBand } from '@/components/blocks/CtaBand';
import { DisclaimerBlock } from '@/components/blocks/DisclaimerBlock';
import { Card, CardHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getArticles, getStats, getVisibleServices } from '@/lib/content';
import { CTA_LABELS } from '@/content/site';
import { DEV_TESTIMONIAL_SEEDS, HOME } from '@/content/pages';

export default async function HomePage() {
  const [services, articles, stats] = await Promise.all([
    getVisibleServices(),
    getArticles(),
    getStats(),
  ]);
  const featuredArticles = articles.slice(0, 3);

  // No real testimonials yet (see HOME.testimonials). The dev seeds are
  // gated on NODE_ENV, the same way DEV_ADVISER_SEEDS is, so they can never
  // reach staging or production.
  const testimonials =
    HOME.testimonials.items.length === 0 && process.env.NODE_ENV === 'development'
      ? DEV_TESTIMONIAL_SEEDS
      : HOME.testimonials.items;

  return (
    <>
      <Hero
        variant="landing"
        eyebrow={HOME.hero.eyebrow}
        lead={HOME.hero.lead}
        emphasis={HOME.hero.emphasis}
        standfirst={HOME.hero.standfirst}
        actions={
          <>
            <Button href="/book" variant="accent" size="lg">
              {CTA_LABELS.book}
            </Button>
            <Button href="/services" variant="secondary" size="lg">
              See how we can help
            </Button>
          </>
        }
        footnote={
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            <span className="font-medium text-strong">Popular routes:</span>
            {services.slice(0, 4).map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group inline-flex items-center gap-1 rounded-md border border-border-subtle bg-surface px-3 py-1.5 font-medium text-body transition-[color,border-color,transform] hover:-translate-y-0.5 hover:border-accent hover:text-accent-ink"
              >
                {service.shortTitle}
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-accent-ink transition-transform group-hover:translate-x-0.5"
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
          <ServiceGrid services={services} />
        </Reveal>
        <div className="mt-10">
          <DisclaimerBlock />
        </div>
      </Section>

      <Section tone="surface" labelledBy="home-approach">
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
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOME.reasons.items.map((item) => (
            <Card as="li" key={item.title}>
              <CardHeading>{item.title}</CardHeading>
              <p className="mt-3 text-body leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </ul>
      </Section>

      {testimonials.length > 0 ? (
        <Section tone="surface" labelledBy="home-testimonials">
          <SectionHeading
            id="home-testimonials"
            eyebrow={HOME.testimonials.eyebrow}
            lead={HOME.testimonials.lead}
            emphasis={HOME.testimonials.emphasis}
            standfirst={HOME.testimonials.standfirst}
          />
          <Reveal className="mt-10">
            <TestimonialSlider items={testimonials} />
          </Reveal>
        </Section>
      ) : null}

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

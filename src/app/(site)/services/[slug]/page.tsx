import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Hero } from '@/components/blocks/Hero';
import { BreadcrumbSchema, ServiceSchema } from '@/components/seo/StructuredData';
import { buildMetadata } from '@/lib/seo';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { FeatureList } from '@/components/blocks/FeatureList';
import { FaqList } from '@/components/blocks/FaqList';
import { CtaBand } from '@/components/blocks/CtaBand';
import { DisclaimerBlock } from '@/components/blocks/DisclaimerBlock';
import { ServiceGrid } from '@/components/blocks/ServiceCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getVisibleSections, getVisibleServiceBySlug, getVisibleServices } from '@/lib/content';
import { CTA_LABELS } from '@/content/site';

/**
 * The single service page template (Phase 2).
 *
 * Every route renders through this one component, so adding a service means
 * adding content rather than building a page. A feature-gated service resolves
 * to null and falls through to notFound(), which is what keeps an unauthorised
 * service genuinely unpublished rather than merely unlinked.
 */

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const services = await getVisibleServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getVisibleServiceBySlug(slug);

  if (!service) return { title: 'Not found' };

  return buildMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
    // The route's own photograph makes a more useful share card than the site
    // one, because the link is to a specific service.
    image: { src: `/og/${service.slug}.jpg`, alt: service.image?.alt ?? service.title },
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getVisibleServiceBySlug(slug);

  if (!service) notFound();

  const sections = await getVisibleSections(service);
  const allServices = await getVisibleServices();
  const related = allServices.filter((entry) => entry.slug !== service.slug).slice(0, 3);

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-border-subtle bg-canvas">
        <div className="container-site py-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-accent-ink">
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li>
              <Link href="/services" className="transition-colors hover:text-accent-ink">
                Services
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li aria-current="page" className="font-medium text-strong">
              {service.shortTitle}
            </li>
          </ol>
        </div>
      </nav>

      <ServiceSchema service={service} faqs={service.faqs} />
      <BreadcrumbSchema
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.shortTitle, path: `/services/${service.slug}` },
        ]}
      />

      <Hero
        eyebrow="Service"
        lead={service.title}
        standfirst={service.summary}
        actions={
          <>
            <Button href="/book" variant="accent" size="lg">
              {CTA_LABELS.book}
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              {CTA_LABELS.speak}
            </Button>
          </>
        }
        aside={
          service.image ? (
            /*
              From `lg` the image fills its column instead of carrying its own
              ratio, so it finishes level with the copy beside it. The floor is
              deliberately below a typical copy height: a larger one would set
              the row height itself and the image would again be the taller of
              the two.
            */
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border-subtle shadow-lg lg:aspect-auto lg:h-full lg:min-h-[13rem]">
              <Image
                src={service.image.src}
                alt={service.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 92vw"
                className="object-cover"
              />
            </div>
          ) : undefined
        }
      />

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="measure space-y-4 text-body-lg leading-relaxed text-body">
              {service.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12 space-y-10">
              {sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-h2 text-strong">{section.heading}</h2>
                  <div className="measure mt-4 space-y-4 leading-relaxed text-muted">
                    {section.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DisclaimerBlock className="mt-12" />
          </div>

          <aside className="lg:col-span-5">
            <div className="flex flex-col gap-5 lg:sticky lg:top-28">
              <Card>
                <h2 className="text-h3 text-strong">Who this is for</h2>
                <FeatureList items={service.audience} columns={1} className="mt-5" />
              </Card>

              <Card tone="sunken">
                <h2 className="text-h3 text-strong">What working with us includes</h2>
                <FeatureList items={service.includes} columns={1} className="mt-5" />
              </Card>
            </div>
          </aside>
        </div>

      </Section>

      {service.faqs.length > 0 ? (
        <Section tone="mist" labelledBy={`faqs-${service.slug}`}>
          <SectionHeading
            id={`faqs-${service.slug}`}
            align="centre"
            eyebrow="Common questions"
            lead="Questions we are"
            emphasis="asked most often"
            standfirst="General information only. Advice on your circumstances needs a proper look at your case."
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <FaqList faqs={service.faqs} />
          </div>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section tone="canvas" labelledBy={`related-${service.slug}`}>
          <SectionHeading
            id={`related-${service.slug}`}
            eyebrow="Other services"
            lead="You may also"
            emphasis="need advice on"
          />
          <div className="mt-10">
            <ServiceGrid services={related} />
          </div>
        </Section>
      ) : null}

      <CtaBand />
    </>
  );
}

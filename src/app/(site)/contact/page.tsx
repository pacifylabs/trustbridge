import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { Clock, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import { Hero } from '@/components/blocks/Hero';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { EnquiryForm } from '@/components/blocks/EnquiryForm';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SITE } from '@/content/site';
import { CONTACT_PAGE } from '@/content/pages';
import { getContact } from '@/lib/content';
import { env } from '@/lib/env';

export const metadata: Metadata = buildMetadata({
  title: 'Contact us',
  description:
    'Contact TrustBridge Immigration Services Ltd by email, telephone or enquiry form to discuss your immigration matter.',
  path: '/contact',
});

export default async function ContactPage() {
  const contact = await getContact();
  // The first line is typically the company name — searching Google Maps by
  // name risks matching a similarly-named, unrelated business near the same
  // address instead of this office, so the map query uses the street address
  // only (the lines after the name).
  const streetAddress = (
    contact.addressLines.length > 1 ? contact.addressLines.slice(1) : contact.addressLines
  ).join(', ');
  const mapsEmbedSrc = streetAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(streetAddress)}&output=embed`
    : null;
  const directionsHref = streetAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(streetAddress)}`
    : null;

  return (
    <>
      <Hero
        eyebrow={CONTACT_PAGE.hero.eyebrow}
        lead={CONTACT_PAGE.hero.lead}
        emphasis={CONTACT_PAGE.hero.emphasis}
        standfirst={CONTACT_PAGE.hero.standfirst}
      />

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-5 lg:sticky lg:top-28">
              <Card>
                <h2 className="text-h3 text-strong">Get in touch</h2>
                <ul className="mt-6 space-y-5">
                  <li className="flex gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink"
                      aria-hidden="true"
                    >
                      <Mail className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-strong">Email</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="mt-0.5 block text-sm break-words text-link underline underline-offset-2"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink"
                      aria-hidden="true"
                    >
                      <Phone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-strong">Telephone</p>
                      <a
                        href={`tel:${contact.phoneHref}`}
                        className="mt-0.5 block text-sm text-link underline underline-offset-2"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-muted"
                      aria-hidden="true"
                    >
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-strong">Registered office</p>
                      {contact.addressLines.length > 0 ? (
                        <address className="mt-0.5 text-sm not-italic text-muted">
                          {contact.addressLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </address>
                      ) : (
                        <p className="mt-0.5 text-sm text-muted" data-testid="address-placeholder">
                          {SITE.name} is registered in{' '}
                          {SITE.incorporatedIn}, company number {SITE.companyNumber}.
                        </p>
                      )}
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-muted"
                      aria-hidden="true"
                    >
                      <Clock className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-strong">Office hours</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {contact.hours || 'Please call or email and we will come back to you.'}
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>

              <Card tone="sunken">
                <h2 className="text-h3 text-strong">
                  {CONTACT_PAGE.whatHappensNext.heading}
                </h2>
                <ol className="mt-5 space-y-4">
                  {CONTACT_PAGE.whatHappensNext.steps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-serif text-sm font-semibold text-accent-ink"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-body">{step}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 border-t border-border-subtle pt-5 text-sm leading-relaxed text-muted">
                  {CONTACT_PAGE.whatHappensNext.note}
                </p>
              </Card>

            </div>
          </div>

          <div className="lg:col-span-7">
            <SectionHeading
              lead={CONTACT_PAGE.formHeading.lead}
              emphasis={CONTACT_PAGE.formHeading.emphasis}
              standfirst={CONTACT_PAGE.formHeading.standfirst}
            />
            <EnquiryForm className="mt-8" recaptchaSiteKey={env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} />
          </div>
        </div>
      </Section>

      {mapsEmbedSrc && directionsHref ? (
        <Section tone="canvas" size="sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading lead="Find our" emphasis="office" />
            <Button href={directionsHref} variant="secondary" target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Get directions
            </Button>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-border-subtle">
            <iframe
              title={`Map showing the location of ${SITE.name}`}
              src={mapsEmbedSrc}
              className="h-[360px] w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Section>
      ) : null}

      <CtaBand
        lead="Would you rather"
        emphasis="speak to someone?"
        body="Call us and we will arrange a consultation at a time that suits you."
        primaryLabel="Book a consultation"
        secondaryLabel="See our services"
        secondaryHref="/services"
      />
    </>
  );
}

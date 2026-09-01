import type { Metadata } from 'next';
import { CalendarClock, Mail, Phone } from 'lucide-react';
import { Hero } from '@/components/blocks/Hero';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { ProcessSteps } from '@/components/blocks/ProcessSteps';
import { DisclaimerBlock } from '@/components/blocks/DisclaimerBlock';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CONTACT } from '@/content/site';
import { BOOK_PAGE, HOME } from '@/content/pages';

export const metadata: Metadata = {
  title: 'Book a consultation',
  description:
    'Arrange a consultation with a TrustBridge immigration adviser by email or telephone. Online booking opens when the site goes live.',
};

/**
 * Booking page.
 *
 * The booking integration is Phase 4 and the tool has not been chosen yet
 * (Cal.com or Calendly, PRD open decision 2). No calendar is embedded and none
 * is mocked up, because a booking widget that cannot take a booking would be
 * worse than an honest explanation of how to arrange one.
 */
export default function BookPage() {
  return (
    <>
      <Hero
        eyebrow={BOOK_PAGE.hero.eyebrow}
        lead={BOOK_PAGE.hero.lead}
        emphasis={BOOK_PAGE.hero.emphasis}
        standfirst={BOOK_PAGE.hero.standfirst}
      />

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Card
              tone="sunken"
              className="items-start border-dashed"
              data-testid="booking-placeholder"
            >
              <span
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-ink"
                aria-hidden="true"
              >
                <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h2 className="text-h3 text-strong">Online booking opens at launch</h2>
              <p className="measure mt-3 text-sm leading-relaxed text-muted">
                We are setting up online scheduling so you can pick a time directly. Until it is
                live, email or call us and we will find a slot that works for you, usually within a
                day or two of hearing from you.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href={`mailto:${CONTACT.email}`} variant="accent">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Email us
                </Button>
                <Button href={`tel:${CONTACT.phoneHref}`} variant="secondary">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {CONTACT.phone}
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card>
              <h2 className="text-h3 text-strong">What to have ready</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
                <li>Your passport, and any previous UK visas or residence permits</li>
                <li>Any correspondence you have had from the Home Office</li>
                <li>Refusal notices, if you have applied before</li>
                <li>A rough timeline of your time in and out of the UK</li>
              </ul>
              <p className="mt-6 border-t border-border-subtle pt-5 text-sm leading-relaxed text-muted">
                Please do not send documents until we have asked for them. We will tell you what we
                need and how to send it securely.
              </p>
            </Card>
          </div>
        </div>

        <div className="mt-10">
          <DisclaimerBlock />
        </div>
      </Section>

      <Section tone="mist" labelledBy="book-process">
        <SectionHeading
          id="book-process"
          align="centre"
          eyebrow={HOME.approach.eyebrow}
          lead={HOME.approach.lead}
          emphasis={HOME.approach.emphasis}
          standfirst={HOME.approach.standfirst}
        />
        <div className="mt-10">
          <ProcessSteps steps={HOME.approach.steps} />
        </div>
      </Section>

      <CtaBand
        lead="Prefer to write"
        emphasis="it down first?"
        body="Send us a summary through the enquiry form and we will come back to you with next steps."
        primaryLabel="Make an enquiry"
        primaryHref="/contact"
        secondaryLabel="See our services"
        secondaryHref="/services"
      />
    </>
  );
}

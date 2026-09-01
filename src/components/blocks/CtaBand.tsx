import { Button } from '@/components/ui/Button';
import { TwoToneHeading } from '@/components/ui/TwoToneHeading';
import { CONTACT, CTA_LABELS } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The navy CTA band (design system §4).
 *
 * Reusable, appearing once per page towards the foot. The labels come from the
 * approved set in PRD §6.5 and the tone stays measured: an invitation to talk,
 * never a promise about what talking will achieve.
 */
export interface CtaBandProps {
  readonly lead?: string;
  readonly emphasis?: string;
  readonly body?: string;
  readonly primaryLabel?: string;
  readonly primaryHref?: string;
  readonly secondaryLabel?: string;
  readonly secondaryHref?: string;
  readonly className?: string;
}

export function CtaBand({
  lead = 'Talk it through with',
  emphasis = 'an adviser',
  body = 'A first consultation gives you a clear view of the routes open to you and what each one would involve. You are under no obligation to go further.',
  primaryLabel = CTA_LABELS.book,
  primaryHref = '/book',
  secondaryLabel = CTA_LABELS.enquire,
  secondaryHref = '/contact',
  className,
}: CtaBandProps) {
  return (
    <section
      className={cn('relative isolate overflow-hidden bg-surface-inverse', className)}
      data-testid="cta-band"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-mist absolute inset-0 opacity-[0.08]" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container-site section-y">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <TwoToneHeading
              as="h2"
              size="h2"
              lead={lead}
              emphasis={emphasis}
              className="text-inverse"
            />
            <p className="measure mt-4 text-body-lg text-inverse-muted">{body}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col lg:items-stretch">
            <Button href={primaryHref} variant="accent" size="lg" className="sm:flex-1 lg:flex-none">
              {primaryLabel}
            </Button>
            <Button
              href={secondaryHref}
              variant="inverse"
              size="lg"
              className="sm:flex-1 lg:flex-none"
            >
              {secondaryLabel}
            </Button>
            <p className="text-sm text-inverse-muted lg:mt-1">
              Or call{' '}
              <a href={`tel:${CONTACT.phoneHref}`} className="font-semibold text-accent">
                {CONTACT.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

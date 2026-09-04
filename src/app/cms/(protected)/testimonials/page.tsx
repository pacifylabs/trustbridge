import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { isCmsConfigured } from '@/lib/env';
import { listAllTestimonials } from '@/lib/cms/testimonials';
import { Button } from '@/components/ui/Button';
import { TestimonialsList } from '@/components/cms/TestimonialsList';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Testimonials' };

export default async function CmsTestimonialsPage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner title="Testimonials aren't ready yet" />;
  }

  const testimonials = await listAllTestimonials();

  return (
    <div>
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-accent/40 bg-accent-soft p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
        <p className="text-small leading-relaxed text-strong">
          Never publish a quote that states or implies an application&apos;s outcome, and never use a
          client&apos;s full name — use a role and location instead.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-strong">Testimonials</h1>
        <Button href="/cms/testimonials/new" variant="accent">
          New testimonial
        </Button>
      </div>

      <div className="mt-8">
        <TestimonialsList testimonials={testimonials} />
      </div>
    </div>
  );
}

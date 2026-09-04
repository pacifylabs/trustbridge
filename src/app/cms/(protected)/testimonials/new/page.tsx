import type { Metadata } from 'next';
import { isCmsConfigured } from '@/lib/env';
import { TestimonialForm } from '@/components/cms/TestimonialForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'New testimonial' };

export default function NewTestimonialPage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">New testimonial</h1>
      <TestimonialForm mode="create" />
    </div>
  );
}

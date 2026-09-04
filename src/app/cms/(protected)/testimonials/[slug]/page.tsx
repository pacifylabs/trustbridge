import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isCmsConfigured } from '@/lib/env';
import { getTestimonialForAdmin } from '@/lib/cms/testimonials';
import { TestimonialForm } from '@/components/cms/TestimonialForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Edit testimonial' };

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  const { slug } = await params;
  const testimonial = await getTestimonialForAdmin(slug);
  if (!testimonial) notFound();

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">Edit testimonial</h1>
      <TestimonialForm mode="edit" testimonial={testimonial} />
    </div>
  );
}

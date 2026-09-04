import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isCmsConfigured } from '@/lib/env';
import { getServiceForAdmin } from '@/lib/cms/services';
import { ServiceForm } from '@/components/cms/ServiceForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Edit service' };

export default async function EditServicePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  const { slug } = await params;
  const service = await getServiceForAdmin(slug);
  if (!service) notFound();

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">Edit service</h1>
      <ServiceForm mode="edit" service={service} />
    </div>
  );
}

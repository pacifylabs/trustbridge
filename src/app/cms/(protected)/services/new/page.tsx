import type { Metadata } from 'next';
import { isCmsConfigured } from '@/lib/env';
import { ServiceForm } from '@/components/cms/ServiceForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'New service' };

export default function NewServicePage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">New service</h1>
      <ServiceForm mode="create" />
    </div>
  );
}

import type { Metadata } from 'next';
import { isCmsConfigured } from '@/lib/env';
import { listAllServices } from '@/lib/cms/services';
import { Button } from '@/components/ui/Button';
import { ServicesList } from '@/components/cms/ServicesList';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Services' };

export default async function CmsServicesPage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner title="Services aren't ready yet" />;
  }

  const services = await listAllServices();
  const sorted = [...services].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-strong">Services</h1>
        <Button href="/cms/services/new" variant="accent">
          New service
        </Button>
      </div>

      <div className="mt-8">
        <ServicesList services={sorted} />
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { isCmsConfigured } from '@/lib/env';
import { AdviserForm } from '@/components/cms/AdviserForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'New adviser' };

export default function NewAdviserPage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">New adviser</h1>
      <AdviserForm mode="create" />
    </div>
  );
}

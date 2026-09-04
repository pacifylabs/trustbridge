import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isCmsConfigured } from '@/lib/env';
import { getAdviserForAdmin } from '@/lib/cms/advisers';
import { AdviserForm } from '@/components/cms/AdviserForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Edit adviser' };

export default async function EditAdviserPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  const { slug } = await params;
  const adviser = await getAdviserForAdmin(slug);
  if (!adviser) notFound();

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">Edit adviser</h1>
      <AdviserForm mode="edit" adviser={adviser} />
    </div>
  );
}

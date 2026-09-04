import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isCmsConfigured } from '@/lib/env';
import { getLegalPageForAdmin } from '@/lib/cms/legal';
import { LegalPageForm } from '@/components/cms/LegalPageForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Edit legal page' };

export default async function EditLegalPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  const { slug } = await params;
  const page = await getLegalPageForAdmin(slug);
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">{page.title}</h1>
      <LegalPageForm slug={slug} initial={page} />
    </div>
  );
}

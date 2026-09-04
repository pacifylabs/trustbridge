import type { Metadata } from 'next';
import { isCmsConfigured } from '@/lib/env';
import { ArticleForm } from '@/components/cms/ArticleForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'New article' };

export default function NewArticlePage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">New article</h1>
      <ArticleForm mode="create" />
    </div>
  );
}

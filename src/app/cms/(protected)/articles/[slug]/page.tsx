import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isCmsConfigured } from '@/lib/env';
import { getArticleForAdmin } from '@/lib/cms/articles';
import { ArticleForm } from '@/components/cms/ArticleForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Edit article' };

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner />;
  }

  const { slug } = await params;
  const article = await getArticleForAdmin(slug);
  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-h2 text-strong">Edit article</h1>
      <ArticleForm mode="edit" article={article} />
    </div>
  );
}

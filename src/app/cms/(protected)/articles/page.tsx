import type { Metadata } from 'next';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { isCmsConfigured } from '@/lib/env';
import { isResourcesLiveFromCms } from '@/lib/cms/settings';
import { listAllArticles } from '@/lib/cms/articles';
import { Button } from '@/components/ui/Button';
import { ArticlesList } from '@/components/cms/ArticlesList';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Articles' };

export default async function AdminArticlesPage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner title="Articles aren't ready yet" />;
  }

  const articles = await listAllArticles();
  const live = await isResourcesLiveFromCms();

  return (
    <div>
      {!live ? (
        <div
          className="mb-6 flex items-start gap-3 rounded-lg border border-accent/40 bg-accent-soft p-4"
          data-testid="demo-mode-banner"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
          <p className="text-small leading-relaxed text-strong">
            The public Resources page is showing <strong>demo content</strong>, not what&apos;s
            listed below. Switch the article source to Live in{' '}
            <Link href="/cms/settings" className="font-medium underline underline-offset-2">
              Settings
            </Link>{' '}
            when ready to go live with these articles.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-strong">Articles</h1>
        <Button href="/cms/articles/new" variant="accent">
          New article
        </Button>
      </div>

      <div className="mt-8">
        <ArticlesList articles={articles} />
      </div>
    </div>
  );
}

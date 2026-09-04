'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/cms/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import type { Article } from '@/lib/content/types';

export function ArticlesList({ articles }: { articles: readonly Article[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');

  async function onDelete(slug: string, title: string) {
    if (!(await confirm({ message: `Delete "${title}"? This cannot be undone.`, tone: 'danger', confirmLabel: 'Delete' })))
      return;

    setPendingSlug(slug);
    setError('');
    try {
      const response = await fetch(`/api/cms/articles/${slug}`, { method: 'DELETE' });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        setError(result.message ?? 'Could not delete the article.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setPendingSlug(null);
    }
  }

  async function onSeed() {
    setSeeding(true);
    setError('');
    try {
      const response = await fetch('/api/cms/seed', { method: 'POST' });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        setError(result.message ?? 'Could not import the starter content.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSeeding(false);
    }
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <FileText className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 className="text-h3 text-strong">No articles yet</h2>
        <p className="mt-2 max-w-md text-small leading-relaxed text-muted">
          Write your first article, or start from the three sample pieces bundled with the site.
        </p>
        <div className="mt-6 flex gap-3">
          <Button href="/cms/articles/new" variant="accent">
            New article
          </Button>
          <Button variant="secondary" onClick={onSeed} disabled={seeding}>
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Import starter content
          </Button>
        </div>
        {error ? <p className="mt-4 text-small font-medium text-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div>
      {error ? <p className="mb-4 text-small font-medium text-error">{error}</p> : null}
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <table className="w-full text-left text-small">
          <thead className="border-b border-border-subtle bg-surface-sunken text-micro font-semibold tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {articles.map((article) => (
              <tr key={article.slug}>
                <td className="px-4 py-3 font-medium text-strong">{article.title}</td>
                <td className="px-4 py-3 text-muted">{article.category}</td>
                <td className="px-4 py-3">
                  <Badge tone={article.status === 'published' ? 'accent' : 'neutral'}>
                    {article.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(article.publishedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/cms/articles/${article.slug}`}
                      className="text-link hover:text-link-hover"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-error hover:opacity-80 disabled:opacity-50"
                      onClick={() => onDelete(article.slug, article.title)}
                      disabled={pendingSlug === article.slug}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

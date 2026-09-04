'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Adviser } from '@/lib/content/types';

export function AdvisersList({ advisers }: { advisers: readonly Adviser[] }) {
  const router = useRouter();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function onDelete(slug: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setPendingSlug(slug);
    setError('');
    try {
      const response = await fetch(`/api/cms/advisers/${slug}`, { method: 'DELETE' });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        setError(result.message ?? 'Could not delete the adviser.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setPendingSlug(null);
    }
  }

  if (advisers.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <Users className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 className="text-h3 text-strong">No advisers yet</h2>
        <p className="mt-2 max-w-md text-small leading-relaxed text-muted">
          Add a profile once the practice has confirmed the adviser&apos;s title, regulatory level
          and registration number.
        </p>
        <Button href="/cms/team/new" variant="accent" className="mt-6">
          New adviser
        </Button>
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {advisers.map((adviser) => (
              <tr key={adviser.slug}>
                <td className="px-4 py-3 font-medium text-strong">{adviser.name}</td>
                <td className="px-4 py-3 text-muted">{adviser.professionalTitle}</td>
                <td className="px-4 py-3">
                  <Badge tone={adviser.status === 'published' ? 'accent' : 'neutral'}>
                    {adviser.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/cms/team/${adviser.slug}`} className="text-link hover:text-link-hover">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-error hover:opacity-80 disabled:opacity-50"
                      onClick={() => onDelete(adviser.slug, adviser.name)}
                      disabled={pendingSlug === adviser.slug}
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

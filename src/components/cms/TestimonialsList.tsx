'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquareQuote, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Testimonial } from '@/lib/content/types';

export function TestimonialsList({ testimonials }: { testimonials: readonly Testimonial[] }) {
  const router = useRouter();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');

  async function onDelete(slug: string) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;

    setPendingSlug(slug);
    setError('');
    try {
      const response = await fetch(`/api/cms/testimonials/${slug}`, { method: 'DELETE' });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        setError(result.message ?? 'Could not delete the testimonial.');
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
      const response = await fetch('/api/cms/testimonials/seed', { method: 'POST' });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        setError(result.message ?? 'Could not load the starter testimonials.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSeeding(false);
    }
  }

  if (testimonials.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <MessageSquareQuote className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 className="text-h3 text-strong">No testimonials yet</h2>
        <p className="mt-2 max-w-md text-small leading-relaxed text-muted">
          Start with three example quotes you can rewrite with your own clients&apos; words, or
          write your own from scratch.
        </p>
        <div className="mt-6 flex gap-3">
          <Button href="/cms/testimonials/new" variant="accent">
            New testimonial
          </Button>
          <Button variant="secondary" onClick={onSeed} disabled={seeding}>
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Load starter testimonials
          </Button>
        </div>
        {error ? <p className="mt-4 text-small font-medium text-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div>
      {error ? <p className="mb-4 text-small font-medium text-error">{error}</p> : null}
      <div className="flex flex-col gap-4">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.slug}
            className="rounded-xl border border-border-subtle bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <Badge tone={testimonial.status === 'published' ? 'accent' : 'neutral'}>
                {testimonial.status}
              </Badge>
              <div className="flex shrink-0 gap-3 text-small">
                <Link
                  href={`/cms/testimonials/${testimonial.slug}`}
                  className="text-link hover:text-link-hover"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-error hover:opacity-80 disabled:opacity-50"
                  onClick={() => onDelete(testimonial.slug)}
                  disabled={pendingSlug === testimonial.slug}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-3 text-body leading-relaxed text-strong">&ldquo;{testimonial.quote}&rdquo;</p>
            <p className="mt-2 text-small text-muted">
              {testimonial.attribution} &middot; {testimonial.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

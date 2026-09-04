'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useConfirm } from '@/components/cms/ConfirmDialog';
import { SERVICE_CATEGORY_LABELS } from '@/lib/validation/service';
import type { Service } from '@/lib/content/types';

/** Rebuilds the raw form-shaped payload the PUT route expects from a stored Service. */
function toUpdatePayload(service: Service, status: 'draft' | 'published') {
  return {
    slug: service.slug,
    title: service.title,
    shortTitle: service.shortTitle,
    category: service.category,
    summary: service.summary,
    icon: service.icon,
    image: service.image,
    intro: service.intro.join('\n\n'),
    audience: service.audience.join('\n'),
    includes: service.includes.join('\n'),
    sections: service.sections.map((section) => ({
      heading: section.heading,
      body: section.body.join('\n\n'),
      requiresFeature: section.requiresFeature,
    })),
    faqs: service.faqs,
    order: service.order,
    requiresFeature: service.requiresFeature,
    status,
    seoTitle: service.seo.title,
    seoDescription: service.seo.description,
  };
}

export function ServicesList({ services }: { services: readonly Service[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');

  async function onDelete(slug: string, title: string) {
    if (!(await confirm({ message: `Delete "${title}"? This cannot be undone.`, tone: 'danger', confirmLabel: 'Delete' })))
      return;

    setPendingSlug(slug);
    setError('');
    try {
      const response = await fetch(`/api/cms/services/${slug}`, { method: 'DELETE' });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        setError(result.message ?? 'Could not delete the service.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setPendingSlug(null);
    }
  }

  async function onToggleStatus(service: Service) {
    const nextStatus = service.status === 'published' ? 'draft' : 'published';

    if (nextStatus === 'published') {
      const confirmed = await confirm(`Show "${service.title}" on the website now?`);
      if (!confirmed) return;
    }

    setTogglingSlug(service.slug);
    setError('');
    try {
      const response = await fetch(`/api/cms/services/${service.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toUpdatePayload(service, nextStatus)),
      });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        setError(result.message ?? 'Could not update the service.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setTogglingSlug(null);
    }
  }

  async function onSeed() {
    setSeeding(true);
    setError('');
    try {
      const response = await fetch('/api/cms/services/seed', { method: 'POST' });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        setError(result.message ?? 'Could not load the existing service pages.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSeeding(false);
    }
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <Briefcase className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 className="text-h3 text-strong">No services here yet</h2>
        <p className="mt-2 max-w-md text-small leading-relaxed text-muted">
          Bring in the service pages already live on the site so you can start editing them, or
          write a new one from scratch.
        </p>
        <div className="mt-6 flex gap-3">
          <Button href="/cms/services/new" variant="accent">
            New service
          </Button>
          <Button variant="secondary" onClick={onSeed} disabled={seeding}>
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Load existing service pages
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
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {services.map((service) => (
              <tr key={service.slug}>
                <td className="px-4 py-3 font-medium text-strong">{service.title}</td>
                <td className="px-4 py-3 text-muted">{SERVICE_CATEGORY_LABELS[service.category]}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Switch
                      checked={service.status === 'published'}
                      onChange={() => onToggleStatus(service)}
                      disabled={togglingSlug === service.slug}
                      label={`Show "${service.title}" on the website`}
                    />
                    <Badge tone={service.status === 'published' ? 'accent' : 'neutral'}>
                      {service.status}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{service.order}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/cms/services/${service.slug}`}
                      className="text-link hover:text-link-hover"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-error hover:opacity-80 disabled:opacity-50"
                      onClick={() => onDelete(service.slug, service.title)}
                      disabled={pendingSlug === service.slug}
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

import { UserRound } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Adviser } from '@/lib/content/types';

/**
 * Adviser card (design system §4, PRD §6.3).
 *
 * The regulatory level and registration number are rendered as supplied. They
 * are never inferred, never defaulted to a plausible value, and never
 * accompanied by a badge or logo. The fields exist so the client can populate
 * them at launch (README rule 2).
 */
export function AdviserCard({ adviser }: { adviser: Adviser }) {
  return (
    <Card as="li">
      <div className="flex items-start gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-muted"
          aria-hidden="true"
        >
          <UserRound className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <div className="min-w-0">
          <h3 className="text-h3 text-strong">{adviser.name}</h3>
          <p className="mt-1 text-sm text-muted">{adviser.professionalTitle}</p>
        </div>
      </div>

      <dl className="mt-5 space-y-2 border-t border-border-subtle pt-5 text-sm">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-strong">Regulatory level:</dt>
          <dd className="text-muted">{adviser.regulatoryLevel}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-strong">Registration number:</dt>
          <dd className="text-muted">{adviser.registrationNumber}</dd>
        </div>
      </dl>

      {adviser.biography.length > 0 ? (
        <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
          {adviser.biography.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

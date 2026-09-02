import { Info } from 'lucide-react';
import { OUTCOME_DISCLAIMER } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The shared outcome disclaimer (PRD §6.5).
 *
 * One component, one wording, used on every service page and beside the
 * enquiry form. Centralising it is what guarantees the site never carries two
 * different statements about outcomes, and never drifts towards implying one.
 */
export function DisclaimerBlock({
  className,
  tone = 'default',
}: {
  className?: string;
  tone?: 'default' | 'inverse';
}) {
  const inverse = tone === 'inverse';

  return (
    <aside
      className={cn(
        'flex gap-4 rounded-xl border p-5 sm:p-6',
        inverse ? 'border-border-inverse bg-white/[0.04]' : 'border-border-subtle bg-surface-sunken',
        className,
      )}
      data-testid="outcome-disclaimer"
    >
      <Info
        className={cn('mt-0.5 h-5 w-5 shrink-0', inverse ? 'text-accent' : 'text-accent-ink')}
        aria-hidden="true"
      />
      <div>
        <p className={cn('text-small font-semibold', inverse ? 'text-inverse' : 'text-strong')}>
          {OUTCOME_DISCLAIMER.heading}
        </p>
        <p
          className={cn(
            'mt-2 text-small leading-relaxed',
            inverse ? 'text-inverse-muted' : 'text-muted',
          )}
        >
          {OUTCOME_DISCLAIMER.body}
        </p>
      </div>
    </aside>
  );
}

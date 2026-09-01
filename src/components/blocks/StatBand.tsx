import { STATS, type StatItem } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Stat band.
 *
 * Carries verifiable facts only. There is no client count and no success rate
 * here by design: publishing an approval rate would imply a likely outcome,
 * which the brief prohibits.
 *
 * Placeholder figures are rendered with a visible marker so an unconfirmed
 * value cannot pass for a real one in a screenshot or a client review.
 */
export function StatBand({
  items = STATS,
  tone = 'surface',
  className,
}: {
  items?: readonly StatItem[];
  tone?: 'surface' | 'inverse';
  className?: string;
}) {
  const inverse = tone === 'inverse';

  return (
    <dl
      className={cn(
        'grid gap-px overflow-hidden rounded-xl border',
        inverse ? 'border-border-inverse bg-border-inverse' : 'border-border-subtle bg-border-subtle',
        'sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
      data-testid="stat-band"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'flex h-full flex-col p-6 lg:p-7',
            inverse ? 'bg-surface-inverse' : 'bg-surface',
          )}
        >
          <dt
            className={cn(
              'order-2 mt-1 text-sm font-semibold',
              inverse ? 'text-inverse' : 'text-strong',
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              'order-1 font-serif text-[2rem] leading-none font-semibold',
              // A placeholder figure is deliberately dimmed rather than gold,
              // so it never reads as a confirmed number.
              item.needsClientConfirmation
                ? inverse
                  ? 'text-inverse-muted'
                  : 'text-muted'
                : inverse
                  ? 'text-accent'
                  : 'text-accent-ink',
            )}
          >
            {item.value}
          </dd>
          <dd
            className={cn(
              'order-3 mt-3 text-sm leading-relaxed',
              inverse ? 'text-inverse-muted' : 'text-muted',
            )}
          >
            {item.detail}
          </dd>
          {item.needsClientConfirmation ? (
            <dd className="order-4 mt-3">
              <span
                className={cn(
                  'inline-flex items-center rounded-md border border-accent/40 bg-accent-soft px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase',
                  inverse ? 'text-accent' : 'text-accent-ink',
                )}
                data-testid="stat-placeholder-marker"
              >
                Awaiting client
              </span>
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

import { STATS, type StatItem } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Stat band.
 *
 * Carries verifiable facts only. There is no client count and no success rate
 * here by design: publishing an approval rate would imply a likely outcome,
 * which the brief prohibits.
 *
 * Every figure here is either verifiable or derived from what the site
 * actually publishes, so nothing in this band needs qualifying.
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
              'order-1 font-serif text-h1 leading-none font-semibold',
              inverse ? 'text-accent' : 'text-accent-ink',
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
        </div>
      ))}
    </dl>
  );
}

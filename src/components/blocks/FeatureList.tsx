import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Two-column tick list, used for "who this is for" and "what this includes".
 * Items are laid out on a grid rather than as free-flowing text so the two
 * columns stay aligned regardless of how long individual entries run.
 */
export function FeatureList({
  items,
  columns = 2,
  className,
}: {
  items: readonly string[];
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'grid gap-x-8 gap-y-3.5',
        columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink"
            aria-hidden="true"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="text-sm leading-relaxed text-body">{item}</span>
        </li>
      ))}
    </ul>
  );
}

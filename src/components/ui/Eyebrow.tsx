import { cn } from '@/lib/utils';

/** Small uppercase label above a section heading. */
export function Eyebrow({
  children,
  className,
  tone = 'default',
}: {
  children: string;
  className?: string;
  /** 'onPhoto' lifts the label to the brand gold, for use over the hero scrim. */
  tone?: 'default' | 'onPhoto';
}) {
  return (
    <p
      className={cn(
        'mb-3 text-sm font-semibold tracking-[0.14em] uppercase',
        tone === 'onPhoto' ? 'text-on-photo' : 'text-accent-ink',
        className,
      )}
    >
      <span className="mr-2.5 inline-block h-px w-6 translate-y-[-0.25em] bg-accent align-middle" aria-hidden="true" />
      {children}
    </p>
  );
}

import { cn } from '@/lib/utils';

export function Badge({
  children,
  tone = 'accent',
  className,
}: {
  children: string;
  tone?: 'accent' | 'neutral' | 'warning';
  className?: string;
}) {
  const tones = {
    // A lighter tint than accent-soft. On the white ground the deeper tint
    // pulled the gold label just under the contrast threshold.
    accent: 'bg-accent/10 text-accent-ink border-accent/30',
    neutral: 'bg-surface-sunken text-muted border-border-subtle',
    warning: 'bg-accent-soft text-strong border-accent/40',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

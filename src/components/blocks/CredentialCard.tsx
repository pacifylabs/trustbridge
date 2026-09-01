import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The navy card that overlaps the hero imagery.
 *
 * It carries the two things the practice can state today: that it is a
 * registered company, and that its regulatory wording is still to come. There
 * is deliberately no adviser level, no authorisation claim and no figure that
 * implies an outcome (README rules 1 and 2), and the pending line is marked so
 * the gap is obvious in a client review rather than read as finished copy.
 */
export interface CredentialCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly pendingLabel: string;
  readonly pendingNote: string;
  readonly className?: string;
}

export function CredentialCard({
  title,
  subtitle,
  pendingLabel,
  pendingNote,
  className,
}: CredentialCardProps) {
  return (
    <div
      data-testid="credential-card"
      className={cn(
        'rounded-2xl border border-border-inverse bg-surface-inverse p-4 shadow-lg sm:p-5',
        className,
      )}
    >
      <span
        className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accent"
        aria-hidden="true"
      >
        <ShieldCheck className="h-4.5 w-4.5" />
      </span>

      <p className="font-serif text-lg leading-tight font-semibold text-inverse">{title}</p>
      <p className="mt-1 text-xs leading-snug text-inverse-muted">{subtitle}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border-inverse pt-3">
        <p className="text-xs font-semibold text-inverse">{pendingLabel}</p>
        <span
          data-testid="regulatory-placeholder-marker"
          className="inline-flex items-center rounded-md border border-accent/40 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-accent uppercase"
        >
          Awaiting wording
        </span>
        <span className="sr-only">{pendingNote}</span>
      </div>
    </div>
  );
}

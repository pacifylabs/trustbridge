import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The navy card that overlaps the hero imagery.
 *
 * It states the one thing the practice can state today: that it is a
 * registered company. There is deliberately no adviser level, no claim of
 * authorisation and no figure implying an outcome (README rules 1 and 2).
 */
export interface CredentialCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly className?: string;
}

export function CredentialCard({ title, subtitle, className }: CredentialCardProps) {
  return (
    <div
      data-testid="credential-card"
      className={cn(
        'rounded-2xl border border-border-inverse bg-surface-inverse p-5 shadow-lg sm:p-6',
        className,
      )}
    >
      <span
        className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accent"
        aria-hidden="true"
      >
        <ShieldCheck className="h-4.5 w-4.5" />
      </span>

      <p className="font-serif text-body-lg leading-tight font-semibold text-inverse">{title}</p>
      <p className="mt-1.5 text-small leading-relaxed text-inverse-muted">{subtitle}</p>

      {/* A rule gives the card a base now that the pending row has gone; it
          was ending abruptly under a two-line paragraph. */}
      <span aria-hidden="true" className="mt-4 block h-px w-10 bg-accent" />

    </div>
  );
}

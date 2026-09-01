import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Form field wrapper.
 *
 * Owns the label, the optional hint and the error message, and wires the ARIA
 * relationships between them. Every input on the site goes through this, so
 * labelling and error announcement are consistent rather than per-form.
 */
export interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly className?: string;
  readonly children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  }) => ReactNode;
}

export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className="mb-1.5 text-sm font-semibold text-strong">
        {label}
        {required ? (
          <span className="ml-1 text-accent-ink" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 font-normal text-muted">(optional)</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="mb-2 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}

      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared control styling, so inputs, selects and textareas match exactly. */
export const controlClasses =
  'w-full rounded-md border border-border-strong bg-surface px-3.5 py-2.5 text-base text-body ' +
  'placeholder:text-muted/70 transition-colors duration-150 ' +
  'hover:border-accent/60 focus:border-accent ' +
  'aria-[invalid=true]:border-error aria-[invalid=true]:hover:border-error';

import { cn } from '@/lib/utils';

/** A single on/off switch. Compact — pair it with your own label if you need one. */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
  tone = 'default',
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  /** Accessible name — required, since this control carries no visible text of its own. */
  label: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        checked ? (tone === 'danger' ? 'bg-error' : 'bg-accent') : 'bg-surface-sunken',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

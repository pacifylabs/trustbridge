import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * A single framed image slot.
 *
 * Photography has not been supplied yet, so a frame without a `src` renders a
 * composed panel rather than an empty box: the mist gradient, a set of
 * concentric arcs echoing the bridge in the wordmark, and a caption naming
 * what belongs there. Dropping a real photograph in later is a `src` away and
 * changes nothing else about the layout.
 */
export interface MediaFrameProps {
  readonly src?: string;
  readonly alt?: string;
  /** Described to the client as the shot this slot is waiting for. */
  readonly placeholderLabel?: string;
  readonly className?: string;
  readonly rounded?: 'lg' | 'xl' | '2xl';
  readonly priority?: boolean;
  readonly sizes?: string;
}

const roundedClasses = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
} as const;

export function MediaFrame({
  src,
  alt,
  placeholderLabel,
  className,
  rounded = 'xl',
  priority = false,
  sizes = '(min-width: 1024px) 32vw, (min-width: 640px) 45vw, 90vw',
}: MediaFrameProps) {
  const shell = cn(
    'relative overflow-hidden border border-border-subtle bg-surface-sunken shadow-md',
    roundedClasses[rounded],
    className,
  );

  if (src) {
    return (
      <div className={shell}>
        <Image src={src} alt={alt ?? ''} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div className={shell} role="img" aria-label={placeholderLabel ?? 'Photography to follow'}>
      <div aria-hidden="true" className="bg-mist absolute inset-0" />
      <div aria-hidden="true" className="absolute inset-0">
        <span className="absolute -top-1/4 left-1/2 aspect-square w-[130%] -translate-x-1/2 rounded-full border border-accent/30" />
        <span className="absolute -top-1/12 left-1/2 aspect-square w-[100%] -translate-x-1/2 rounded-full border border-accent/22" />
        <span className="absolute top-1/6 left-1/2 aspect-square w-[70%] -translate-x-1/2 rounded-full border border-accent/16" />
      </div>

      {placeholderLabel ? (
        <span className="absolute inset-x-0 bottom-0 p-3 text-micro font-medium tracking-wide text-muted uppercase">
          {placeholderLabel}
        </span>
      ) : null}
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The single vertical rhythm primitive.
 *
 * Every page section goes through this component, so section padding, the
 * container width and the gutter are identical site-wide. That consistency is
 * what stops sections drifting out of alignment as pages are added.
 */
export interface SectionProps {
  readonly children: ReactNode;
  readonly id?: string;
  readonly className?: string;
  readonly innerClassName?: string;
  readonly as?: 'section' | 'div' | 'header' | 'footer' | 'article' | 'aside';
  readonly tone?: 'canvas' | 'surface' | 'sunken' | 'inverse' | 'mist';
  readonly size?: 'default' | 'sm' | 'none';
  readonly labelledBy?: string;
}

const toneClasses = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
  sunken: 'bg-surface-sunken',
  inverse: 'bg-surface-inverse text-inverse',
  mist: 'bg-canvas',
} as const;

const sizeClasses = {
  default: 'section-y',
  sm: 'section-y-sm',
  none: '',
} as const;

export function Section({
  children,
  id,
  className,
  innerClassName,
  as: Tag = 'section',
  tone = 'canvas',
  size = 'default',
  labelledBy,
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn('relative isolate', toneClasses[tone], sizeClasses[size], className)}
    >
      {tone === 'mist' ? (
        <div
          aria-hidden="true"
          className="bg-mist pointer-events-none absolute inset-0 -z-10"
        />
      ) : null}
      <div className={cn('container-site', innerClassName)}>{children}</div>
    </Tag>
  );
}

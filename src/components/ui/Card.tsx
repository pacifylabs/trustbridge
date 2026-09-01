import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The single card shell used across the site.
 *
 * Every card in a group therefore shares the same radius, padding, border and
 * background. `h-full` plus a column layout means cards stretch to the tallest
 * in their grid row, which is what keeps a row of cards level regardless of how
 * much text each one holds.
 */
export interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: 'div' | 'article' | 'li';
  readonly interactive?: boolean;
  readonly tone?: 'surface' | 'sunken' | 'inverse';
}

const toneClasses = {
  surface: 'bg-surface border-border-subtle',
  sunken: 'bg-surface-sunken border-transparent',
  inverse: 'bg-white/[0.04] border-border-inverse',
} as const;

export function Card({
  children,
  className,
  as: Tag = 'div',
  interactive = false,
  tone = 'surface',
}: CardProps) {
  return (
    <Tag
      className={cn(
        'flex h-full flex-col rounded-xl border p-6 sm:p-7',
        toneClasses[tone],
        interactive &&
          'transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:shadow-md',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A card heading that reserves two lines of space.
 *
 * Cards in a grid row already share a height, but a heading that wraps to two
 * lines while its neighbours use one pushes that card's body copy down, so the
 * text no longer sits on a common baseline across the row. Reserving the
 * second line keeps bodies aligned whatever length of title the client later
 * enters, without capping how long a title may be.
 */
export function CardHeading({
  children,
  className,
  as: Tag = 'h3',
}: {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}) {
  return <Tag className={cn('text-h3 text-strong sm:min-h-[2lh]', className)}>{children}</Tag>;
}

/** Pushes a card's final element to the bottom, keeping footers aligned. */
export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-auto pt-5', className)}>{children}</div>;
}

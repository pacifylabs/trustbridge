import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Two-tone headline: a navy lead clause with a single emphasised clause in
 * gold. The emphasis is restricted to one clause per headline, which is what
 * keeps the gold accent as disciplined as the design system requires (§1).
 *
 * The two parts are rendered inside one heading element so the accessible name
 * remains a single continuous phrase.
 */
export interface TwoToneHeadingProps {
  readonly lead: string;
  readonly emphasis?: string;
  /** Text following the emphasised clause, where the emphasis sits mid-sentence. */
  readonly trail?: string;
  readonly as?: ElementType;
  readonly size?: 'display' | 'h1' | 'h2' | 'h3';
  readonly className?: string;
  readonly id?: string;
  /**
   * 'onPhoto' renders the lead in cream for headings set over the hero
   * photography. The emphasis stays gold, which holds AA against the scrim.
   */
  readonly tone?: 'default' | 'onPhoto';
  readonly children?: ReactNode;
}

const sizeClasses = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
} as const;

export function TwoToneHeading({
  lead,
  emphasis,
  trail,
  as: Tag = 'h2',
  size = 'h2',
  className,
  id,
  tone = 'default',
}: TwoToneHeadingProps) {
  return (
    <Tag
      id={id}
      className={cn(
        tone === 'onPhoto' ? 'text-on-photo' : 'text-headline',
        sizeClasses[size],
        className,
      )}
    >
      {lead}
      {emphasis ? (
        <>
          {' '}
          <span className={tone === 'onPhoto' ? 'text-on-photo-accent' : 'text-headline-emphasis'}>
            {emphasis}
          </span>
        </>
      ) : null}
      {trail ? <> {trail}</> : null}
    </Tag>
  );
}

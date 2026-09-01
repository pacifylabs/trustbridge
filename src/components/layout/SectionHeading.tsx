import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { TwoToneHeading } from '@/components/ui/TwoToneHeading';
import { cn } from '@/lib/utils';

/**
 * Heading block used at the top of every section, so eyebrow, heading and
 * standfirst sit at consistent sizes and spacing throughout the site.
 */
export interface SectionHeadingProps {
  readonly eyebrow?: string;
  readonly lead: string;
  readonly emphasis?: string;
  readonly trail?: string;
  readonly standfirst?: string;
  readonly align?: 'left' | 'centre';
  readonly size?: 'h1' | 'h2';
  readonly as?: 'h1' | 'h2';
  readonly id?: string;
  readonly className?: string;
  readonly children?: ReactNode;
  readonly inverse?: boolean;
}

export function SectionHeading({
  eyebrow,
  lead,
  emphasis,
  trail,
  standfirst,
  align = 'left',
  size = 'h2',
  as = 'h2',
  id,
  className,
  children,
  inverse = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'centre' && 'mx-auto items-center text-center',
        align === 'centre' ? 'max-w-2xl' : 'max-w-3xl',
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <TwoToneHeading
        as={as}
        size={size}
        lead={lead}
        emphasis={emphasis}
        trail={trail}
        id={id}
        className={cn(inverse && 'text-inverse')}
      />
      {standfirst ? (
        <p
          className={cn(
            'mt-4 text-body-lg',
            inverse ? 'text-inverse-muted' : 'text-muted',
            align === 'centre' ? 'mx-auto' : 'measure',
          )}
        >
          {standfirst}
        </p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

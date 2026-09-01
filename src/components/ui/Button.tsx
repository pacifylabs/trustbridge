import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button variants map to the four defined in the design system (§4), plus an
 * inverse treatment for use on the navy CTA band. Every variant shares the same
 * height, radius and focus treatment so buttons never look mismatched when
 * placed side by side.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-contrast hover:bg-primary-hover border border-transparent shadow-sm',
  accent:
    'bg-accent text-accent-contrast hover:bg-accent-hover border border-transparent shadow-sm font-semibold',
  secondary:
    'bg-transparent text-strong border border-border-strong hover:border-accent hover:text-accent-ink',
  ghost: 'bg-transparent text-link hover:text-link-hover border border-transparent underline-offset-4 hover:underline',
  inverse:
    'bg-transparent text-inverse border border-border-inverse hover:border-accent hover:text-accent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 text-sm gap-1.5',
  md: 'min-h-11 px-5 text-base gap-2',
  lg: 'min-h-12 px-6 text-base gap-2',
};

const baseClasses =
  'inline-flex items-center justify-center rounded-md font-medium leading-none ' +
  'transition-colors duration-150 ease-out ' +
  'disabled:opacity-55 disabled:pointer-events-none';

interface CommonProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly className?: string;
  readonly children: ReactNode;
  /** Stretches the button to the full width of its container. */
  readonly block?: boolean;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps> & { readonly href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps | 'href'> & { readonly href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, block, ...rest } = props;

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    block && 'w-full',
    className,
  );

  if (typeof props.href === 'string') {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');

    if (isExternal) {
      return (
        <a href={href} className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { TwoToneHeading } from '@/components/ui/TwoToneHeading';
import { HeroBackdrop } from '@/components/blocks/HeroBackdrop';
import { cn } from '@/lib/utils';
import type { ContentImage } from '@/lib/content/types';

/**
 * Page hero.
 *
 * The atmosphere is built in layers: a masked mist wash, a drawn grid that
 * fades out before it reaches the copy, and two soft accent blooms. All of it
 * sits behind the content at low strength, and text contrast is carried by the
 * canvas colour beneath rather than by any of these layers.
 *
 * A landing hero fills the viewport below the sticky header, so the first
 * screen is a composed whole rather than a band of copy with the next section
 * half showing beneath it. It is a minimum, not a fixed height: the hero grows
 * when the content needs more room, which is what stops the copy being clipped
 * on a short laptop screen.
 */
export interface HeroProps {
  readonly eyebrow?: string;
  readonly lead: string;
  readonly emphasis?: string;
  readonly trail?: string;
  readonly standfirst: string;
  readonly actions?: ReactNode;
  readonly aside?: ReactNode;
  readonly footnote?: ReactNode;
  readonly variant?: 'landing' | 'page';
  /**
   * Rotating photography behind the hero. Supplying it switches the copy to
   * the light treatment, because navy type cannot hold contrast over a
   * photograph.
   */
  readonly backdrop?: readonly ContentImage[];
  readonly className?: string;
}

export function Hero({
  eyebrow,
  lead,
  emphasis,
  trail,
  standfirst,
  actions,
  aside,
  footnote,
  variant = 'page',
  backdrop,
  className,
}: HeroProps) {
  const isLanding = variant === 'landing';
  const onPhoto = Boolean(backdrop && backdrop.length > 0);

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden',
        onPhoto ? 'bg-navy-950' : 'bg-canvas',
        isLanding && 'lg:min-h-screen-nav lg:flex lg:items-center',
        className,
      )}
    >
      {onPhoto ? (
        <HeroBackdrop images={backdrop!} />
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-mist absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_95%)]" />
          <div className="bg-gridfield absolute inset-0 opacity-60 [mask-image:radial-gradient(120%_80%_at_80%_0%,black_0%,transparent_70%)]" />
          <div className="absolute -top-32 -right-24 h-[30rem] w-[30rem] rounded-full bg-accent-soft blur-3xl" />
          <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
        </div>
      )}

      <div className="container-site w-full">
        <div
          className={cn(
            'grid items-center gap-10 lg:gap-14',
            isLanding
              ? 'pt-10 pb-12 sm:pt-14 sm:pb-14 lg:pt-14 lg:pb-12'
              : 'py-12 sm:py-16 lg:py-20',
            aside ? 'lg:grid-cols-12' : '',
          )}
        >
          <div
            className={cn(
              aside ? 'lg:col-span-6' : 'max-w-3xl',
              /*
                Over photography the copy carries its own ground rather than
                the whole hero being tinted. The blur is doing most of the work:
                it removes the fine detail that makes type hard to read, so the
                tint can stay light and the photograph keeps its colour. The
                gradient runs from a firmer top-left, where the headline sits,
                to a lighter bottom-right, so the panel fades toward the image
                rather than ending as a flat block.
              */
              onPhoto &&
                'hero-copy-panel relative rounded-2xl border border-white/12 p-6 shadow-xl backdrop-blur-md sm:p-8 lg:p-10',
            )}
          >
            {eyebrow ? (
              <Eyebrow tone={onPhoto ? 'onPhoto' : 'default'}>{eyebrow}</Eyebrow>
            ) : null}
            <TwoToneHeading
              as="h1"
              size={isLanding ? 'display' : 'h1'}
              lead={lead}
              emphasis={emphasis}
              trail={trail}
              tone={onPhoto ? 'onPhoto' : 'default'}
            />
            <p
              className={cn(
                'measure mt-5 text-body-lg',
                onPhoto ? 'text-on-photo-muted' : 'text-muted',
              )}
            >
              {standfirst}
            </p>

            {actions ? (
              // Stacked and full width on the narrowest screens, where buttons
              // sized to their own labels leave a ragged left column.
              <div className="mt-8 flex flex-col gap-3 [&>*]:w-full sm:flex-row sm:flex-wrap sm:[&>*]:w-auto">
                {actions}
              </div>
            ) : null}

            {footnote ? <div className="mt-8">{footnote}</div> : null}
          </div>

          {aside ? <div className="lg:col-span-6">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}

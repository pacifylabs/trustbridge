'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Testimonial {
  readonly quote: string;
  readonly attribution: string;
  readonly location: string;
}

/**
 * Testimonial slider.
 *
 * Built on a scroll container rather than a transform carousel. That means the
 * browser does the work: it can be swiped on a touch screen, dragged on a
 * trackpad, scrolled with a wheel, and tabbed through with a keyboard, and
 * every quote stays in the document in reading order whether or not it is the
 * one on screen. A transform carousel has to reimplement all of that, usually
 * badly, and typically hides the off-screen slides from assistive technology.
 *
 * The arrows and dots drive the same scroll, so there is one source of truth
 * for which quote is showing.
 *
 * It advances on its own, and stops the moment anyone engages with it: on
 * hover, on keyboard focus, while the tab is hidden, and permanently under
 * prefers-reduced-motion. WCAG 2.2.2 wants moving content to be pausable, and
 * hovering or focusing is the pause.
 */
export function TestimonialSlider({
  items,
  className,
}: {
  items: readonly Testimonial[];
  className?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // The active card is whichever is nearest the centre of the viewport.
  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const middle = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;

    for (const [index, child] of [...track.children].entries()) {
      const card = child as HTMLElement;
      const centre = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(centre - middle);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    }

    setActive(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncActive);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [syncActive]);

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;

    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;

    // Element.scrollTo is not universal. Falling back to assigning scrollLeft
    // keeps the control working rather than throwing where it is missing.
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left, behavior: 'smooth' });
    } else {
      track.scrollLeft = left;
    }
  }, []);

  // Advance on its own, stopping as soon as anyone engages with it.
  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % items.length;
        const track = trackRef.current;
        const card = track?.children[next] as HTMLElement | undefined;

        if (track && card) {
          const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
          if (typeof track.scrollTo === 'function') {
            track.scrollTo({ left, behavior: 'smooth' });
          } else {
            track.scrollLeft = left;
          }
        }

        return next;
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const step = useCallback(
    (direction: -1 | 1) => {
      const next = Math.min(items.length - 1, Math.max(0, active + direction));
      scrollTo(next);
    },
    [active, items.length, scrollTo],
  );

  if (items.length === 0) return null;

  return (
    <div
      className={cn('relative', className)}
      data-testid="testimonial-slider"
      data-paused={paused ? 'true' : 'false'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/*
        The track is focusable and labelled. A scrollable region that cannot be
        focused is unreachable for anyone scrolling by keyboard, which is what
        the `scrollable-region-focusable` rule is about.

        No explicit role: an overriding role would strip the list semantics
        from this element and leave its list items orphaned.
      */}
      <ul
        ref={trackRef}
        data-testid="testimonial-track"
        tabIndex={0}
        aria-label="Client testimonials"
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-4 outline-offset-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <li
            key={item.quote}
            data-active={index === active ? 'true' : 'false'}
            aria-hidden={undefined}
            className={cn(
              'flex w-[85%] shrink-0 snap-center flex-col rounded-2xl border p-6 transition-[border-color,box-shadow] duration-300 sm:w-[60%] sm:p-8 lg:w-[46%]',
              // Border and shadow only: fading the card took its text below
              // the contrast threshold, and a testimonial nobody can read is
              // worse than one that is not visually de-emphasised.
              index === active
                ? 'border-accent/50 bg-surface shadow-md'
                : 'border-border-subtle bg-surface',
            )}
          >
            {/*
              figure/figcaption is the markup for a quotation with its source.
              A <footer> here would register as a second contentinfo landmark,
              because an <li> is not a sectioning element that would scope it.
            */}
            <figure className="flex flex-1 flex-col">
              <Quote className="h-7 w-7 shrink-0 text-accent-ink/40" aria-hidden="true" />

              <blockquote className="mt-4 flex-1">
                <p className="text-body-lg leading-relaxed text-body">{item.quote}</p>
              </blockquote>

              <figcaption className="mt-6 border-t border-border-subtle pt-4">
                <span className="block text-small font-semibold text-strong">
                  {item.attribution}
                </span>
                <span className="mt-0.5 block text-small text-muted">{item.location}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-4">
        <ul className="flex items-center gap-2" aria-hidden="true">
          {items.map((item, index) => (
            <li key={item.quote}>
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-300',
                  index === active ? 'w-6 bg-accent' : 'w-1.5 bg-border-strong',
                )}
              />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={active === 0}
            aria-label="Previous testimonial"
            className="inline-grid h-10 w-10 place-items-center rounded-full border border-border-strong text-strong transition-colors hover:border-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-strong disabled:hover:text-strong"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={active === items.length - 1}
            aria-label="Next testimonial"
            className="inline-grid h-10 w-10 place-items-center rounded-full border border-border-strong text-strong transition-colors hover:border-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-strong disabled:hover:text-strong"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

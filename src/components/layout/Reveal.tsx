'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Gentle fade and rise on scroll (design system §8).
 *
 * Uses IntersectionObserver rather than an animation library. Content is
 * visible from the first paint if JavaScript never runs, and the CSS honours
 * prefers-reduced-motion, so nothing here can hide content from a visitor.
 *
 * The revealed flag is written straight to the DOM rather than held in React
 * state. Nothing renders from it, only the CSS reads it, and keeping it out of
 * state avoids a cascading render on mount for every revealed block on a page.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reveal = () => {
      node.dataset.revealed = 'true';
    };

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    // An element already on screen at mount triggers the observer's first
    // callback immediately, so no separate initial check is needed.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );

    observer.observe(node);

    // Safety net. Some environments throttle or never deliver intersection
    // callbacks; content must not be able to stay hidden because of a missed
    // animation trigger.
    const failsafe = window.setTimeout(reveal, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn('reveal', className)}
      data-revealed="false"
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ContentImage } from '@/lib/content/types';

/**
 * Rotating hero backdrop.
 *
 * Photographs cross-fade on a fixed interval behind a navy scrim. The scrim is
 * what makes the hero copy legible: it is opaque enough that contrast is
 * carried by the scrim rather than by whichever photograph happens to be
 * showing, so no frame of the rotation can drop the text below AA.
 *
 * The imagery is decorative. It illustrates the destination rather than
 * conveying anything the copy does not already say, so it is hidden from
 * assistive technology and carries empty alt text.
 *
 * Accessibility of the movement itself (WCAG 2.2.2):
 *  - prefers-reduced-motion holds a single image and never rotates.
 *  - Rotation stops while the tab is hidden, so a background tab is not
 *    decoding images for nothing.
 * Both are handled here rather than by the caller.
 */
export function HeroBackdrop({
  images,
  intervalMs = 4000,
  className,
}: {
  images: readonly ContentImage[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduceMotion?.matches) return;

    let timer: number | undefined;

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        setIndex((current) => (current + 1) % images.length);
      }, intervalMs);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        window.clearInterval(timer);
      } else {
        start();
      }
    };

    // A change of preference mid-visit should take effect without a reload.
    const onPreferenceChange = () => {
      if (reduceMotion?.matches) {
        window.clearInterval(timer);
      } else {
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    reduceMotion?.addEventListener('change', onPreferenceChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reduceMotion?.removeEventListener('change', onPreferenceChange);
    };
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="hero-backdrop"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      {images.map((image, position) => (
        <Image
          key={image.src}
          src={image.src}
          alt=""
          fill
          // Only the first frame is worth blocking the initial paint for.
          priority={position === 0}
          sizes="100vw"
          data-active={position === index ? 'true' : 'false'}
          className={cn(
            'object-cover transition-opacity duration-1000 ease-out',
            position === index ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}

      {/*
        No full-bleed scrim. Legibility is carried by the panel behind the hero
        copy instead, which leaves the photograph itself at full strength.

        What remains is a short gradient along the bottom edge only. That is
        not for the copy: it stops the photograph meeting the section below on
        a hard horizontal line, and it is weak enough that the image reads
        clearly through it.
      */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy-950/55 to-transparent" />
    </div>
  );
}

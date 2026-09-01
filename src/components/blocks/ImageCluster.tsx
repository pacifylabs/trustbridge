import type { ReactNode } from 'react';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { cn } from '@/lib/utils';

export interface ClusterImage {
  readonly src?: string;
  readonly alt?: string;
  readonly placeholderLabel?: string;
}

/**
 * The hero image composition.
 *
 * From `sm` up every frame is placed absolutely inside a fixed-ratio box. The
 * frames are empty until photography arrives, so nothing here can be sized by
 * its content: the ratio gives the group its height and the percentages give
 * each frame a position that cannot drift into the overlay card beside it.
 *
 * Below `sm` the absolute placement is dropped and the frames become a plain
 * two-column grid, because overlapping panels at 360px hide more than they
 * show.
 *
 * `overlay` is rendered in the reserved lower-left area, which no frame
 * occupies. `badge` sits on the top-right corner. Keeping both as named slots
 * is what stops a caller positioning something on top of a frame.
 */
export function ImageCluster({
  images,
  overlay,
  badge,
  className,
}: {
  images: readonly ClusterImage[];
  overlay?: ReactNode;
  badge?: ReactNode;
  className?: string;
}) {
  const [lead, second, third] = images;

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3',
        // The ratio is fixed on purpose. Every frame inside is positioned as a
        // percentage of this box, so letting the box take its height from a
        // parent would stretch the frames vertically and their shapes would
        // change with the height of the browser window.
        'sm:relative sm:block sm:aspect-[5/4.6] sm:gap-0',
        className,
      )}
    >
      {lead ? (
        <MediaFrame
          {...lead}
          priority
          rounded="2xl"
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 36vw, 92vw"
          className="col-span-2 aspect-4/3 sm:absolute sm:top-0 sm:right-0 sm:aspect-auto sm:h-[82%] sm:w-[58%]"
        />
      ) : null}

      {second ? (
        <MediaFrame
          {...second}
          rounded="xl"
          sizes="(min-width: 1024px) 18vw, (min-width: 640px) 22vw, 45vw"
          className="aspect-4/3 sm:absolute sm:top-[2%] sm:left-0 sm:aspect-auto sm:h-[27%] sm:w-[38%]"
        />
      ) : null}

      {third ? (
        <MediaFrame
          {...third}
          rounded="xl"
          sizes="(min-width: 1024px) 18vw, (min-width: 640px) 22vw, 45vw"
          className="aspect-4/3 sm:absolute sm:top-[31%] sm:left-[6%] sm:aspect-auto sm:h-[22%] sm:w-[36%]"
        />
      ) : null}

      {/* Reserved: no left-hand frame reaches below 53%. The overlap with the
          tall frame on the right is intended: the card sits over its edge. */}
      {overlay ? (
        <div className="col-span-2 sm:absolute sm:bottom-0 sm:left-0 sm:w-[48%]">{overlay}</div>
      ) : null}

      {badge ? <div className="hidden sm:absolute sm:-top-5 sm:-right-4 sm:block">{badge}</div> : null}
    </div>
  );
}

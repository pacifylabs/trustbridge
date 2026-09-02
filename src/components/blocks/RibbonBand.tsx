import { cn } from '@/lib/utils';

/**
 * The crossed ribbon band.
 *
 * Two navy bands run at opposing angles across a full-bleed strip, each
 * scrolling in the opposite direction. It is decorative, so the whole thing is
 * hidden from assistive technology: the words it carries are the service names
 * already listed in the navigation and the services grid.
 *
 * The track is duplicated and translated by half its own width, which is what
 * makes the loop seamless. Motion pauses on hover and is removed entirely
 * under prefers-reduced-motion.
 */
export function RibbonBand({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={cn('marquee relative isolate h-32 overflow-hidden sm:h-40 lg:h-48', className)}
    >
      <Band items={items} className="absolute inset-x-[-8%] top-6 rotate-[-3.5deg] sm:top-8" />
      <Band
        items={items}
        direction="reverse"
        durationSeconds={52}
        className="absolute inset-x-[-8%] bottom-6 rotate-[3deg] sm:bottom-8"
      />
    </div>
  );
}

function Band({
  items,
  direction = 'normal',
  durationSeconds = 44,
  className,
}: {
  items: readonly string[];
  direction?: 'normal' | 'reverse';
  durationSeconds?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-y border-white/10 bg-surface-inverse py-3.5 shadow-lg sm:py-4',
        className,
      )}
    >
      <div
        className="marquee-track"
        data-direction={direction}
        style={{ ['--marquee-duration' as string]: `${durationSeconds}s` }}
      >
        {/* Two identical passes: the animation moves the pair by exactly half. */}
        {[0, 1].map((pass) => (
          <ul key={pass} className="flex shrink-0 items-center">
            {items.map((item) => (
              <li key={`${pass}-${item}`} className="flex items-center">
                <span className="font-serif text-h3 font-semibold whitespace-nowrap text-inverse">
                  {item}
                </span>
                <span className="mx-6 h-1.5 w-1.5 rotate-45 bg-accent sm:mx-8" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

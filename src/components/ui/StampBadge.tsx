import { cn } from '@/lib/utils';

/**
 * The rotating circular seal.
 *
 * Text is set on an SVG path so it follows the circle properly rather than
 * being faked with per-letter rotation. Decorative, so it is hidden from
 * assistive technology; rotation stops under prefers-reduced-motion.
 */
export function StampBadge({
  text,
  className,
  children,
}: {
  text: string;
  className?: string;
  children?: React.ReactNode;
}) {
  // A trailing separator keeps an even gap where the text meets its own start.
  const ring = `${text} · ${text} · `;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative grid h-28 w-28 shrink-0 place-items-center rounded-full border border-border-subtle bg-surface/80 backdrop-blur-sm sm:h-32 sm:w-32',
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="stamp-rotate absolute inset-0 h-full w-full">
        <defs>
          <path id="stampPath" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none" />
        </defs>
        <text className="fill-muted text-micro tracking-[0.22em] uppercase">
          <textPath href="#stampPath" startOffset="0%">
            {ring}
          </textPath>
        </text>
      </svg>

      <span className="text-accent-ink">{children}</span>
    </div>
  );
}

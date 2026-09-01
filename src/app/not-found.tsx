import Link from 'next/link';
import { SITE } from '@/content/site';

/**
 * Root not-found page.
 *
 * Also what a feature-gated route resolves to. The wording is deliberately
 * neutral: it must not hint that a page exists but is hidden.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-5 text-center">
      <p className="text-sm font-semibold tracking-[0.14em] text-accent-ink uppercase">Page not found</p>
      <h1 className="mt-4 text-[1.875rem] text-headline sm:text-[2.25rem]">
        We could not find that page
      </h1>
      <p className="measure mt-4 text-body-lg text-muted">
        The address may have changed, or the page may no longer be available. You can start again
        from the home page or get in touch and we will point you in the right direction.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center rounded-md border border-border-strong px-5 font-medium text-strong transition-colors hover:border-accent hover:text-accent-ink"
        >
          Contact {SITE.shortName}
        </Link>
      </div>
    </div>
  );
}

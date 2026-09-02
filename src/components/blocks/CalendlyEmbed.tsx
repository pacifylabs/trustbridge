'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Calendly inline embed, gated behind an explicit click.
 *
 * Calendly's iframe sets its own cookies once it loads, which is outside this
 * site's control. Rather than add a cookie-consent banner for the sake of one
 * third-party embed, the widget only loads once the visitor asks for it, so
 * nothing from Calendly reaches the browser until they have actively chosen
 * to see the calendar.
 */
export function CalendlyEmbed({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <div
        className="flex flex-col items-start rounded-xl border border-border-subtle bg-surface p-6 sm:p-8"
        data-testid="calendly-placeholder"
      >
        <span
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-ink"
          aria-hidden="true"
        >
          <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <h2 className="text-h3 text-strong">Choose a time online</h2>
        <p className="measure mt-3 text-sm leading-relaxed text-muted">
          This opens a booking calendar provided by Calendly, which sets its own cookies once
          shown. See our{' '}
          <Link href="/legal/cookie-policy" className="text-link underline underline-offset-2">
            cookie policy
          </Link>{' '}
          for details.
        </p>
        <Button className="mt-7" variant="accent" onClick={() => setLoaded(true)}>
          Show available times
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="calendly-embed">
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      <div
        className="calendly-inline-widget rounded-xl"
        data-url={url}
        style={{ minWidth: '288px', height: '700px' }}
      />
    </div>
  );
}

'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, params: Record<string, unknown>) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

export interface RecaptchaHandle {
  reset: () => void;
}

interface RecaptchaProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  error?: string;
}

/**
 * Google reCAPTCHA v2 (checkbox) widget.
 *
 * Loaded via Google's own script rather than a wrapper package, since the
 * widget is the entire dependency surface here. `grecaptcha.render` is called
 * imperatively once the script is available, because the widget manages its
 * own DOM inside the container and does not tolerate React re-rendering that
 * subtree.
 *
 * The verdict this produces is a token, not a pass/fail: it still has to be
 * checked against Google's endpoint server-side (`verifyRecaptcha`) before
 * the enquiry is sent, the same way every other field is revalidated there.
 */
export const Recaptcha = forwardRef<RecaptchaHandle, RecaptchaProps>(function Recaptcha(
  { siteKey, onChange, error },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  const render = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha || widgetId.current !== null) return;
    widgetId.current = window.grecaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onChange(token),
      'expired-callback': () => onChange(null),
      'error-callback': () => onChange(null),
    });
  }, [siteKey, onChange]);

  // Covers the case where another instance already loaded the script (Next
  // dedupes <Script> tags by src, so a later mount's onLoad may never fire).
  useEffect(() => {
    if (typeof window !== 'undefined' && window.grecaptcha) render();
  }, [render]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
      onChange(null);
    },
  }));

  return (
    <div>
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="afterInteractive"
        onLoad={render}
      />
      <div ref={containerRef} data-testid="recaptcha-widget" />
      {error ? (
        <p className="mt-2 text-sm font-medium text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

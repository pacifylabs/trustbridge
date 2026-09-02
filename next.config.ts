import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Content Security Policy.
 *
 * The production policy is strict: fonts are self-hosted at build time via
 * `next/font`, so nothing legitimate needs an external origin. Two exceptions:
 * Google reCAPTCHA on the enquiry form, and the Calendly embed on /book, each
 * loading a script and an iframe from their own domains.
 *
 * The development policy relaxes two things the dev server requires: 'unsafe-eval',
 * which React's development build uses to reconstruct stack traces, and websocket
 * connections for hot module replacement. Neither is present in a deployed build,
 * so the policy that ships is the strict one and it must be verified against
 * `pnpm build && pnpm start` rather than against `pnpm dev`.
 */
const RECAPTCHA_ORIGINS = 'https://www.google.com https://www.gstatic.com';
const CALENDLY_ORIGINS = 'https://calendly.com https://assets.calendly.com';

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' is required for the anti-flash theme script in the document head.
  isDevelopment
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${RECAPTCHA_ORIGINS} ${CALENDLY_ORIGINS}`
    : `script-src 'self' 'unsafe-inline' ${RECAPTCHA_ORIGINS} ${CALENDLY_ORIGINS}`,
  `style-src 'self' 'unsafe-inline' ${CALENDLY_ORIGINS}`,
  `img-src 'self' data: blob: ${CALENDLY_ORIGINS}`,
  "font-src 'self' data:",
  isDevelopment
    ? `connect-src 'self' ws: wss: https://www.google.com ${CALENDLY_ORIGINS}`
    : `connect-src 'self' https://www.google.com ${CALENDLY_ORIGINS}`,
  `frame-src https://www.google.com https://calendly.com`,
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

/** Security headers applied to every response (PRD §7). */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

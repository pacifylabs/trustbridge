import { describe, expect, it, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Launch gate (README rule 3).
 *
 * This is the rule that keeps an unapproved site off the public internet, so
 * it is tested directly against the proxy rather than only through the running
 * application. The environment is read per request, so no module reset is
 * needed between cases.
 */
import { proxy } from '@/proxy';

const ORIGINAL_ENV = { ...process.env };

function request(path: string): NextRequest {
  return new NextRequest(new URL(path, 'https://trustbridgeimmigration.co.uk'));
}

function setEnv(env: Record<string, string | undefined>) {
  process.env = { ...ORIGINAL_ENV, ...env };
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('production, before launch', () => {
  const env = { NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: 'false' };

  it.each([
    '/',
    '/about',
    '/services',
    '/services/spouse-and-partner-visas',
    '/team',
    '/resources',
    '/contact',
    '/book',
    '/legal/privacy-policy',
  ])('rewrites %s to the Coming Soon page', (path) => {
    setEnv(env);
    const response = proxy(request(path));

    expect(response.headers.get('x-middleware-rewrite')).toContain('/coming-soon');
  });

  it('marks the rewritten response as not indexable', () => {
    setEnv(env);
    const response = proxy(request('/'));

    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('drops the query string, so no parameter reaches the gated page', () => {
    setEnv(env);
    const response = proxy(request('/services?utm_source=email&id=42'));
    const rewrite = response.headers.get('x-middleware-rewrite') ?? '';

    expect(rewrite).toContain('/coming-soon');
    expect(rewrite).not.toContain('utm_source');
    expect(rewrite).not.toContain('id=42');
  });

  it('serves the Coming Soon page itself without rewriting', () => {
    setEnv(env);
    expect(proxy(request('/coming-soon')).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it.each(['/_next/static/chunk.js', '/api/enquiry', '/favicon.ico', '/logo.png', '/robots.txt'])(
    'lets %s through so the gated page still renders',
    (path) => {
      setEnv(env);
      expect(proxy(request(path)).headers.get('x-middleware-rewrite')).toBeNull();
    },
  );

  it('keeps the gate shut when SITE_LAUNCHED is missing', () => {
    setEnv({ NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: undefined });
    expect(proxy(request('/')).headers.get('x-middleware-rewrite')).toContain('/coming-soon');
  });

  it.each(['True', 'yes', '1', 'on', 'launched', ''])(
    'keeps the gate shut for the near-miss value %o',
    (value) => {
      setEnv({ NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: value });
      const rewritten = proxy(request('/')).headers.get('x-middleware-rewrite');

      // Only the exact string 'true', case-insensitively and trimmed, opens it.
      const shouldOpen = value.trim().toLowerCase() === 'true';
      expect(Boolean(rewritten)).toBe(!shouldOpen);
    },
  );
});

describe('production, after launch', () => {
  it('serves the full site', () => {
    setEnv({ NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: 'true' });

    for (const path of ['/', '/services', '/contact']) {
      expect(proxy(request(path)).headers.get('x-middleware-rewrite')).toBeNull();
    }
  });
});

describe('non-production environments', () => {
  it.each(['development', 'staging'])('serves the full site on %s', (appEnv) => {
    setEnv({ NEXT_PUBLIC_APP_ENV: appEnv, SITE_LAUNCHED: 'false' });
    expect(proxy(request('/')).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('defaults to development when the environment is unset', () => {
    setEnv({ NEXT_PUBLIC_APP_ENV: undefined, SITE_LAUNCHED: undefined });
    expect(proxy(request('/')).headers.get('x-middleware-rewrite')).toBeNull();
  });
});

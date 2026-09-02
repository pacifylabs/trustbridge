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
import { middleware } from '@/middleware';

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
    const response = middleware(request(path));

    expect(response.headers.get('x-middleware-rewrite')).toContain('/coming-soon');
  });

  it('marks the rewritten response as not indexable', () => {
    setEnv(env);
    const response = middleware(request('/'));

    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('drops the query string, so no parameter reaches the gated page', () => {
    setEnv(env);
    const response = middleware(request('/services?utm_source=email&id=42'));
    const rewrite = response.headers.get('x-middleware-rewrite') ?? '';

    expect(rewrite).toContain('/coming-soon');
    expect(rewrite).not.toContain('utm_source');
    expect(rewrite).not.toContain('id=42');
  });

  it('serves the Coming Soon page itself without rewriting', () => {
    setEnv(env);
    expect(middleware(request('/coming-soon')).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it.each(['/_next/static/chunk.js', '/api/enquiry', '/favicon.ico', '/logo.png', '/robots.txt'])(
    'lets %s through so the gated page still renders',
    (path) => {
      setEnv(env);
      expect(middleware(request(path)).headers.get('x-middleware-rewrite')).toBeNull();
    },
  );

  it('keeps the gate shut when SITE_LAUNCHED is missing', () => {
    setEnv({ NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: undefined });
    expect(middleware(request('/')).headers.get('x-middleware-rewrite')).toContain('/coming-soon');
  });

  it.each(['True', 'yes', '1', 'on', 'launched', ''])(
    'keeps the gate shut for the near-miss value %o',
    (value) => {
      setEnv({ NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: value });
      const rewritten = middleware(request('/')).headers.get('x-middleware-rewrite');

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
      expect(middleware(request(path)).headers.get('x-middleware-rewrite')).toBeNull();
    }
  });
});

describe('non-production environments', () => {
  it.each(['development', 'staging'])('serves the full site on %s', (appEnv) => {
    setEnv({ NEXT_PUBLIC_APP_ENV: appEnv, SITE_LAUNCHED: 'false' });
    expect(middleware(request('/')).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('defaults to development when the environment is unset', () => {
    setEnv({ NEXT_PUBLIC_APP_ENV: undefined, SITE_LAUNCHED: undefined });
    expect(middleware(request('/')).headers.get('x-middleware-rewrite')).toBeNull();
  });
});

describe('an unconfigured deployment', () => {
  /*
    The gate used to default to 'development' when the environment said
    nothing, which meant a host with no variables set would have published the
    full, unapproved site. These cover the fail-closed behaviour that replaced
    it, including the empty-string case a hosting platform actually produces.
  */

  it.each([
    ['absent', undefined],
    ['empty', ''],
    ['whitespace', '   '],
  ])('serves Coming Soon when the environment is %s in a production build', (_label, value) => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_ENV: value,
      SITE_LAUNCHED: undefined,
    });

    expect(middleware(request('/')).headers.get('x-middleware-rewrite')).toContain('/coming-soon');
  });

  it('keeps a local development build open', () => {
    setEnv({ NODE_ENV: 'development', NEXT_PUBLIC_APP_ENV: undefined });
    expect(middleware(request('/')).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('still opens on an explicit non-production environment', () => {
    for (const appEnv of ['development', 'staging']) {
      setEnv({ NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: appEnv });
      expect(middleware(request('/')).headers.get('x-middleware-rewrite'), appEnv).toBeNull();
    }
  });

  it('opens a production build only once launch is explicitly confirmed', () => {
    setEnv({ NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: undefined, SITE_LAUNCHED: 'true' });
    expect(middleware(request('/')).headers.get('x-middleware-rewrite')).toBeNull();
  });
});

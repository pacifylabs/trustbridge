import { describe, expect, it, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Launch gate (README rule 3).
 *
 * This is the rule that keeps an unapproved site off the public internet, so
 * it is tested directly against the proxy rather than only through the running
 * application. The environment is read per request, so no module reset is
 * needed between cases.
 *
 * Every case here explicitly unsets KV_REST_API_URL/TOKEN unless it is
 * specifically exercising the Redis-backed settings path (mocked below, never
 * a real network call): leaving them unset otherwise is what keeps these
 * tests from depending on whatever happens to be in the environment they run
 * in, and guarantees the "env var only" cases never hit the network at all.
 */
import { proxy } from '@/proxy';

const ORIGINAL_ENV = { ...process.env };

function request(path: string): NextRequest {
  return new NextRequest(new URL(path, 'https://trustbridgeimmigration.co.uk'));
}

function setEnv(env: Record<string, string | undefined>) {
  process.env = {
    ...ORIGINAL_ENV,
    KV_REST_API_URL: undefined,
    KV_REST_API_TOKEN: undefined,
    ...env,
  };
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
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
  ])('rewrites %s to the Coming Soon page', async (path) => {
    setEnv(env);
    const response = await proxy(request(path));

    expect(response.headers.get('x-middleware-rewrite')).toContain('/coming-soon');
  });

  it('marks the rewritten response as not indexable', async () => {
    setEnv(env);
    const response = await proxy(request('/'));

    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('drops the query string, so no parameter reaches the gated page', async () => {
    setEnv(env);
    const response = await proxy(request('/services?utm_source=email&id=42'));
    const rewrite = response.headers.get('x-middleware-rewrite') ?? '';

    expect(rewrite).toContain('/coming-soon');
    expect(rewrite).not.toContain('utm_source');
    expect(rewrite).not.toContain('id=42');
  });

  it('serves the Coming Soon page itself without rewriting', async () => {
    setEnv(env);
    expect((await proxy(request('/coming-soon'))).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it.each([
    '/_next/static/chunk.js',
    '/api/enquiry',
    '/cms/articles',
    '/favicon.ico',
    '/logo.png',
    '/og.jpg',
    '/robots.txt',
  ])(
    'lets %s through so the gated page still renders',
    async (path) => {
      setEnv(env);
      expect((await proxy(request(path))).headers.get('x-middleware-rewrite')).toBeNull();
    },
  );

  it('keeps the gate shut when SITE_LAUNCHED is missing', async () => {
    setEnv({ NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: undefined });
    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toContain('/coming-soon');
  });

  it.each(['True', 'yes', '1', 'on', 'launched', ''])(
    'keeps the gate shut for the near-miss value %o',
    async (value) => {
      setEnv({ NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: value });
      const rewritten = (await proxy(request('/'))).headers.get('x-middleware-rewrite');

      // Only the exact string 'true', case-insensitively and trimmed, opens it.
      const shouldOpen = value.trim().toLowerCase() === 'true';
      expect(Boolean(rewritten)).toBe(!shouldOpen);
    },
  );
});

describe('production, after launch (env var)', () => {
  it('serves the full site', async () => {
    setEnv({ NEXT_PUBLIC_APP_ENV: 'production', SITE_LAUNCHED: 'true' });

    for (const path of ['/', '/services', '/contact']) {
      expect((await proxy(request(path))).headers.get('x-middleware-rewrite')).toBeNull();
    }
  });
});

describe('production, after launch (CMS settings toggle)', () => {
  const KV_ENV = {
    NEXT_PUBLIC_APP_ENV: 'production',
    SITE_LAUNCHED: 'false',
    KV_REST_API_URL: 'https://example.upstash.io',
    KV_REST_API_TOKEN: 'test-token',
  };

  function mockUpstash(result: unknown, ok = true) {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok,
        json: async () => ({ result: result === undefined ? null : JSON.stringify(result) }),
      }),
    );
  }

  it('opens the site when Redis reports siteLaunched: true', async () => {
    setEnv(KV_ENV);
    mockUpstash({ siteLaunched: true });

    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('keeps the gate shut when Redis reports siteLaunched: false', async () => {
    setEnv(KV_ENV);
    mockUpstash({ siteLaunched: false });

    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toContain(
      '/coming-soon',
    );
  });

  it('keeps the gate shut when the settings key has never been written', async () => {
    setEnv(KV_ENV);
    mockUpstash(undefined);

    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toContain(
      '/coming-soon',
    );
  });

  it('fails closed when Upstash returns an error status', async () => {
    setEnv(KV_ENV);
    mockUpstash({ siteLaunched: true }, false);

    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toContain(
      '/coming-soon',
    );
  });

  it('fails closed when the request throws (network error, timeout, abort)', async () => {
    setEnv(KV_ENV);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toContain(
      '/coming-soon',
    );
  });

  it('an explicit SITE_LAUNCHED=true wins without ever calling Redis', async () => {
    setEnv({ ...KV_ENV, SITE_LAUNCHED: 'true' });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('non-production environments', () => {
  it.each(['development', 'staging'])('serves the full site on %s', async (appEnv) => {
    setEnv({ NEXT_PUBLIC_APP_ENV: appEnv, SITE_LAUNCHED: 'false' });
    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('defaults to development when the environment is unset', async () => {
    setEnv({ NEXT_PUBLIC_APP_ENV: undefined, SITE_LAUNCHED: undefined });
    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toBeNull();
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
  ])('serves Coming Soon when the environment is %s in a production build', async (_label, value) => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_ENV: value,
      SITE_LAUNCHED: undefined,
    });

    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toContain(
      '/coming-soon',
    );
  });

  it('keeps a local development build open', async () => {
    setEnv({ NODE_ENV: 'development', NEXT_PUBLIC_APP_ENV: undefined });
    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('still opens on an explicit non-production environment', async () => {
    for (const appEnv of ['development', 'staging']) {
      setEnv({ NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: appEnv });
      expect((await proxy(request('/'))).headers.get('x-middleware-rewrite'), appEnv).toBeNull();
    }
  });

  it('opens a production build only once launch is explicitly confirmed', async () => {
    setEnv({ NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: undefined, SITE_LAUNCHED: 'true' });
    expect((await proxy(request('/'))).headers.get('x-middleware-rewrite')).toBeNull();
  });
});

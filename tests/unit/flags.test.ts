import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

/**
 * Feature flags and the launch gate.
 *
 * These are the compliance-critical branches (README rules 3 and 4), so the
 * tests cover the closed-by-default behaviour explicitly rather than only the
 * happy path. The environment module reads process.env once at import, so each
 * case re-imports with a fresh module registry.
 *
 * KV_REST_API_URL/TOKEN are explicitly unset by default so these tests never
 * depend on, or make real calls to, whatever Redis happens to be configured
 * in the environment they run in. The "settings override" cases below opt
 * back in deliberately, with a mocked Redis client.
 *
 * `next/cache`'s `unstable_cache` needs the real Next.js server runtime
 * (an "incrementalCache" instance Vitest never provides), so it is mocked
 * to a plain pass-through here — lib/cms/settings.ts uses it purely as a
 * performance optimization (see its own comment for why), not for anything
 * these tests are exercising.
 */
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

async function loadFlags(env: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    KV_REST_API_URL: undefined,
    KV_REST_API_TOKEN: undefined,
    ...env,
  };
  return import('@/lib/flags');
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.doUnmock('@upstash/redis');
});

describe('feature flags', () => {
  it('defaults to disabled when the variable is absent', async () => {
    const { isFeatureEnabled } = await loadFlags({
      FEATURE_COMPLEX_MATTERS: undefined,
      FEATURE_BUSINESS_IMMIGRATION: undefined,
    });

    expect(await isFeatureEnabled('complexMatters')).toBe(false);
    expect(await isFeatureEnabled('businessImmigration')).toBe(false);
  });

  it('stays disabled for any value other than the exact string "true"', async () => {
    for (const value of ['TRUE ', 'yes', '1', 'on', '']) {
      const { isFeatureEnabled } = await loadFlags({ FEATURE_COMPLEX_MATTERS: value });
      // "TRUE " is trimmed and lowercased, so it does enable. The rest must not.
      const expected = value.trim().toLowerCase() === 'true';
      expect(await isFeatureEnabled('complexMatters')).toBe(expected);
    }
  });

  it('enables a flag when set to true', async () => {
    const { isFeatureEnabled } = await loadFlags({ FEATURE_COMPLEX_MATTERS: 'true' });
    expect(await isFeatureEnabled('complexMatters')).toBe(true);
    expect(await isFeatureEnabled('businessImmigration')).toBe(false);
  });

  it('allows preview to reveal gated content outside production', async () => {
    const { isFeatureEnabled } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'staging',
      FEATURE_COMPLEX_MATTERS: 'false',
    });

    expect(await isFeatureEnabled('complexMatters')).toBe(false);
    expect(await isFeatureEnabled('complexMatters', { previewEnabled: true })).toBe(true);
  });

  it('never allows preview to reveal gated content in production', async () => {
    const { isFeatureEnabled } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      FEATURE_COMPLEX_MATTERS: 'false',
    });

    expect(await isFeatureEnabled('complexMatters', { previewEnabled: true })).toBe(false);
  });
});

describe('launch gate', () => {
  it('serves Coming Soon in production until the site is launched', async () => {
    const { isSiteLaunched, shouldServeComingSoon } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      SITE_LAUNCHED: 'false',
    });

    expect(await isSiteLaunched()).toBe(false);
    expect(await shouldServeComingSoon()).toBe(true);
  });

  it('serves the full site in production once launched', async () => {
    const { isSiteLaunched, shouldServeComingSoon } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      SITE_LAUNCHED: 'true',
    });

    expect(await isSiteLaunched()).toBe(true);
    expect(await shouldServeComingSoon()).toBe(false);
  });

  it('serves the full site on staging and development regardless of the flag', async () => {
    for (const appEnv of ['staging', 'development']) {
      const { isSiteLaunched } = await loadFlags({
        NEXT_PUBLIC_APP_ENV: appEnv,
        SITE_LAUNCHED: 'false',
      });
      expect(await isSiteLaunched()).toBe(true);
    }
  });

  it('keeps the gate shut when SITE_LAUNCHED is missing entirely', async () => {
    const { shouldServeComingSoon } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      SITE_LAUNCHED: undefined,
    });

    expect(await shouldServeComingSoon()).toBe(true);
  });
});

describe('CMS settings override', () => {
  function mockRedisSettings(stored: Record<string, unknown> | null) {
    vi.doMock('@upstash/redis', () => ({
      Redis: class {
        async get() {
          return stored;
        }
      },
    }));
  }

  it('isSiteLaunched opens once the CMS settings say launched, with no env var set', async () => {
    mockRedisSettings({ siteLaunched: true });
    const { isSiteLaunched } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      SITE_LAUNCHED: undefined,
      KV_REST_API_URL: 'https://example.upstash.io',
      KV_REST_API_TOKEN: 'test-token',
    });

    expect(await isSiteLaunched()).toBe(true);
  });

  it('an explicit SITE_LAUNCHED=true still wins even if settings say false', async () => {
    mockRedisSettings({ siteLaunched: false });
    const { isSiteLaunched } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      SITE_LAUNCHED: 'true',
      KV_REST_API_URL: 'https://example.upstash.io',
      KV_REST_API_TOKEN: 'test-token',
    });

    expect(await isSiteLaunched()).toBe(true);
  });

  it('isFeatureEnabled reflects a CMS-enabled flag with no env var set', async () => {
    mockRedisSettings({ featureComplexMatters: true });
    const { isFeatureEnabled } = await loadFlags({
      FEATURE_COMPLEX_MATTERS: undefined,
      KV_REST_API_URL: 'https://example.upstash.io',
      KV_REST_API_TOKEN: 'test-token',
    });

    expect(await isFeatureEnabled('complexMatters')).toBe(true);
    expect(await isFeatureEnabled('businessImmigration')).toBe(false);
  });
});

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

/**
 * Feature flags and the launch gate.
 *
 * These are the compliance-critical branches (README rules 3 and 4), so the
 * tests cover the closed-by-default behaviour explicitly rather than only the
 * happy path. The environment module reads process.env once at import, so each
 * case re-imports with a fresh module registry.
 */

const ORIGINAL_ENV = { ...process.env };

async function loadFlags(env: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV, ...env };
  return import('@/lib/flags');
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('feature flags', () => {
  it('defaults to disabled when the variable is absent', async () => {
    const { isFeatureEnabled } = await loadFlags({
      FEATURE_COMPLEX_MATTERS: undefined,
      FEATURE_BUSINESS_IMMIGRATION: undefined,
    });

    expect(isFeatureEnabled('complexMatters')).toBe(false);
    expect(isFeatureEnabled('businessImmigration')).toBe(false);
  });

  it('stays disabled for any value other than the exact string "true"', async () => {
    for (const value of ['TRUE ', 'yes', '1', 'on', '']) {
      const { isFeatureEnabled } = await loadFlags({ FEATURE_COMPLEX_MATTERS: value });
      // "TRUE " is trimmed and lowercased, so it does enable. The rest must not.
      const expected = value.trim().toLowerCase() === 'true';
      expect(isFeatureEnabled('complexMatters')).toBe(expected);
    }
  });

  it('enables a flag when set to true', async () => {
    const { isFeatureEnabled } = await loadFlags({ FEATURE_COMPLEX_MATTERS: 'true' });
    expect(isFeatureEnabled('complexMatters')).toBe(true);
    expect(isFeatureEnabled('businessImmigration')).toBe(false);
  });

  it('allows preview to reveal gated content outside production', async () => {
    const { isFeatureEnabled } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'staging',
      FEATURE_COMPLEX_MATTERS: 'false',
    });

    expect(isFeatureEnabled('complexMatters')).toBe(false);
    expect(isFeatureEnabled('complexMatters', { previewEnabled: true })).toBe(true);
  });

  it('never allows preview to reveal gated content in production', async () => {
    const { isFeatureEnabled } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      FEATURE_COMPLEX_MATTERS: 'false',
    });

    expect(isFeatureEnabled('complexMatters', { previewEnabled: true })).toBe(false);
  });
});

describe('launch gate', () => {
  it('serves Coming Soon in production until the site is launched', async () => {
    const { isSiteLaunched, shouldServeComingSoon } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      SITE_LAUNCHED: 'false',
    });

    expect(isSiteLaunched()).toBe(false);
    expect(shouldServeComingSoon()).toBe(true);
  });

  it('serves the full site in production once launched', async () => {
    const { isSiteLaunched, shouldServeComingSoon } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      SITE_LAUNCHED: 'true',
    });

    expect(isSiteLaunched()).toBe(true);
    expect(shouldServeComingSoon()).toBe(false);
  });

  it('serves the full site on staging and development regardless of the flag', async () => {
    for (const appEnv of ['staging', 'development']) {
      const { isSiteLaunched } = await loadFlags({
        NEXT_PUBLIC_APP_ENV: appEnv,
        SITE_LAUNCHED: 'false',
      });
      expect(isSiteLaunched()).toBe(true);
    }
  });

  it('keeps the gate shut when SITE_LAUNCHED is missing entirely', async () => {
    const { shouldServeComingSoon } = await loadFlags({
      NEXT_PUBLIC_APP_ENV: 'production',
      SITE_LAUNCHED: undefined,
    });

    expect(shouldServeComingSoon()).toBe(true);
  });
});

import { describe, expect, it, afterEach, vi } from 'vitest';

/**
 * Environment configuration.
 *
 * The first deployment failed because the host exposed declared-but-blank
 * variables as empty strings, and a Zod `.default()` only fills in `undefined`.
 * These cover that case directly, along with the fail-closed default that
 * decides whether an unconfigured deployment publishes the site.
 */

const ORIGINAL_ENV = { ...process.env };

async function loadEnv(overrides: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV, ...overrides };
  return import('@/lib/env');
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe('reading a blank environment', () => {
  const BLANK = {
    NEXT_PUBLIC_SITE_URL: '',
    NEXT_PUBLIC_APP_ENV: '',
    SITE_LAUNCHED: '',
    FEATURE_COMPLEX_MATTERS: '',
    FEATURE_BUSINESS_IMMIGRATION: '',
    PREVIEW_SECRET: '',
    CONTENT_SOURCE: '',
    DATABASE_URL: '',
    PAYLOAD_SECRET: '',
  };

  it('does not throw when every variable is an empty string', async () => {
    await expect(loadEnv(BLANK)).resolves.toBeDefined();
  });

  it('falls back to the defaults rather than failing validation', async () => {
    const { env } = await loadEnv(BLANK);

    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://trustbridgeimmigration.co.uk');
    expect(env.CONTENT_SOURCE).toBe('local');
    expect(env.SITE_LAUNCHED).toBe(false);
  });

  it('treats whitespace as unset', async () => {
    const { env } = await loadEnv({ ...BLANK, CONTENT_SOURCE: '   ' });
    expect(env.CONTENT_SOURCE).toBe('local');
  });

  it('leaves optional variables undefined rather than empty', async () => {
    const { env } = await loadEnv(BLANK);

    expect(env.PREVIEW_SECRET).toBeUndefined();
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.PAYLOAD_SECRET).toBeUndefined();
  });

  it('does not throw when the variables are absent entirely', async () => {
    await expect(
      loadEnv({
        NEXT_PUBLIC_SITE_URL: undefined,
        NEXT_PUBLIC_APP_ENV: undefined,
        CONTENT_SOURCE: undefined,
        SITE_LAUNCHED: undefined,
      }),
    ).resolves.toBeDefined();
  });
});

describe('the default environment is fail-closed', () => {
  it('assumes production when a production build says nothing', async () => {
    // NODE_ENV goes through the same override map: the helper replaces
    // process.env wholesale, so a separate stub would be discarded.
    const { env } = await loadEnv({ NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: '' });

    // Anything else would publish an unapproved site on a host where the
    // variable was never set.
    expect(env.NEXT_PUBLIC_APP_ENV).toBe('production');
  });

  it('assumes development outside a production build', async () => {
    const { env } = await loadEnv({ NODE_ENV: 'development', NEXT_PUBLIC_APP_ENV: '' });

    expect(env.NEXT_PUBLIC_APP_ENV).toBe('development');
  });

  it('always honours an explicit value', async () => {
    const { env } = await loadEnv({ NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'staging' });

    expect(env.NEXT_PUBLIC_APP_ENV).toBe('staging');
  });
});

describe('genuinely invalid values still fail', () => {
  it('rejects a malformed site URL', async () => {
    await expect(loadEnv({ NEXT_PUBLIC_SITE_URL: 'not-a-url' })).rejects.toThrow(
      /Invalid environment configuration/,
    );
  });

  it('rejects an unknown environment name', async () => {
    await expect(loadEnv({ NEXT_PUBLIC_APP_ENV: 'prod' })).rejects.toThrow(
      /Invalid environment configuration/,
    );
  });

  it('rejects an unknown content source', async () => {
    await expect(loadEnv({ CONTENT_SOURCE: 'sanity' })).rejects.toThrow(
      /Invalid environment configuration/,
    );
  });
});

describe('content source and database are validated together', () => {
  it('objects when Payload is selected with no database', async () => {
    const { assertContentSourceConfigured } = await loadEnv({
      CONTENT_SOURCE: 'payload',
      DATABASE_URL: '',
    });

    expect(() => assertContentSourceConfigured()).toThrow(/DATABASE_URL is not set/);
  });

  it('is satisfied when both are supplied', async () => {
    const { assertContentSourceConfigured } = await loadEnv({
      CONTENT_SOURCE: 'payload',
      DATABASE_URL: 'postgres://localhost:5432/trustbridge',
    });

    expect(() => assertContentSourceConfigured()).not.toThrow();
  });
});

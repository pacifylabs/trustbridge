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
    ENQUIRY_INBOX: '',
    ENQUIRY_FROM_EMAIL: '',
    RESEND_API_KEY: '',
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: '',
    RECAPTCHA_SECRET_KEY: '',
  };

  it('does not throw when every variable is an empty string', async () => {
    await expect(loadEnv(BLANK)).resolves.toBeDefined();
  });

  it('falls back to the defaults rather than failing validation', async () => {
    const { env } = await loadEnv(BLANK);

    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://trustbridgeimmigration.co.uk');
    expect(env.ENQUIRY_INBOX).toBe('info@trustbridgeimmigration.co.uk');
    expect(env.SITE_LAUNCHED).toBe(false);
  });

  it('treats whitespace as unset', async () => {
    const { env } = await loadEnv({ ...BLANK, ENQUIRY_INBOX: '   ' });
    expect(env.ENQUIRY_INBOX).toBe('info@trustbridgeimmigration.co.uk');
  });

  it('leaves optional variables undefined rather than empty', async () => {
    const { env } = await loadEnv(BLANK);

    expect(env.PREVIEW_SECRET).toBeUndefined();
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.RECAPTCHA_SECRET_KEY).toBeUndefined();
    expect(env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY).toBeUndefined();
  });

  it('does not throw when the variables are absent entirely', async () => {
    await expect(
      loadEnv({
        NEXT_PUBLIC_SITE_URL: undefined,
        NEXT_PUBLIC_APP_ENV: undefined,
        ENQUIRY_INBOX: undefined,
        SITE_LAUNCHED: undefined,
      }),
    ).resolves.toBeDefined();
  });
});

describe('enquiry delivery configuration', () => {
  it('is not configured when Resend or reCAPTCHA keys are missing', async () => {
    const { isEnquiryDeliveryConfigured } = await loadEnv({
      RESEND_API_KEY: '',
      RECAPTCHA_SECRET_KEY: '',
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: '',
    });

    expect(isEnquiryDeliveryConfigured()).toBe(false);
  });

  it('is configured once every key is present', async () => {
    const { isEnquiryDeliveryConfigured } = await loadEnv({
      RESEND_API_KEY: 're_test_key',
      RECAPTCHA_SECRET_KEY: 'recaptcha_secret',
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: 'recaptcha_site_key',
    });

    expect(isEnquiryDeliveryConfigured()).toBe(true);
  });

  it('rejects an invalid enquiry inbox address', async () => {
    await expect(loadEnv({ ENQUIRY_INBOX: 'not-an-email' })).rejects.toThrow(
      /Invalid environment configuration/,
    );
  });
});

describe('Calendly booking configuration', () => {
  it('leaves the Calendly URL undefined when unset', async () => {
    const { env } = await loadEnv({ NEXT_PUBLIC_CALENDLY_URL: '' });
    expect(env.NEXT_PUBLIC_CALENDLY_URL).toBeUndefined();
  });

  it('accepts a configured Calendly event URL', async () => {
    const { env } = await loadEnv({
      NEXT_PUBLIC_CALENDLY_URL: 'https://calendly.com/trustbridge/consultation',
    });
    expect(env.NEXT_PUBLIC_CALENDLY_URL).toBe('https://calendly.com/trustbridge/consultation');
  });

  it('rejects a malformed Calendly URL rather than shipping a broken embed', async () => {
    await expect(loadEnv({ NEXT_PUBLIC_CALENDLY_URL: 'not-a-url' })).rejects.toThrow(
      /Invalid environment configuration/,
    );
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

  it('rejects an invalid Resend "from" address', async () => {
    await expect(loadEnv({ ENQUIRY_FROM_EMAIL: 'not-an-email' })).rejects.toThrow(
      /Invalid environment configuration/,
    );
  });
});

import { describe, expect, it, vi, afterEach } from 'vitest';

/**
 * Admin session signing.
 *
 * A forged or tampered cookie must never verify, and a genuine one must
 * survive a round trip. Both env vars are loaded fresh per test the same way
 * env.test.ts does it, since `lib/env` reads `process.env` once at import.
 */

const ORIGINAL_ENV = { ...process.env };

async function loadSession(overrides: Record<string, string | undefined> = {}) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    ADMIN_PASSWORD: 'a-strong-shared-password',
    ADMIN_SESSION_SECRET: 'a-long-random-secret-key',
    ...overrides,
  };
  return import('@/lib/cms/session');
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('verifyPassword', () => {
  it('accepts the configured password', async () => {
    const { verifyPassword } = await loadSession();
    expect(verifyPassword('a-strong-shared-password')).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const { verifyPassword } = await loadSession();
    expect(verifyPassword('wrong-password')).toBe(false);
  });

  it('rejects everything when auth is not configured', async () => {
    const { verifyPassword } = await loadSession({ ADMIN_PASSWORD: undefined });
    expect(verifyPassword('a-strong-shared-password')).toBe(false);
  });
});

describe('session tokens', () => {
  it('verifies a token it just issued', async () => {
    const { createSessionToken, verifySessionToken } = await loadSession();
    expect(verifySessionToken(createSessionToken())).toBe(true);
  });

  it('rejects a missing token', async () => {
    const { verifySessionToken } = await loadSession();
    expect(verifySessionToken(undefined)).toBe(false);
    expect(verifySessionToken(null)).toBe(false);
  });

  it('rejects a malformed token', async () => {
    const { verifySessionToken } = await loadSession();
    expect(verifySessionToken('not-a-real-token')).toBe(false);
  });

  it('rejects a token signed with a different secret', async () => {
    const issuer = await loadSession({ ADMIN_SESSION_SECRET: 'secret-one' });
    const token = issuer.createSessionToken();

    const verifier = await loadSession({ ADMIN_SESSION_SECRET: 'secret-two' });
    expect(verifier.verifySessionToken(token)).toBe(false);
  });

  it('rejects a token with a tampered expiry', async () => {
    const { createSessionToken, verifySessionToken } = await loadSession();
    const token = createSessionToken();
    const [, signature] = token.split('.');
    const forged = `${Date.now() + 1_000_000_000}.${signature}`;

    expect(verifySessionToken(forged)).toBe(false);
  });

  it('rejects an expired token', async () => {
    vi.useFakeTimers();
    try {
      const { createSessionToken, verifySessionToken } = await loadSession();
      const token = createSessionToken();

      vi.advanceTimersByTime(13 * 60 * 60 * 1000); // past the 12-hour lifetime
      expect(verifySessionToken(token)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects everything when auth is not configured', async () => {
    const configured = await loadSession();
    const token = configured.createSessionToken();

    const unconfigured = await loadSession({ ADMIN_SESSION_SECRET: undefined });
    expect(unconfigured.verifySessionToken(token)).toBe(false);
  });
});

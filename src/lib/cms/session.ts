import { createHmac, timingSafeEqual } from 'node:crypto';
import { env, isAdminAuthConfigured } from '@/lib/env';

/**
 * Admin session cookie.
 *
 * A signed, stateless token rather than a server-side session store: there is
 * one shared editor password and no per-user data to look up, so a database
 * round trip on every admin request would buy nothing. The signature is what
 * stops a visitor from forging or extending their own cookie.
 */
export const ADMIN_SESSION_COOKIE = 'tb_cms_session';
const SESSION_LIFETIME_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(payload: string): string {
  return createHmac('sha256', env.ADMIN_SESSION_SECRET!).update(payload).digest('base64url');
}

export function createSessionToken(): string {
  const payload = String(Date.now() + SESSION_LIFETIME_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!isAdminAuthConfigured() || !token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export function verifyPassword(candidate: string): boolean {
  if (!isAdminAuthConfigured()) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(env.ADMIN_PASSWORD!);
  // Different-length buffers still need a constant-time comparison against
  // *something*, or the length mismatch itself becomes a timing signal.
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

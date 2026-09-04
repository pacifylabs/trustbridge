import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from './session';

/** For server components / layouts, e.g. gating the `/admin` route group. */
export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

/** For route handlers, which read cookies off the request rather than `next/headers`. */
export function hasAdminSessionFromRequest(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

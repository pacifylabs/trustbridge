import { NextResponse, type NextRequest } from 'next/server';

/**
 * Launch gate (README rule 3).
 *
 * On production, every route is rewritten to the Coming Soon page until the
 * site is launched. An unset environment is treated as production, so a
 * deployment nobody configured stays behind the gate rather than publishing
 * the site. Development and staging always serve the full site;
 * staging is protected at the hosting layer instead, which handles credentials
 * far more safely than proxy can.
 *
 * "Launched" can be set two ways, checked in this order:
 *   1. SITE_LAUNCHED=true (env var, requires a redeploy) — the permanent,
 *      Redis-independent setting once the practice is genuinely ready.
 *   2. The /cms/settings "Go live" toggle (Redis-backed, no redeploy).
 *
 * Environment variables are read directly here rather than through the typed
 * config module, and the Redis check below is a minimal hand-rolled fetch
 * rather than importing lib/cms/settings.ts: a throwing module-level
 * validation (env.ts parses and throws at import time) would take the whole
 * site down on every request rather than failing one. Both reads are
 * deliberately closed by default: a malformed env var or an unreachable
 * Redis both keep the gate shut.
 */
/*
  /cms is allowed through so the practice can draft and manage Resources
  articles before launch; it carries its own password gate and is excluded
  from search indexing via its own metadata, independent of this one.
*/
const ALLOWED_PREFIXES = [
  '/_next',
  '/api',
  '/cms',
  '/favicon',
  '/logo.png',
  '/logo-horizontal.png',
  '/robots.txt',
  '/sitemap.xml',
];

const SETTINGS_FETCH_TIMEOUT_MS = 1000;

/**
 * Reads the "siteLaunched" CMS setting directly from Upstash's REST API.
 * Returns false for anything short of an explicit `true` — no Redis
 * configured, a network error, a timeout, or a settings document that has
 * never been written — so a Redis outage closes the gate rather than
 * silently publishing an unapproved site to real visitors.
 */
async function isLaunchedInSettings(): Promise<boolean> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SETTINGS_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${url}/get/cms:settings`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      // Next.js caches an unconfigured fetch indefinitely (its Data Cache),
      // which would freeze this launch check at whatever value it first saw
      // — the opposite of the instant, no-redeploy toggle this exists for.
      cache: 'no-store',
    });
    if (!response.ok) return false;

    const { result } = (await response.json()) as { result: string | null };
    if (!result) return false;

    const settings = JSON.parse(result) as { siteLaunched?: unknown };
    return settings.siteLaunched === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  /*
    Fail-closed. A blank or missing value used to leave `appEnv` as
    'development', which opened the gate and would have published an
    unapproved site on any host where the variable was not set. Anything other
    than an explicit non-production value is now treated as production.
  */
  const declaredEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim();
  const appEnv =
    declaredEnv || (process.env.NODE_ENV === 'production' ? 'production' : 'development');

  if (appEnv !== 'production') {
    return NextResponse.next();
  }

  const envLaunched = (process.env.SITE_LAUNCHED ?? '').trim().toLowerCase() === 'true';
  const { pathname } = request.nextUrl;

  // /cms and static assets must work before launch regardless of settings,
  // so this is checked before the (comparatively slow) settings lookup.
  if (pathname === '/coming-soon' || ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const launched = envLaunched || (await isLaunchedInSettings());

  if (launched) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/coming-soon';
  url.search = '';

  const response = NextResponse.rewrite(url);
  // An unlaunched site must not be indexed, whatever a crawler finds.
  response.headers.set('x-robots-tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

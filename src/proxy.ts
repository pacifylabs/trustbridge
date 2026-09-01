import { NextResponse, type NextRequest } from 'next/server';

/**
 * Launch gate (README rule 3).
 *
 * On production, every route is rewritten to the Coming Soon page until
 * SITE_LAUNCHED is true. An unset environment is treated as production, so a
 * deployment nobody configured stays behind the gate rather than publishing
 * the site. Development and staging always serve the full site;
 * staging is protected at the hosting layer instead, which handles credentials
 * far more safely than middleware can.
 *
 * The environment is read directly here rather than through the typed config
 * module: the proxy runs on the edge runtime, where a throwing module-level
 * validation would take the whole site down rather than failing one request.
 * The parsing is deliberately closed by default, so anything other than the
 * exact string 'true' keeps the gate shut.
 */
const ALLOWED_PREFIXES = ['/_next', '/api', '/favicon', '/logo.png', '/robots.txt', '/sitemap.xml'];

export function proxy(request: NextRequest): NextResponse {
  /*
    Fail-closed. A blank or missing value used to leave `appEnv` as
    'development', which opened the gate and would have published an
    unapproved site on any host where the variable was not set. Anything other
    than an explicit non-production value is now treated as production.
  */
  const declaredEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim();
  const appEnv =
    declaredEnv || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  const launched = (process.env.SITE_LAUNCHED ?? '').trim().toLowerCase() === 'true';

  if (appEnv !== 'production' || launched) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/coming-soon' || ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
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

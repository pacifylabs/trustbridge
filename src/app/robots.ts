import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * Robots directives.
 *
 * Disallows everything until the client approves launch, so an unlaunched site
 * cannot be indexed even if a crawler reaches it (README rule 3).
 */
export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const launched = env.NEXT_PUBLIC_APP_ENV !== 'production' || env.SITE_LAUNCHED;

  if (!launched) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
  };
}

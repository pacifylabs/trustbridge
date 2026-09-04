import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { isSiteLaunched } from '@/lib/flags';

/**
 * Robots directives.
 *
 * Disallows everything until the client approves launch, so an unlaunched site
 * cannot be indexed even if a crawler reaches it (README rule 3).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const launched = await isSiteLaunched();

  if (!launched) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/cms' }],
    sitemap: `${base}/sitemap.xml`,
  };
}

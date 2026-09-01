import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { getArticles, getLegalPages, getVisibleServices } from '@/lib/content';

/**
 * Sitemap.
 *
 * Built from the same visible-services list the pages use, so a feature-gated
 * route can never be advertised here while returning a 404. Returns nothing at
 * all until the site is launched (README rule 3).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');

  if (env.NEXT_PUBLIC_APP_ENV === 'production' && !env.SITE_LAUNCHED) {
    return [];
  }

  const [services, articles, legalPages] = await Promise.all([
    getVisibleServices(),
    getArticles(),
    getLegalPages(),
  ]);

  const staticRoutes = ['', '/about', '/services', '/team', '/resources', '/contact', '/book'];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...services.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${base}/resources/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
    ...legalPages.map((page) => ({
      url: `${base}/legal/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
}

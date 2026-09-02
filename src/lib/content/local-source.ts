import { SERVICES } from '@/content/services';
import { ARTICLES } from '@/content/articles';
import { ADVISERS, DEV_ADVISER_SEEDS } from '@/content/advisers';
import { LEGAL_PAGES } from '@/content/legal';
import type { Adviser, Article, ContentSource, LegalPage, Service } from './types';

/**
 * Local content source.
 *
 * Reads the content bundled with the repository. There is no CMS: articles,
 * services and adviser profiles are edited as code, by a developer, and
 * published through the normal deploy process.
 */

function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_APP_ENV === 'production';
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export const localContentSource: ContentSource = {
  name: 'local',

  async getServices(): Promise<readonly Service[]> {
    return [...SERVICES].sort((a, b) => a.order - b.order);
  },

  async getServiceBySlug(slug: string): Promise<Service | null> {
    return SERVICES.find((service) => service.slug === slug) ?? null;
  },

  async getArticles(): Promise<readonly Article[]> {
    return ARTICLES.filter((article) => {
      if (article.status !== 'published') return false;
      // Demonstration content never appears in production.
      if (article.isSample && isProduction()) return false;
      return true;
    }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const article = ARTICLES.find((entry) => entry.slug === slug);
    if (!article) return null;
    if (article.status !== 'published') return null;
    if (article.isSample && isProduction()) return null;
    return article;
  },

  async getAdvisers(): Promise<readonly Adviser[]> {
    // Seeds exist so the grid can be checked with content in it. They are
    // gated on NODE_ENV rather than on a flag, so there is no configuration
    // under which they can reach staging or production.
    if (ADVISERS.length === 0 && isDevelopment()) {
      return DEV_ADVISER_SEEDS;
    }
    return ADVISERS;
  },

  async getLegalPages(): Promise<readonly LegalPage[]> {
    return LEGAL_PAGES;
  },

  async getLegalPageBySlug(slug: string): Promise<LegalPage | null> {
    return LEGAL_PAGES.find((page) => page.slug === slug) ?? null;
  },
};

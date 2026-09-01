import type { Adviser, Article, ContentSource, LegalPage, Service } from './types';

/**
 * Payload content source.
 *
 * The seam for Phase 3's CMS. Each method will query the corresponding Payload
 * collection once the collections are provisioned against the project database.
 *
 * It throws rather than falling back to local content on purpose: a CMS that
 * silently serves stale bundled content is worse than one that fails, because
 * the client would have no way of telling that their edits were not appearing.
 */
function notProvisioned(collection: string): never {
  throw new Error(
    `Payload collection "${collection}" is not provisioned yet. ` +
      'Set CONTENT_SOURCE=local until the CMS is connected.',
  );
}

export const payloadContentSource: ContentSource = {
  name: 'payload',
  async getServices(): Promise<readonly Service[]> {
    return notProvisioned('services');
  },
  async getServiceBySlug(): Promise<Service | null> {
    return notProvisioned('services');
  },
  async getArticles(): Promise<readonly Article[]> {
    return notProvisioned('articles');
  },
  async getArticleBySlug(): Promise<Article | null> {
    return notProvisioned('articles');
  },
  async getAdvisers(): Promise<readonly Adviser[]> {
    return notProvisioned('advisers');
  },
  async getLegalPages(): Promise<readonly LegalPage[]> {
    return notProvisioned('legal-pages');
  },
  async getLegalPageBySlug(): Promise<LegalPage | null> {
    return notProvisioned('legal-pages');
  },
};

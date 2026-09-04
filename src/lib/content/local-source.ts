import { LEGAL_PAGES } from '@/content/legal';
import type { ContentSource, LegalPage } from './types';

/**
 * Local content source.
 *
 * Reads the content bundled with the repository: legal pages only, edited as
 * code by a developer and published through the normal deploy process.
 * Articles, adviser profiles, testimonials and services are not here — see
 * `lib/cms/articles.ts`, `lib/cms/advisers.ts`, `lib/cms/testimonials.ts` and
 * `lib/cms/services.ts`, which read from Redis and fall back to bundled
 * samples/content only when the CMS is unconfigured.
 */
export const localContentSource: ContentSource = {
  name: 'local',

  async getLegalPages(): Promise<readonly LegalPage[]> {
    return LEGAL_PAGES;
  },

  async getLegalPageBySlug(slug: string): Promise<LegalPage | null> {
    return LEGAL_PAGES.find((page) => page.slug === slug) ?? null;
  },
};

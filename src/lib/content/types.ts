/**
 * Content model.
 *
 * These types are the contract between the site and whatever supplies its
 * content. The local adapter satisfies them from files in `src/content`; the
 * Payload adapter will satisfy them from CMS collections. Pages depend on this
 * module only, so switching source is a configuration change (Phase 3).
 */

import type { FeatureFlag } from '../flags';

/** PRD §5 taxonomy. Nine categories; eight are published routes in v1. */
export type ServiceCategoryId =
  | 'family-partner'
  | 'visitor'
  | 'work'
  | 'business'
  | 'settlement'
  | 'citizenship'
  | 'eu-settlement-scheme'
  | 'status-support'
  | 'complex-matters';

/**
 * A photograph supplied with a piece of content.
 *
 * Dimensions are carried alongside the path so `next/image` can reserve the
 * right space and the page never reflows as artwork loads.
 */
export interface ContentImage {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface ServiceSection {
  readonly heading: string;
  readonly body: readonly string[];
  /** When set, the section renders only if the flag is enabled. */
  readonly requiresFeature?: FeatureFlag;
}

export interface ServiceFaq {
  readonly question: string;
  readonly answer: string;
}

export interface Service {
  readonly slug: string;
  readonly category: ServiceCategoryId;
  readonly title: string;
  /** Short label for cards and navigation, where the full title is too long. */
  readonly shortTitle: string;
  readonly summary: string;
  readonly icon: ServiceIcon;
  /** Card and page artwork. Optional: a service renders fully without one. */
  readonly image?: ContentImage;
  /** Lead paragraphs shown beneath the page title. */
  readonly intro: readonly string[];
  /** "Who this is for" list, rendered as an equal-height card grid. */
  readonly audience: readonly string[];
  /** What the service covers. */
  readonly includes: readonly string[];
  readonly sections: readonly ServiceSection[];
  readonly faqs: readonly ServiceFaq[];
  /** Ordering on the services index. */
  readonly order: number;
  /** When set, the whole page is gated on this flag. */
  readonly requiresFeature?: FeatureFlag;
  readonly seo: SeoMetadata;
}

export type ServiceIcon =
  | 'users'
  | 'plane'
  | 'briefcase'
  | 'building'
  | 'home'
  | 'award'
  | 'globe'
  | 'file-text'
  | 'scale';

export interface SeoMetadata {
  readonly title: string;
  readonly description: string;
}

export type ArticleCategory =
  | 'Working with us'
  | 'Immigration updates'
  | 'Guides'
  | 'Practice news';

export interface Article {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: ArticleCategory;
  readonly publishedAt: string;
  readonly updatedAt?: string;
  readonly author: string;
  readonly readingMinutes: number;
  /** Card and article artwork. Optional: an article renders fully without one. */
  readonly image?: ContentImage;
  /** Paragraphs and headings, in order. Kept simple until Payload supplies rich text. */
  readonly body: readonly ArticleBlock[];
  readonly status: 'draft' | 'published';
  /** Marks seeded demonstration content so it can be excluded from production. */
  readonly isSample: boolean;
  readonly seo: SeoMetadata;
}

export type ArticleBlock =
  | { readonly type: 'paragraph'; readonly text: string }
  | { readonly type: 'heading'; readonly text: string }
  | { readonly type: 'list'; readonly items: readonly string[] };

export interface Adviser {
  readonly slug: string;
  readonly name: string;
  readonly professionalTitle: string;
  /** Left empty until the client confirms regulatory wording (README rule 2). */
  readonly regulatoryLevel: string;
  readonly registrationNumber: string;
  readonly biography: readonly string[];
  readonly photoUrl?: string;
  readonly linkedServiceSlugs: readonly string[];
}

export interface LegalPage {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  /** Sections are structural until the client supplies final wording. */
  readonly sections: readonly { readonly heading: string; readonly body: string }[];
}

/**
 * The interface every content source implements. Adding Payload means adding
 * one file that satisfies this, not touching any page.
 */
export interface ContentSource {
  readonly name: 'local' | 'payload';
  getServices(): Promise<readonly Service[]>;
  getServiceBySlug(slug: string): Promise<Service | null>;
  getArticles(): Promise<readonly Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getAdvisers(): Promise<readonly Adviser[]>;
  getLegalPages(): Promise<readonly LegalPage[]>;
  getLegalPageBySlug(slug: string): Promise<LegalPage | null>;
}

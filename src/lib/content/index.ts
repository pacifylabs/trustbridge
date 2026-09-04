import { isFeatureEnabled, type FlagContext } from '../flags';
import { localContentSource } from './local-source';
import { listPublishedArticles, getPublishedArticle } from '@/lib/cms/articles';
import { listPublishedAdvisers } from '@/lib/cms/advisers';
import { listPublishedTestimonials } from '@/lib/cms/testimonials';
import { listPublishedServices, getPublishedServiceBySlug } from '@/lib/cms/services';
import { STATS, type StatItem } from '@/content/site';
import type {
  Adviser,
  Article,
  ContentSource,
  LegalPage,
  Service,
  ServiceSection,
  Testimonial,
} from './types';

export type * from './types';

/**
 * The single place the rest of the application asks for content.
 *
 * Pages call these functions and never touch a source directly. Services,
 * adviser profiles and legal pages are bundled with the repository and edited
 * by a developer; articles go through the lightweight Resources CMS instead
 * (`lib/cms/articles.ts`). Feature gating is applied here rather than in each
 * page, which is what stops a gated service leaking through a route that
 * forgot to check.
 */
function getSource(): ContentSource {
  return localContentSource;
}

/** Services the visitor is permitted to see, in display order. Backed by the Services CMS (Redis). */
export async function getVisibleServices(context?: FlagContext): Promise<readonly Service[]> {
  const services = await listPublishedServices();
  const visible = await Promise.all(
    services.map(async (service) => ({
      service,
      visible: !service.requiresFeature || (await isFeatureEnabled(service.requiresFeature, context)),
    })),
  );
  return visible.filter((entry) => entry.visible).map((entry) => entry.service);
}

/**
 * Returns a service only if it is visible. A gated service resolves to null so
 * the calling route can render a 404, which is what keeps an unlaunched page
 * genuinely unpublished rather than merely unlinked.
 */
export async function getVisibleServiceBySlug(
  slug: string,
  context?: FlagContext,
): Promise<Service | null> {
  const service = await getPublishedServiceBySlug(slug);
  if (!service) return null;
  if (service.requiresFeature && !(await isFeatureEnabled(service.requiresFeature, context))) return null;
  return service;
}

/** Sections of a service page that survive feature gating. */
export async function getVisibleSections(
  service: Service,
  context?: FlagContext,
): Promise<readonly ServiceSection[]> {
  const visible = await Promise.all(
    service.sections.map(async (section) => ({
      section,
      visible: !section.requiresFeature || (await isFeatureEnabled(section.requiresFeature, context)),
    })),
  );
  return visible.filter((entry) => entry.visible).map((entry) => entry.section);
}

/** Published articles, newest first. Backed by the Resources CMS (Redis). */
export async function getArticles(): Promise<readonly Article[]> {
  return listPublishedArticles();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getPublishedArticle(slug);
}

/** Published advisers. Backed by the Team CMS (Redis). */
export async function getAdvisers(): Promise<readonly Adviser[]> {
  return listPublishedAdvisers();
}

/** Published testimonials. Backed by the Testimonials CMS (Redis). */
export async function getTestimonials(): Promise<readonly Testimonial[]> {
  return listPublishedTestimonials();
}

export async function getLegalPages(): Promise<readonly LegalPage[]> {
  return getSource().getLegalPages();
}

export async function getLegalPageBySlug(slug: string): Promise<LegalPage | null> {
  return getSource().getLegalPageBySlug(slug);
}

export function getContentSourceName(): ContentSource['name'] {
  return getSource().name;
}

/**
 * The stat band's figures, with any derived value filled in.
 *
 * Kept here rather than in the component so the number of service areas is
 * read from the same gated list the services grid renders, and cannot drift
 * from it when a feature flag changes.
 */
export async function getStats(): Promise<readonly StatItem[]> {
  const visibleServiceCount = String((await getVisibleServices()).length);

  return STATS.map((stat) =>
    stat.derived === 'visibleServiceCount' ? { ...stat, value: visibleServiceCount } : stat,
  );
}

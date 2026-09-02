import { isFeatureEnabled, type FlagContext } from '../flags';
import { localContentSource } from './local-source';
import { STATS, type StatItem } from '@/content/site';
import type { Adviser, Article, ContentSource, LegalPage, Service, ServiceSection } from './types';

export type * from './types';

/**
 * The single place the rest of the application asks for content.
 *
 * Pages call these functions and never touch a source directly. Content is
 * bundled with the repository and edited by a developer; there is no CMS.
 * Feature gating is applied here rather than in each page, which is what stops
 * a gated service leaking through a route that forgot to check.
 */
function getSource(): ContentSource {
  return localContentSource;
}

/** Services the visitor is permitted to see, in display order. */
export async function getVisibleServices(context?: FlagContext): Promise<readonly Service[]> {
  const services = await getSource().getServices();
  return services.filter(
    (service) => !service.requiresFeature || isFeatureEnabled(service.requiresFeature, context),
  );
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
  const service = await getSource().getServiceBySlug(slug);
  if (!service) return null;
  if (service.requiresFeature && !isFeatureEnabled(service.requiresFeature, context)) return null;
  return service;
}

/** Sections of a service page that survive feature gating. */
export function getVisibleSections(
  service: Service,
  context?: FlagContext,
): readonly ServiceSection[] {
  return service.sections.filter(
    (section) => !section.requiresFeature || isFeatureEnabled(section.requiresFeature, context),
  );
}

export async function getArticles(): Promise<readonly Article[]> {
  return getSource().getArticles();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getSource().getArticleBySlug(slug);
}

export async function getAdvisers(): Promise<readonly Adviser[]> {
  return getSource().getAdvisers();
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

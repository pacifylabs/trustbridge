import { unstable_cache } from 'next/cache';
import { redis } from './redis';
import {
  splitLines,
  splitParagraphs,
  type ServiceInput,
} from '@/lib/validation/service';
import { SERVICES } from '@/content/services';
import type { Service } from '@/lib/content/types';

/**
 * Service storage (Services CMS).
 *
 * Mirrors lib/cms/advisers.ts: one JSON document per service, indexed by a
 * sorted set. Unlike advisers, the score is the service's own `order` field —
 * editors control display order directly rather than it following insertion.
 *
 * The ten services bundled in `content/services.ts` are the site's real,
 * already-live content, not sample data — `seedServicesIfEmpty` copies them
 * into Redis so the practice can start editing immediately, and
 * `listPublishedServices` falls back to that same bundle when Redis is
 * unconfigured, so nothing regresses before that happens.
 */

const INDEX_KEY = 'cms:services:index';
const serviceKey = (slug: string) => `cms:service:${slug}`;

function requireRedis() {
  if (!redis) {
    throw new Error('The Services CMS is not configured: set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }
  return redis;
}

export async function listAllServices(): Promise<Service[]> {
  const client = requireRedis();
  const slugs = await client.zrange<string[]>(INDEX_KEY, 0, -1);
  if (slugs.length === 0) return [];

  const services = await Promise.all(slugs.map((slug) => client.get<Service>(serviceKey(slug))));
  return services.filter((service): service is Service => service !== null);
}

export async function getServiceForAdmin(slug: string): Promise<Service | null> {
  return requireRedis().get<Service>(serviceKey(slug));
}

async function serviceSlugExists(slug: string): Promise<boolean> {
  const client = requireRedis();
  return (await client.exists(serviceKey(slug))) > 0;
}

async function writeService(service: Service): Promise<void> {
  const client = requireRedis();
  await client.set(serviceKey(service.slug), service);
  await client.zadd(INDEX_KEY, { score: service.order, member: service.slug });
}

function fromInput(input: ServiceInput): Omit<Service, 'slug'> {
  return {
    category: input.category,
    title: input.title,
    shortTitle: input.shortTitle,
    summary: input.summary,
    icon: input.icon,
    image: input.image,
    intro: splitParagraphs(input.intro),
    audience: splitLines(input.audience),
    includes: splitLines(input.includes),
    sections: input.sections.map((section) => ({
      heading: section.heading,
      body: splitParagraphs(section.body),
      requiresFeature: section.requiresFeature,
    })),
    faqs: input.faqs,
    order: input.order,
    requiresFeature: input.requiresFeature,
    status: input.status,
    seo: {
      title: input.seoTitle?.trim() || input.title,
      description: input.seoDescription?.trim() || input.summary,
    },
  };
}

export async function createService(input: ServiceInput): Promise<Service> {
  if (await serviceSlugExists(input.slug)) {
    throw new Error(`A service with the address "${input.slug}" already exists.`);
  }

  const service: Service = { slug: input.slug, ...fromInput(input) };
  await writeService(service);
  return service;
}

export async function updateService(originalSlug: string, input: ServiceInput): Promise<Service> {
  const client = requireRedis();
  const existing = await getServiceForAdmin(originalSlug);
  if (!existing) {
    throw new Error(`No service found with the address "${originalSlug}".`);
  }
  if (input.slug !== originalSlug && (await serviceSlugExists(input.slug))) {
    throw new Error(`A service with the address "${input.slug}" already exists.`);
  }

  const service: Service = { slug: input.slug, ...fromInput(input) };

  if (input.slug !== originalSlug) {
    await client.del(serviceKey(originalSlug));
    await client.zrem(INDEX_KEY, originalSlug);
  }

  await writeService(service);
  return service;
}

export async function deleteService(slug: string): Promise<void> {
  const client = requireRedis();
  await client.del(serviceKey(slug));
  await client.zrem(INDEX_KEY, slug);
}

/**
 * Loads the bundled services into Redis, but only when the index is empty —
 * safe to call repeatedly, and it never overwrites anything an editor has
 * already changed.
 */
export async function seedServicesIfEmpty(): Promise<number> {
  const client = requireRedis();
  const count = await client.zcard(INDEX_KEY);
  if (count > 0) return 0;

  for (const service of SERVICES) {
    await writeService(service);
  }
  return SERVICES.length;
}

function fallbackPublishedServices(): readonly Service[] {
  return [...SERVICES]
    .filter((service) => service.status === 'published')
    .sort((a, b) => a.order - b.order);
}

/**
 * Falls back to the bundled services whenever Redis has nothing at all —
 * unconfigured, or configured but not yet seeded — not only when it is
 * unconfigured. Unlike advisers/testimonials, the bundled services are the
 * site's real, already-live content, so a deployment that reaches production
 * before someone clicks "Load existing service pages" must still show them,
 * exactly as `RESOURCES_DATA_SOURCE=demo` protects articles from the same gap.
 */
async function readPublishedServicesUncached(): Promise<readonly Service[]> {
  if (!redis) return fallbackPublishedServices();

  const all = await listAllServices();
  if (all.length === 0) return fallbackPublishedServices();

  return all.filter((service) => service.status === 'published').sort((a, b) => a.order - b.order);
}

/**
 * Published services, in display order.
 *
 * Wrapped in `unstable_cache` for the same reason as `lib/cms/advisers.ts`:
 * an uncached Redis read here, reachable from the services index and every
 * service page during static generation, would force those pages to render
 * dynamically on every request instead of being served as static HTML.
 */
export const listPublishedServices = unstable_cache(
  readPublishedServicesUncached,
  ['cms-services-published-v1'],
  { tags: ['cms-services'], revalidate: 30 },
);

export async function getPublishedServiceBySlug(slug: string): Promise<Service | null> {
  const services = await listPublishedServices();
  return services.find((service) => service.slug === slug) ?? null;
}

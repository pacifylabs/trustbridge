import { unstable_cache } from 'next/cache';
import { redis } from './redis';
import { biographyToParagraphs, type AdviserInput } from '@/lib/validation/adviser';
import { ADVISERS, DEV_ADVISER_SEEDS } from '@/content/advisers';
import type { Adviser } from '@/lib/content/types';

/**
 * Adviser storage (Team CMS).
 *
 * Mirrors lib/cms/articles.ts: one JSON document per adviser, indexed by a
 * sorted set for ordering. Advisers have no natural publish date to order
 * by, so the index is scored by insertion order (a monotonic counter)
 * instead — newest-added last, which is a reasonable default for a small
 * team and simpler than tracking a synthetic timestamp.
 */

const INDEX_KEY = 'cms:advisers:index';
const adviserKey = (slug: string) => `cms:adviser:${slug}`;

function requireRedis() {
  if (!redis) {
    throw new Error('The Team CMS is not configured: set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }
  return redis;
}

/**
 * Ties in score break lexicographically by slug rather than colliding, so a
 * new entry reusing a count left behind by a deleted one is harmless — this
 * only needs to be roughly monotonic, not unique.
 */
async function nextOrder(client: NonNullable<typeof redis>): Promise<number> {
  return (await client.zcard(INDEX_KEY)) + 1;
}

export async function listAllAdvisers(): Promise<Adviser[]> {
  const client = requireRedis();
  const slugs = await client.zrange<string[]>(INDEX_KEY, 0, -1);
  if (slugs.length === 0) return [];

  const advisers = await Promise.all(slugs.map((slug) => client.get<Adviser>(adviserKey(slug))));
  return advisers.filter((adviser): adviser is Adviser => adviser !== null);
}

export async function getAdviserForAdmin(slug: string): Promise<Adviser | null> {
  return requireRedis().get<Adviser>(adviserKey(slug));
}

async function adviserSlugExists(slug: string): Promise<boolean> {
  const client = requireRedis();
  return (await client.exists(adviserKey(slug))) > 0;
}

async function writeAdviser(adviser: Adviser, order: number): Promise<void> {
  const client = requireRedis();
  await client.set(adviserKey(adviser.slug), adviser);
  await client.zadd(INDEX_KEY, { score: order, member: adviser.slug });
}

function fromInput(input: AdviserInput): Omit<Adviser, 'slug'> {
  return {
    name: input.name,
    professionalTitle: input.professionalTitle,
    regulatoryLevel: input.regulatoryLevel,
    registrationNumber: input.registrationNumber,
    biography: biographyToParagraphs(input.biography),
    photoUrl: input.photoUrl,
    linkedServiceSlugs: input.linkedServiceSlugs,
    status: input.status,
  };
}

export async function createAdviser(input: AdviserInput): Promise<Adviser> {
  const client = requireRedis();
  if (await adviserSlugExists(input.slug)) {
    throw new Error(`An adviser with the slug "${input.slug}" already exists.`);
  }

  const adviser: Adviser = { slug: input.slug, ...fromInput(input) };
  await writeAdviser(adviser, await nextOrder(client));
  return adviser;
}

export async function updateAdviser(originalSlug: string, input: AdviserInput): Promise<Adviser> {
  const client = requireRedis();
  const existing = await getAdviserForAdmin(originalSlug);
  if (!existing) {
    throw new Error(`No adviser found with the slug "${originalSlug}".`);
  }
  if (input.slug !== originalSlug && (await adviserSlugExists(input.slug))) {
    throw new Error(`An adviser with the slug "${input.slug}" already exists.`);
  }

  const order = (await client.zscore(INDEX_KEY, originalSlug)) ?? (await nextOrder(client));
  const adviser: Adviser = { slug: input.slug, ...fromInput(input) };

  if (input.slug !== originalSlug) {
    await client.del(adviserKey(originalSlug));
    await client.zrem(INDEX_KEY, originalSlug);
  }

  await writeAdviser(adviser, order);
  return adviser;
}

export async function deleteAdviser(slug: string): Promise<void> {
  const client = requireRedis();
  await client.del(adviserKey(slug));
  await client.zrem(INDEX_KEY, slug);
}

async function readPublishedAdvisersUncached(): Promise<readonly Adviser[]> {
  if (!redis) {
    if (ADVISERS.length === 0 && process.env.NODE_ENV === 'development') return DEV_ADVISER_SEEDS;
    return ADVISERS.filter((adviser) => adviser.status === 'published');
  }
  const all = await listAllAdvisers();
  return all.filter((adviser) => adviser.status === 'published');
}

/**
 * Published advisers, in the order they were added.
 *
 * Without Redis configured, falls back to the bundled ADVISERS (empty by
 * design until the practice supplies real profiles — README rule 6) and, in
 * local development only, the layout-testing seeds. Never a placeholder name
 * in production or staging, whichever source is in play.
 *
 * Wrapped in `unstable_cache` for the same reason as `lib/cms/settings.ts`:
 * an uncached Redis read here, reachable from the homepage and /team during
 * static generation, would force both pages to render dynamically on every
 * request instead of being served as static HTML.
 */
export const listPublishedAdvisers = unstable_cache(
  readPublishedAdvisersUncached,
  ['cms-advisers-published-v1'],
  { tags: ['cms-advisers'], revalidate: 30 },
);

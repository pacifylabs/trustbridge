import { unstable_cache } from 'next/cache';
import { redis } from './redis';
import type { TestimonialInput } from '@/lib/validation/testimonial';
import { DEV_TESTIMONIAL_SEEDS } from '@/content/pages';
import type { Testimonial } from '@/lib/content/types';

/**
 * Testimonial storage. Mirrors lib/cms/advisers.ts: one JSON document per
 * testimonial, indexed by a sorted set ordered by insertion.
 */

const INDEX_KEY = 'cms:testimonials:index';
const testimonialKey = (slug: string) => `cms:testimonial:${slug}`;

function requireRedis() {
  if (!redis) {
    throw new Error('The Testimonials CMS is not configured: set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }
  return redis;
}

async function nextOrder(client: NonNullable<typeof redis>): Promise<number> {
  return (await client.zcard(INDEX_KEY)) + 1;
}

export async function listAllTestimonials(): Promise<Testimonial[]> {
  const client = requireRedis();
  const slugs = await client.zrange<string[]>(INDEX_KEY, 0, -1);
  if (slugs.length === 0) return [];

  const testimonials = await Promise.all(slugs.map((slug) => client.get<Testimonial>(testimonialKey(slug))));
  return testimonials.filter((testimonial): testimonial is Testimonial => testimonial !== null);
}

export async function getTestimonialForAdmin(slug: string): Promise<Testimonial | null> {
  return requireRedis().get<Testimonial>(testimonialKey(slug));
}

async function testimonialSlugExists(slug: string): Promise<boolean> {
  const client = requireRedis();
  return (await client.exists(testimonialKey(slug))) > 0;
}

async function writeTestimonial(testimonial: Testimonial, order: number): Promise<void> {
  const client = requireRedis();
  await client.set(testimonialKey(testimonial.slug), testimonial);
  await client.zadd(INDEX_KEY, { score: order, member: testimonial.slug });
}

export async function createTestimonial(input: TestimonialInput): Promise<Testimonial> {
  const client = requireRedis();
  if (await testimonialSlugExists(input.slug)) {
    throw new Error(`A testimonial with the slug "${input.slug}" already exists.`);
  }

  const testimonial: Testimonial = { ...input };
  await writeTestimonial(testimonial, await nextOrder(client));
  return testimonial;
}

export async function updateTestimonial(originalSlug: string, input: TestimonialInput): Promise<Testimonial> {
  const client = requireRedis();
  const existing = await getTestimonialForAdmin(originalSlug);
  if (!existing) {
    throw new Error(`No testimonial found with the slug "${originalSlug}".`);
  }
  if (input.slug !== originalSlug && (await testimonialSlugExists(input.slug))) {
    throw new Error(`A testimonial with the slug "${input.slug}" already exists.`);
  }

  const order = (await client.zscore(INDEX_KEY, originalSlug)) ?? (await nextOrder(client));
  const testimonial: Testimonial = { ...input };

  if (input.slug !== originalSlug) {
    await client.del(testimonialKey(originalSlug));
    await client.zrem(INDEX_KEY, originalSlug);
  }

  await writeTestimonial(testimonial, order);
  return testimonial;
}

export async function deleteTestimonial(slug: string): Promise<void> {
  const client = requireRedis();
  await client.del(testimonialKey(slug));
  await client.zrem(INDEX_KEY, slug);
}

/**
 * Loads the layout-testing seed quotes into Redis as starter content, but
 * only when none exist yet — safe to call repeatedly, and it never
 * overwrites anything an editor has already written. Gives the team
 * something real to edit rather than a blank list, since these are already
 * compliant example copy (no outcome claims, no full names).
 */
export async function seedTestimonialsIfEmpty(): Promise<number> {
  const client = requireRedis();
  const count = await client.zcard(INDEX_KEY);
  if (count > 0) return 0;

  let order = 1;
  for (const testimonial of DEV_TESTIMONIAL_SEEDS) {
    await writeTestimonial(testimonial, order);
    order += 1;
  }
  return DEV_TESTIMONIAL_SEEDS.length;
}

async function readPublishedTestimonialsUncached(): Promise<readonly Testimonial[]> {
  if (!redis) {
    return process.env.NODE_ENV === 'development' ? DEV_TESTIMONIAL_SEEDS : [];
  }
  const all = await listAllTestimonials();
  return all.filter((testimonial) => testimonial.status === 'published');
}

/**
 * Published testimonials, in the order they were added.
 *
 * Without Redis configured, falls back to the bundled (empty) set and, in
 * local development only, the layout-testing seeds — see
 * `lib/cms/advisers.ts` for the same pattern, including why this is cached,
 * and the reasoning behind it.
 */
export const listPublishedTestimonials = unstable_cache(
  readPublishedTestimonialsUncached,
  ['cms-testimonials-published-v1'],
  { tags: ['cms-testimonials'], revalidate: 30 },
);

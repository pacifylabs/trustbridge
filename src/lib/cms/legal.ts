import { unstable_cache } from 'next/cache';
import { redis } from './redis';
import { LEGAL_PAGE_SLUGS, type LegalPageInput } from '@/lib/validation/legal';
import { LEGAL_PAGES } from '@/content/legal';
import type { LegalPage } from '@/lib/content/types';

/**
 * Legal page storage.
 *
 * Unlike articles/services/advisers/testimonials, this is an edit-only CMS
 * over a fixed set of pages (privacy policy, regulatory information, and so
 * on) — nobody creates or deletes a legal page, so there is no index, just
 * one optional Redis document per known slug that overrides the bundled
 * placeholder when present.
 */

const legalKey = (slug: string) => `cms:legal:${slug}`;

function requireRedis() {
  if (!redis) {
    throw new Error('Legal pages are not configured: set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }
  return redis;
}

function bundledPage(slug: string): LegalPage | null {
  return LEGAL_PAGES.find((page) => page.slug === slug) ?? null;
}

function toLegalPage(slug: string, input: LegalPageInput): LegalPage {
  return {
    slug,
    title: input.title,
    summary: input.summary,
    sections: input.sections,
    logos: input.logos,
  };
}

function fallbackInput(fallback: LegalPage): LegalPageInput {
  return {
    title: fallback.title,
    summary: fallback.summary,
    sections: fallback.sections.map((section) => ({ ...section })),
    logos: (fallback.logos ?? []).map((logo) => ({ ...logo })),
  };
}

/** The stored override for a page, if an editor has changed it, else its bundled placeholder as an input shape. */
export async function getLegalPageForAdmin(slug: string): Promise<LegalPageInput | null> {
  const fallback = bundledPage(slug);
  if (!fallback) return null;

  if (!redis) return fallbackInput(fallback);

  const stored = await requireRedis().get<LegalPageInput>(legalKey(slug));
  return stored ?? fallbackInput(fallback);
}

export async function listAllLegalPagesForAdmin(): Promise<readonly { slug: string; title: string }[]> {
  if (!redis) return LEGAL_PAGES.map((page) => ({ slug: page.slug, title: page.title }));

  const client = requireRedis();
  const overrides = await Promise.all(
    LEGAL_PAGE_SLUGS.map((slug) => client.get<LegalPageInput>(legalKey(slug))),
  );
  return LEGAL_PAGE_SLUGS.map((slug, index) => ({
    slug,
    title: overrides[index]?.title ?? bundledPage(slug)!.title,
  }));
}

export async function updateLegalPage(slug: string, input: LegalPageInput): Promise<LegalPage> {
  if (!bundledPage(slug)) {
    throw new Error(`"${slug}" is not a recognised legal page.`);
  }
  await requireRedis().set(legalKey(slug), input);
  return toLegalPage(slug, input);
}

async function readPublishedLegalPagesUncached(): Promise<readonly LegalPage[]> {
  if (!redis) return LEGAL_PAGES;

  const client = requireRedis();
  const overrides = await Promise.all(
    LEGAL_PAGE_SLUGS.map((slug) => client.get<LegalPageInput>(legalKey(slug))),
  );
  return LEGAL_PAGE_SLUGS.map((slug, index) => {
    const override = overrides[index];
    return override ? toLegalPage(slug, override) : bundledPage(slug)!;
  });
}

/**
 * Published legal pages, each either the editor's saved version or the
 * bundled placeholder — never missing, since every slug in the fixed set
 * always resolves to something. Cached for the same reason as the other
 * public content reads — see lib/cms/services.ts.
 */
export const getPublishedLegalPages = unstable_cache(
  readPublishedLegalPagesUncached,
  ['cms-legal-published-v1'],
  { tags: ['cms-legal'], revalidate: 30 },
);

export async function getPublishedLegalPageBySlug(slug: string): Promise<LegalPage | null> {
  const pages = await getPublishedLegalPages();
  return pages.find((page) => page.slug === slug) ?? null;
}

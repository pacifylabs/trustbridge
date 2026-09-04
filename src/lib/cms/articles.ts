import { redis } from './redis';
import { isResourcesLiveFromCms } from './settings';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { ARTICLES } from '@/content/articles';
import type { Article } from '@/lib/content/types';
import { estimateReadingMinutes, type ArticleInput } from '@/lib/validation/article';

/**
 * Article storage (Resources CMS).
 *
 * Each article is a JSON document at `cms:article:<slug>`, indexed by a
 * sorted set (`cms:articles:index`, scored by `publishedAt`) so listing newest
 * first never needs to fetch every document just to sort them.
 *
 * Every write here assumes Redis is configured; callers that can run without
 * it (the public site) use `listPublishedArticles` / `getPublishedArticle`
 * below, which fall back to the bundled sample content instead.
 */

const INDEX_KEY = 'cms:articles:index';
const articleKey = (slug: string) => `cms:article:${slug}`;

function requireRedis() {
  if (!redis) {
    throw new Error(
      'The Resources CMS is not configured: set KV_REST_API_URL and KV_REST_API_TOKEN.',
    );
  }
  return redis;
}

function publishedAtScore(publishedAt: string): number {
  const time = new Date(`${publishedAt}T00:00:00Z`).getTime();
  return Number.isNaN(time) ? Date.now() : time;
}

/** Every article, newest first, regardless of status. For the admin list. */
export async function listAllArticles(): Promise<Article[]> {
  const client = requireRedis();
  const slugs = await client.zrange<string[]>(INDEX_KEY, 0, -1, { rev: true });
  if (slugs.length === 0) return [];

  const articles = await Promise.all(slugs.map((slug) => client.get<Article>(articleKey(slug))));
  return articles.filter((article): article is Article => article !== null);
}

/** A single article regardless of status, for the admin editor. */
export async function getArticleForAdmin(slug: string): Promise<Article | null> {
  return requireRedis().get<Article>(articleKey(slug));
}

export async function articleSlugExists(slug: string): Promise<boolean> {
  const client = requireRedis();
  return (await client.exists(articleKey(slug))) > 0;
}

async function writeArticle(article: Article): Promise<void> {
  const client = requireRedis();
  await client.set(articleKey(article.slug), article);
  await client.zadd(INDEX_KEY, { score: publishedAtScore(article.publishedAt), member: article.slug });
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  if (await articleSlugExists(input.slug)) {
    throw new Error(`An article with the slug "${input.slug}" already exists.`);
  }

  const body = sanitizeArticleHtml(input.body);
  const article: Article = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    category: input.category,
    publishedAt: input.publishedAt,
    author: input.author,
    readingMinutes: estimateReadingMinutes(body),
    image: input.image,
    body,
    status: input.status,
    isSample: false,
    seo: {
      title: input.seoTitle?.trim() || input.title,
      description: input.seoDescription?.trim() || input.excerpt,
    },
  };

  await writeArticle(article);
  return article;
}

/**
 * Updates an article. `originalSlug` lets the slug itself change on edit: the
 * old key and index entry are removed so a rename does not leave an orphaned
 * duplicate behind.
 */
export async function updateArticle(originalSlug: string, input: ArticleInput): Promise<Article> {
  const client = requireRedis();
  const existing = await getArticleForAdmin(originalSlug);
  if (!existing) {
    throw new Error(`No article found with the slug "${originalSlug}".`);
  }

  if (input.slug !== originalSlug && (await articleSlugExists(input.slug))) {
    throw new Error(`An article with the slug "${input.slug}" already exists.`);
  }

  const body = sanitizeArticleHtml(input.body);
  const article: Article = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    category: input.category,
    publishedAt: input.publishedAt,
    updatedAt: new Date().toISOString().slice(0, 10),
    author: input.author,
    readingMinutes: estimateReadingMinutes(body),
    image: input.image,
    body,
    status: input.status,
    isSample: false,
    seo: {
      title: input.seoTitle?.trim() || input.title,
      description: input.seoDescription?.trim() || input.excerpt,
    },
  };

  if (input.slug !== originalSlug) {
    await client.del(articleKey(originalSlug));
    await client.zrem(INDEX_KEY, originalSlug);
  }

  await writeArticle(article);
  return article;
}

export async function deleteArticle(slug: string): Promise<void> {
  const client = requireRedis();
  await client.del(articleKey(slug));
  await client.zrem(INDEX_KEY, slug);
}

/**
 * Loads the bundled sample articles into Redis, but only when the index is
 * empty. Safe to call repeatedly: it never overwrites real content, so
 * clicking the admin's "Import starter content" button twice does nothing
 * the second time.
 */
export async function seedSampleArticlesIfEmpty(): Promise<number> {
  const client = requireRedis();
  const count = await client.zcard(INDEX_KEY);
  if (count > 0) return 0;

  for (const article of ARTICLES) {
    await writeArticle(article);
  }
  return ARTICLES.length;
}

// --- Public site reads: demo vs CMS, controlled by RESOURCES_DATA_SOURCE ---
//
// The demo set (the three bundled sample articles) is what a fresh deployment
// shows by default, and what `RESOURCES_DATA_SOURCE=demo` shows deliberately
// while the practice is still populating the CMS — including in production,
// so the site can be previewed with something on the page. Switching to
// 'cms' is what actually puts real articles in front of visitors; Redis being
// unconfigured is treated the same as 'demo', as a safety net rather than a
// broken page.

function fallbackPublishedArticles(): Article[] {
  return ARTICLES.filter((article) => article.status === 'published').sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export async function listPublishedArticles(): Promise<readonly Article[]> {
  if (!(await isResourcesLiveFromCms())) return fallbackPublishedArticles();

  const all = await listAllArticles();
  return all
    .filter((article) => article.status === 'published')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPublishedArticle(slug: string): Promise<Article | null> {
  if (!(await isResourcesLiveFromCms())) {
    const article = fallbackPublishedArticles().find((entry) => entry.slug === slug);
    return article ?? null;
  }

  const article = await getArticleForAdmin(slug);
  if (!article || article.status !== 'published') return null;
  return article;
}

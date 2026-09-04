import { z } from 'zod';
import type { ArticleCategory } from '@/lib/content/types';

/** Kept in sync with `ArticleCategory` in `lib/content/types.ts`. */
export const ARTICLE_CATEGORIES = [
  'Working with us',
  'Immigration updates',
  'Guides',
  'Practice news',
] as const satisfies readonly ArticleCategory[];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Strips tags for a plain-text view: word counting, "is this actually empty" checks. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const articleImageSchema = z.object({
  src: z.string().min(1, 'Upload an image or remove this field.'),
  alt: z.string().trim().min(1, 'Please describe the image for screen readers.').max(160),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/**
 * Article schema (Resources CMS).
 *
 * Used by the CMS form and the API route that backs it, the same way the
 * enquiry schema is shared between the public form and its route handler:
 * client-side validation is a convenience, the server revalidates because
 * anything arriving over the network is untrusted.
 *
 * `body` is rich-text HTML from the editor. It is re-sanitized server-side
 * before storage (`lib/sanitize.ts`) regardless of what passes validation
 * here — this schema only checks that something real was written, not that
 * the markup is safe.
 */
export const articleInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'The slug must be at least 3 characters.')
    .max(100, 'Keep the slug under 100 characters.')
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and hyphens only, e.g. my-article-title.'),
  title: z
    .string()
    .trim()
    .min(3, 'Please enter a title.')
    .max(150, 'Keep the title under 150 characters.'),
  excerpt: z
    .string()
    .trim()
    .min(10, 'Please write a short excerpt.')
    .max(300, 'Keep the excerpt under 300 characters.'),
  category: z.enum(ARTICLE_CATEGORIES),
  author: z
    .string()
    .trim()
    .min(1, 'Please enter an author name.')
    .max(120)
    .default('TrustBridge Immigration Services'),
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date field provided.'),
  status: z.enum(['draft', 'published']),
  image: articleImageSchema.optional(),
  body: z
    .string()
    .refine((html) => stripHtml(html).length > 0, 'Write something in the body.'),
  seoTitle: z.string().trim().max(150).optional(),
  seoDescription: z.string().trim().max(200).optional(),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export type ArticleFieldErrors = Partial<Record<string, string>>;

export function collectArticleFieldErrors(error: z.ZodError): ArticleFieldErrors {
  const errors: ArticleFieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !(path in errors)) errors[path] = issue.message;
  }
  return errors;
}

/** ~200 words/minute, rounded up so a short piece never reads as "0 minutes". */
export function estimateReadingMinutes(bodyHtml: string): number {
  const words = stripHtml(bodyHtml).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

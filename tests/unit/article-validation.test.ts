import { describe, expect, it } from 'vitest';
import {
  articleInputSchema,
  collectArticleFieldErrors,
  estimateReadingMinutes,
  slugify,
} from '@/lib/validation/article';

/**
 * Article schema (Resources CMS).
 *
 * Mirrors the enquiry validation tests: the same schema runs client-side in
 * the CMS form and server-side in the route handler, so these cover both.
 * `body` is rich-text HTML from the editor — see RichTextEditor.tsx — not
 * validated for safe markup here (that is `lib/sanitize.ts`'s job on write),
 * only checked for having actual content in it.
 */

const VALID = {
  slug: 'how-we-handle-your-documents',
  title: 'How we handle your documents',
  excerpt: 'A short note on storage, access and retention.',
  category: 'Guides',
  author: 'TrustBridge Immigration Services',
  publishedAt: '2026-06-30',
  status: 'published',
  body: '<p>Some careful, useful words.</p>',
};

describe('article schema', () => {
  it('accepts a complete, valid article', () => {
    expect(articleInputSchema.safeParse(VALID).success).toBe(true);
  });

  it('rejects a slug with uppercase or spaces', () => {
    expect(articleInputSchema.safeParse({ ...VALID, slug: 'Not A Slug' }).success).toBe(false);
  });

  it('rejects an empty body', () => {
    expect(articleInputSchema.safeParse({ ...VALID, body: '' }).success).toBe(false);
  });

  it('rejects a body that is only empty markup', () => {
    expect(articleInputSchema.safeParse({ ...VALID, body: '<p></p><p><br></p>' }).success).toBe(false);
  });

  it('rejects a category outside the published list', () => {
    expect(articleInputSchema.safeParse({ ...VALID, category: 'Breaking news' }).success).toBe(false);
  });

  it('accepts headings, lists, links and formatting mixed with paragraphs', () => {
    const result = articleInputSchema.safeParse({
      ...VALID,
      body:
        '<h2>A heading</h2><p>A <strong>paragraph</strong> with an <a href="https://example.com">example link</a>.</p>' +
        '<ul><li>One</li><li>Two</li></ul>',
    });
    expect(result.success).toBe(true);
  });

  it('reports one error per field', () => {
    const result = articleInputSchema.safeParse({ ...VALID, slug: '', title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = collectArticleFieldErrors(result.error);
      expect(errors.slug).toBeTruthy();
      expect(errors.title).toBeTruthy();
    }
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('How We Handle Your Documents')).toBe('how-we-handle-your-documents');
  });

  it('strips punctuation', () => {
    expect(slugify("What's Next? A Guide.")).toBe('what-s-next-a-guide');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Hello--  ')).toBe('hello');
  });
});

describe('estimateReadingMinutes', () => {
  it('never reports zero minutes for a short piece', () => {
    expect(estimateReadingMinutes('<p>Short.</p>')).toBeGreaterThanOrEqual(1);
  });

  it('counts words across headings, paragraphs and lists, ignoring markup', () => {
    const body =
      '<h2>A heading with four words</h2>' +
      `<p>${'a '.repeat(199).trim()}</p>` +
      '<ul><li>one two three</li></ul>';
    // ~205 words at 200 wpm rounds to about 1 minute.
    expect(estimateReadingMinutes(body)).toBe(1);
  });

  it('scales up for a long piece', () => {
    const body = `<p>${'word '.repeat(1000).trim()}</p>`;
    expect(estimateReadingMinutes(body)).toBe(5);
  });
});

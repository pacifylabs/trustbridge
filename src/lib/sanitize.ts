import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes rich-text article HTML before it is stored or rendered.
 *
 * Applied on write (the CMS API route) and again on read (the public article
 * page): the write-time pass is the authoritative gate, but sanitizing again
 * at render time is cheap insurance against any future write path — a
 * migration script, a direct Redis edit — that bypasses it.
 *
 * The allow-list matches exactly what the editor's toolbar can produce
 * (StarterKit + a link extension), nothing more: no images, no raw HTML
 * blocks, no scripts or event handlers.
 *
 * Uses `sanitize-html` rather than `isomorphic-dompurify`: the latter's
 * server-side path loads jsdom, and a transitive jsdom dependency
 * (html-encoding-sniffer's ESM build) fails to load under Vercel's
 * serverless bundling — it built and ran fine locally, but crashed every
 * request that touched an article (both the CMS and the public page) in
 * production. `sanitize-html` does the same allow-list sanitisation with a
 * plain HTML parser and no browser emulation, so it has no such dependency.
 */
const ALLOWED_TAGS = [
  'p',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'a',
  'strong',
  'em',
  'blockquote',
  'br',
  'code',
];

const ALLOWED_ATTR = ['href', 'target', 'rel'];

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ALLOWED_ATTR },
  }).trim();
}

import DOMPurify from 'isomorphic-dompurify';

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
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR }).trim();
}

import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/content/site';
import { SERVICES } from '@/content/services';
import { ARTICLES } from '@/content/articles';

/**
 * Metadata and share cards.
 *
 * The file checks matter as much as the shape ones: a share card that 404s
 * fails silently, and nobody notices until a link is posted somewhere public.
 */

describe('buildMetadata', () => {
  const meta = buildMetadata({
    title: 'Visitor visas',
    description: 'Support for standard visitor applications.',
    path: '/services/visitor-visas',
  });

  it('sets a canonical URL from the path', () => {
    expect(meta.alternates?.canonical).toBe('/services/visitor-visas');
  });

  it('produces an Open Graph block with an absolute-resolvable image', () => {
    const images = meta.openGraph?.images as { url: string }[];
    expect(images[0]?.url).toBe(SITE.ogImage.path);
    expect(meta.openGraph?.siteName).toBe(SITE.name);
    expect(meta.openGraph?.locale).toBe(SITE.locale);
  });

  it('produces a large-image Twitter card', () => {
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('carries article timestamps only for articles', () => {
    const article = buildMetadata({
      title: 'A note',
      description: 'Something.',
      path: '/resources/a-note',
      type: 'article',
      publishedTime: '2026-06-30',
    });

    expect(article.openGraph).toMatchObject({ type: 'article', publishedTime: '2026-06-30' });
    expect(meta.openGraph).not.toHaveProperty('publishedTime');
  });

  it('uses a supplied image over the site default', () => {
    const custom = buildMetadata({
      title: 'X',
      description: 'Y',
      path: '/x',
      image: { src: '/og/x.jpg', alt: 'X' },
    });

    expect((custom.openGraph?.images as { url: string }[])[0]?.url).toBe('/og/x.jpg');
  });
});

describe('share card files', () => {
  const publicDir = path.join(process.cwd(), 'public');

  it('ships the site share card at the standard size', () => {
    const file = path.join(publicDir, SITE.ogImage.path);
    expect(fs.existsSync(file), SITE.ogImage.path).toBe(true);
    expect(SITE.ogImage.width).toBe(1200);
    expect(SITE.ogImage.height).toBe(630);
  });

  it('ships a card for every published service', () => {
    for (const service of SERVICES) {
      const file = path.join(publicDir, 'og', `${service.slug}.jpg`);
      expect(fs.existsSync(file), service.slug).toBe(true);
    }
  });

  it('ships a card for every article', () => {
    for (const article of ARTICLES) {
      const file = path.join(publicDir, 'og', `${article.slug}.jpg`);
      expect(fs.existsSync(file), article.slug).toBe(true);
    }
  });

  it('uses JPEG rather than WebP for share cards', () => {
    // Several platforms, Facebook included, will not render a WebP og:image.
    for (const file of fs.readdirSync(path.join(publicDir, 'og'))) {
      expect(file, file).toMatch(/\.jpe?g$/);
    }
    expect(SITE.ogImage.path).toMatch(/\.jpe?g$/);
  });

  it('keeps every card under the size platforms will fetch', () => {
    const files = [
      path.join(publicDir, SITE.ogImage.path),
      ...fs.readdirSync(path.join(publicDir, 'og')).map((f) => path.join(publicDir, 'og', f)),
    ];

    for (const file of files) {
      // Comfortably inside the 5MB most crawlers cap at, and small enough to
      // fetch quickly when a link is first pasted.
      expect(fs.statSync(file).size, path.basename(file)).toBeLessThan(1_000_000);
    }
  });
});

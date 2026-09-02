import type { Metadata } from 'next';
import { SITE } from '@/content/site';

/**
 * Builds a page's metadata.
 *
 * Every page needs the same four things: a canonical URL, an Open Graph block,
 * a Twitter card and a share image. Assembling them here means a new page gets
 * all four by supplying a title, a description and a path, and the share card
 * cannot silently go missing on one route because someone wrote the metadata
 * object by hand.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  /** Route path, leading slash, no origin. */
  path: string;
  /** Overrides the site-wide share image, for pages with their own artwork. */
  image?: { readonly src: string; readonly alt: string };
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const url = `${SITE.url}${path}`;
  const shareImage = image
    ? { url: image.src, alt: image.alt }
    : {
        url: SITE.ogImage.path,
        width: SITE.ogImage.width,
        height: SITE.ogImage.height,
        alt: SITE.ogImage.alt,
      };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: SITE.locale,
      siteName: SITE.name,
      url,
      title: `${title} | ${SITE.shortName}`,
      description,
      images: [shareImage],
      ...(type === 'article' ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE.shortName}`,
      description,
      images: [{ url: shareImage.url, alt: shareImage.alt }],
    },
  };
}

import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { SITE } from '@/content/site';
import { THEME_ATTRIBUTE, themeInitScript } from '@/lib/theme';
import { env } from '@/lib/env';
import './globals.css';

/**
 * Fonts are self-hosted: next/font downloads them at build time, so no request
 * ever leaves the visitor's browser for a third-party font host. That keeps
 * the content security policy tight and avoids a cookie-consent question.
 *
 * Fraunces is pinned to SOFT=0 and WONK=0 for a restrained cut appropriate to
 * a professional services practice.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.shortName,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  keywords: [
    'UK immigration advice',
    'immigration adviser',
    'spouse visa',
    'skilled worker visa',
    'settlement and ILR',
    'British citizenship',
    'EU Settlement Scheme',
  ],
  alternates: { canonical: '/' },
  formatDetection: { telephone: true, address: false, email: true },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage.path,
        width: SITE.ogImage.width,
        height: SITE.ogImage.height,
        alt: SITE.ogImage.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: SITE.ogImage.path, alt: SITE.ogImage.alt }],
  },
  robots: {
    // Nothing is indexed until the client approves launch (README rule 3).
    index: env.SITE_LAUNCHED,
    follow: env.SITE_LAUNCHED,
    googleBot: {
      index: env.SITE_LAUNCHED,
      follow: env.SITE_LAUNCHED,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1b30' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable}`}
      {...{ [THEME_ATTRIBUTE]: 'light' }}
    >
      <head>
        {/* Applies the stored theme before first paint, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

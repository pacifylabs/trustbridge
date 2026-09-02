import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

import { OrganisationSchema, WebSiteSchema } from '@/components/seo/StructuredData';
import { getVisibleServices } from '@/lib/content';

/**
 * Shell for every public page.
 *
 * The navigation and footer are built from the same visible-services list the
 * pages use, so a feature-gated service can never appear in a menu while its
 * page returns a 404.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const services = await getVisibleServices();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2.5 focus:font-semibold focus:text-accent-contrast"
      >
        Skip to content
      </a>
      <OrganisationSchema />
      <WebSiteSchema />
      <SiteHeader services={services} />
      <main id="main">{children}</main>
      <SiteFooter services={services} />

    </>
  );
}

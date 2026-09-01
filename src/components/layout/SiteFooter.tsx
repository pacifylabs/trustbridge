import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { CONTACT, LEGAL_NAV, PRIMARY_NAV, REGULATORY_PLACEHOLDER, SITE } from '@/content/site';

export interface FooterService {
  readonly slug: string;
  readonly shortTitle: string;
}

/**
 * Site footer.
 *
 * The brand column is wider than the link columns, which is what stops four
 * equal columns leaving the description cramped and the link lists sparse.
 * Below `lg` the link groups become their own two or three column grid; at
 * `lg` they use `contents` so each group becomes a direct child of the outer
 * grid and lines up with the brand column, rather than nesting a second grid
 * whose gutters never quite match the first.
 *
 * Includes the regulatory information region required by the design system
 * (§4). It is deliberately empty of any claim: no badge, no logo of a
 * regulator, no statement of authorisation until the client supplies final
 * wording (README rule 2).
 */
export function SiteFooter({ services }: { services: readonly FooterService[] }) {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Services',
      links: services.map((service) => ({
        label: service.shortTitle,
        href: `/services/${service.slug}`,
      })),
    },
    {
      heading: 'Practice',
      links: PRIMARY_NAV.map((item) => ({ label: item.label, href: item.href })),
    },
    {
      heading: 'Legal',
      links: LEGAL_NAV.map((item) => ({ label: item.label, href: item.href })),
    },
  ];

  return (
    <footer className="border-t border-border-subtle bg-surface-inverse text-inverse">
      <div className="container-site py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label={`${SITE.name} home`} className="self-start">
              <Image
                src="/logo.png"
                alt={SITE.name}
                width={2172}
                height={724}
                className="site-logo-inverse h-10 w-auto sm:h-11"
              />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-inverse-muted">
              {SITE.description}
            </p>

            <ul className="flex flex-col gap-1">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex min-h-9 items-center gap-2.5 text-sm text-inverse transition-colors hover:text-accent"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phoneHref}`}
                  className="inline-flex min-h-9 items-center gap-2.5 text-sm text-inverse transition-colors hover:text-accent"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {CONTACT.phone}
                </a>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:contents">
            {columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading} className="flex min-w-0 flex-col gap-2">
                <h2 className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                  {column.heading}
                </h2>
                <ul className="flex flex-col">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex min-h-8 items-center text-sm text-inverse-muted transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div
          className="mt-8 rounded-xl border border-border-inverse p-4 sm:p-5"
          data-testid="regulatory-placeholder"
        >
          <p className="text-sm font-semibold text-inverse">{REGULATORY_PLACEHOLDER.heading}</p>
          <p className="mt-1 text-sm leading-relaxed text-inverse-muted">
            {REGULATORY_PLACEHOLDER.body}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-1 border-t border-border-inverse pt-5 text-sm text-inverse-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p>
            Registered in {SITE.incorporatedIn}, company number {SITE.companyNumber}.
          </p>
        </div>
      </div>
    </footer>
  );
}

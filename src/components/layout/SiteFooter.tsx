import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { CONTACT, LEGAL_NAV, PRIMARY_NAV, SITE } from '@/content/site';

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
 * Carries no regulatory badge, no logo of a regulator and no statement of
 * authorisation (README rule 2). The dedicated legal page is where that
 * information will live once the practice supplies it.
 */
export function SiteFooter({ services }: { services: readonly FooterService[] }) {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Services',
      // A short list plus a way through to the rest. Repeating all nine here
      // was the main reason the footer felt crowded.
      links: [
        ...services.slice(0, 4).map((service) => ({
          label: service.shortTitle,
          href: `/services/${service.slug}`,
        })),
        { label: 'All services', href: '/services' },
      ],
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
    <footer className="border-t border-border-subtle bg-surface text-body">
      <div className="container-site py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label={`${SITE.name} home`} className="self-start">
              <Image
                src="/logo.png"
                alt={SITE.name}
                width={2172}
                height={724}
                className="site-logo h-10 w-auto sm:h-11"
              />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-muted">
              {SITE.description}
            </p>

            <ul className="flex flex-col gap-1">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex min-h-9 items-center gap-2.5 text-sm text-strong transition-colors hover:text-accent"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phoneHref}`}
                  className="inline-flex min-h-9 items-center gap-2.5 text-sm text-strong transition-colors hover:text-accent"
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
                <ul className="flex flex-col gap-1">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex min-h-7 items-center text-sm text-muted transition-colors hover:text-accent"
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


        <div className="mt-12 flex flex-col gap-1 border-t border-border-subtle pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
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
